const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const pdfService = require('../services/pdfService');

const router = express.Router();

/**
 * GET /api/sales - Get all sales
 * Query params: startDate, endDate, limit, offset
 */
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate, limit = 50, offset = 0 } = req.query;
    
    let queryText = `
      SELECT s.*, 
             COUNT(si.id) as item_count,
             ARRAY_AGG(
               JSON_BUILD_OBJECT(
                 'item_name', i.name,
                 'quantity', si.quantity,
                 'unit_price', si.unit_price,
                 'total_price', si.total_price
               )
             ) as items
      FROM sales s
      LEFT JOIN sale_items si ON s.id = si.sale_id
      LEFT JOIN items i ON si.item_id = i.id
      WHERE 1=1
    `;
    
    const queryParams = [];
    let paramCount = 0;

    // Add date filters
    if (startDate) {
      queryText += ` AND s.created_at >= $${++paramCount}`;
      queryParams.push(startDate);
    }

    if (endDate) {
      queryText += ` AND s.created_at <= $${++paramCount}`;
      queryParams.push(endDate);
    }

    queryText += `
      GROUP BY s.id
      ORDER BY s.created_at DESC
      LIMIT $${++paramCount} OFFSET $${++paramCount}
    `;
    
    queryParams.push(limit, offset);

    const result = await query(queryText, queryParams);
    
    res.json({
      success: true,
      data: result.rows,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        count: result.rows.length
      }
    });
  } catch (error) {
    console.error('❌ Get sales error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch sales' 
    });
  }
});

/**
 * GET /api/sales/:id - Get single sale
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get sale details
    const saleResult = await query('SELECT * FROM sales WHERE id = $1', [id]);
    
    if (saleResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Sale not found' 
      });
    }

    // Get sale items
    const itemsResult = await query(`
      SELECT si.*, i.name as item_name, i.category
      FROM sale_items si
      JOIN items i ON si.item_id = i.id
      WHERE si.sale_id = $1
    `, [id]);

    res.json({
      success: true,
      data: {
        ...saleResult.rows[0],
        items: itemsResult.rows
      }
    });
  } catch (error) {
    console.error('❌ Get sale error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch sale' 
    });
  }
});

/**
 * POST /api/sales - Create new sale
 */
router.post('/', [
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.item_id').isInt().withMessage('Valid item ID is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Valid quantity is required'),
  body('payment_method').optional().isIn(['cash', 'card', 'upi', 'other']).withMessage('Invalid payment method')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const {
      items,
      customer_name,
      customer_phone,
      payment_method = 'cash'
    } = req.body;

    // Start transaction
    const client = await require('../config/database').pool.connect();
    
    try {
      await client.query('BEGIN');

      // Validate items and calculate total
      let totalAmount = 0;
      const validatedItems = [];

      for (const saleItem of items) {
        // Get item details
        const itemResult = await client.query(
          'SELECT * FROM items WHERE id = $1',
          [saleItem.item_id]
        );

        if (itemResult.rows.length === 0) {
          throw new Error(`Item with ID ${saleItem.item_id} not found`);
        }

        const item = itemResult.rows[0];

        // Check stock availability
        if (item.quantity < saleItem.quantity) {
          throw new Error(`Insufficient stock for ${item.name}. Available: ${item.quantity}, Requested: ${saleItem.quantity}`);
        }

        const itemTotal = item.unit_price * saleItem.quantity;
        totalAmount += itemTotal;

        validatedItems.push({
          ...saleItem,
          item: item,
          unit_price: item.unit_price,
          total_price: itemTotal
        });
      }

      // Create sale record
      const saleResult = await client.query(`
        INSERT INTO sales (total_amount, customer_name, customer_phone, payment_method)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `, [totalAmount, customer_name, customer_phone, payment_method]);

      const saleId = saleResult.rows[0].id;

      // Create sale items and update inventory
      for (const validatedItem of validatedItems) {
        // Insert sale item
        await client.query(`
          INSERT INTO sale_items (sale_id, item_id, quantity, unit_price, total_price)
          VALUES ($1, $2, $3, $4, $5)
        `, [
          saleId,
          validatedItem.item_id,
          validatedItem.quantity,
          validatedItem.unit_price,
          validatedItem.total_price
        ]);

        // Update inventory quantity
        await client.query(`
          UPDATE items 
          SET quantity = quantity - $1, updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
        `, [validatedItem.quantity, validatedItem.item_id]);
      }

      // Generate PDF bill
      const billPdfUrl = await pdfService.generateCustomerBill(
        saleResult.rows[0],
        validatedItems
      );

      // Update sale with PDF URL
      await client.query(
        'UPDATE sales SET bill_pdf_url = $1 WHERE id = $2',
        [billPdfUrl, saleId]
      );

      await client.query('COMMIT');

      // Get complete sale data for response
      const completeSale = await query(`
        SELECT s.*, 
               ARRAY_AGG(
                 JSON_BUILD_OBJECT(
                   'item_name', i.name,
                   'quantity', si.quantity,
                   'unit_price', si.unit_price,
                   'total_price', si.total_price
                 )
               ) as items
        FROM sales s
        LEFT JOIN sale_items si ON s.id = si.sale_id
        LEFT JOIN items i ON si.item_id = i.id
        WHERE s.id = $1
        GROUP BY s.id
      `, [saleId]);

      res.status(201).json({
        success: true,
        data: {
          ...completeSale.rows[0],
          bill_pdf_url: billPdfUrl
        },
        message: 'Sale completed successfully'
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('❌ Create sale error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to create sale' 
    });
  }
});

/**
 * GET /api/sales/stats/summary - Get sales summary
 */
router.get('/stats/summary', async (req, res) => {
  try {
    const { period = 'today' } = req.query;
    
    let dateFilter = '';
    const now = new Date();
    
    switch (period) {
      case 'today':
        dateFilter = `AND DATE(created_at) = CURRENT_DATE`;
        break;
      case 'week':
        dateFilter = `AND created_at >= DATE_TRUNC('week', CURRENT_DATE)`;
        break;
      case 'month':
        dateFilter = `AND created_at >= DATE_TRUNC('month', CURRENT_DATE)`;
        break;
      case 'year':
        dateFilter = `AND created_at >= DATE_TRUNC('year', CURRENT_DATE)`;
        break;
    }

    // Get sales summary
    const summaryResult = await query(`
      SELECT 
        COUNT(*) as total_sales,
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COALESCE(AVG(total_amount), 0) as average_sale
      FROM sales 
      WHERE 1=1 ${dateFilter}
    `);

    // Get top selling items
    const topItemsResult = await query(`
      SELECT 
        i.name,
        i.category,
        SUM(si.quantity) as total_sold,
        SUM(si.total_price) as total_revenue
      FROM sale_items si
      JOIN items i ON si.item_id = i.id
      JOIN sales s ON si.sale_id = s.id
      WHERE 1=1 ${dateFilter}
      GROUP BY i.id, i.name, i.category
      ORDER BY total_sold DESC
      LIMIT 10
    `);

    // Get daily sales for chart (last 7 days)
    const dailySalesResult = await query(`
      SELECT 
        DATE(created_at) as sale_date,
        COUNT(*) as sales_count,
        SUM(total_amount) as daily_revenue
      FROM sales
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY sale_date DESC
    `);

    res.json({
      success: true,
      data: {
        summary: summaryResult.rows[0],
        topItems: topItemsResult.rows,
        dailySales: dailySalesResult.rows,
        period: period
      }
    });
  } catch (error) {
    console.error('❌ Get sales stats error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch sales statistics' 
    });
  }
});

/**
 * DELETE /api/sales/:id - Delete sale (admin only)
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Start transaction to restore inventory
    const client = await require('../config/database').pool.connect();
    
    try {
      await client.query('BEGIN');

      // Get sale items to restore inventory
      const saleItemsResult = await client.query(`
        SELECT si.item_id, si.quantity
        FROM sale_items si
        WHERE si.sale_id = $1
      `, [id]);

      // Restore inventory quantities
      for (const saleItem of saleItemsResult.rows) {
        await client.query(`
          UPDATE items 
          SET quantity = quantity + $1, updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
        `, [saleItem.quantity, saleItem.item_id]);
      }

      // Delete sale (cascade will delete sale_items)
      const deleteResult = await client.query(
        'DELETE FROM sales WHERE id = $1 RETURNING *',
        [id]
      );

      if (deleteResult.rows.length === 0) {
        throw new Error('Sale not found');
      }

      await client.query('COMMIT');

      res.json({
        success: true,
        message: 'Sale deleted and inventory restored'
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('❌ Delete sale error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to delete sale' 
    });
  }
});

module.exports = router;