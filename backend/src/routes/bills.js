const express = require('express');
const { query } = require('../config/database');

const router = express.Router();

/**
 * GET /api/bills/purchase - Get all purchase bills
 */
router.get('/purchase', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    const result = await query(`
      SELECT pb.*, 
             COUNT(pi.id) as item_count,
             ARRAY_AGG(
               JSON_BUILD_OBJECT(
                 'item_name', i.name,
                 'quantity', pi.quantity,
                 'unit_price', pi.unit_price,
                 'total_price', pi.total_price
               )
             ) FILTER (WHERE pi.id IS NOT NULL) as items
      FROM purchase_bills pb
      LEFT JOIN purchase_items pi ON pb.id = pi.bill_id
      LEFT JOIN items i ON pi.item_id = i.id
      GROUP BY pb.id
      ORDER BY pb.created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

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
    console.error('❌ Get purchase bills error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch purchase bills' 
    });
  }
});

/**
 * GET /api/bills/purchase/:id - Get single purchase bill
 */
router.get('/purchase/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const billResult = await query('SELECT * FROM purchase_bills WHERE id = $1', [id]);
    
    if (billResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Purchase bill not found' 
      });
    }

    const itemsResult = await query(`
      SELECT pi.*, i.name as item_name, i.category
      FROM purchase_items pi
      JOIN items i ON pi.item_id = i.id
      WHERE pi.bill_id = $1
    `, [id]);

    res.json({
      success: true,
      data: {
        ...billResult.rows[0],
        items: itemsResult.rows
      }
    });
  } catch (error) {
    console.error('❌ Get purchase bill error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch purchase bill' 
    });
  }
});

/**
 * GET /api/bills/sales - Get all sales bills
 */
router.get('/sales', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    const result = await query(`
      SELECT id, customer_name, customer_phone, total_amount, 
             payment_method, bill_pdf_url, created_at
      FROM sales
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

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
    console.error('❌ Get sales bills error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch sales bills' 
    });
  }
});

module.exports = router;