const express = require('express');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const geminiService = require('../services/geminiService');
const s3Service = require('../services/s3Service');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images and PDFs
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only image and PDF files are allowed'), false);
    }
  }
});

/**
 * GET /api/inventory - Get all inventory items
 * Query params: category, search, lowStock
 */
router.get('/', async (req, res) => {
  try {
    const { category, search, lowStock } = req.query;
    let queryText = 'SELECT * FROM items WHERE 1=1';
    const queryParams = [];
    let paramCount = 0;

    // Add filters
    if (category) {
      queryText += ` AND category = $${++paramCount}`;
      queryParams.push(category);
    }

    if (search) {
      queryText += ` AND name ILIKE $${++paramCount}`;
      queryParams.push(`%${search}%`);
    }

    if (lowStock === 'true') {
      queryText += ` AND quantity <= low_stock_threshold`;
    }

    queryText += ' ORDER BY name ASC';

    const result = await query(queryText, queryParams);
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('❌ Get inventory error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch inventory' 
    });
  }
});

/**
 * GET /api/inventory/:id - Get single item
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query('SELECT * FROM items WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Item not found' 
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Get item error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch item' 
    });
  }
});

/**
 * POST /api/inventory - Add new item manually
 */
router.post('/', [
  body('name').notEmpty().withMessage('Item name is required'),
  body('unit_price').isFloat({ min: 0 }).withMessage('Valid unit price is required'),
  body('quantity').isInt({ min: 0 }).withMessage('Valid quantity is required')
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
      name,
      category,
      quantity,
      unit_price,
      cost_price,
      low_stock_threshold,
      barcode,
      description
    } = req.body;

    const result = await query(`
      INSERT INTO items (name, category, quantity, unit_price, cost_price, low_stock_threshold, barcode, description)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [name, category, quantity, unit_price, cost_price, low_stock_threshold || 10, barcode, description]);

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Item added successfully'
    });
  } catch (error) {
    console.error('❌ Add item error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to add item' 
    });
  }
});

/**
 * PUT /api/inventory/:id - Update item
 */
router.put('/:id', [
  body('name').notEmpty().withMessage('Item name is required'),
  body('unit_price').isFloat({ min: 0 }).withMessage('Valid unit price is required'),
  body('quantity').isInt({ min: 0 }).withMessage('Valid quantity is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { id } = req.params;
    const {
      name,
      category,
      quantity,
      unit_price,
      cost_price,
      low_stock_threshold,
      barcode,
      description
    } = req.body;

    const result = await query(`
      UPDATE items 
      SET name = $1, category = $2, quantity = $3, unit_price = $4, 
          cost_price = $5, low_stock_threshold = $6, barcode = $7, 
          description = $8, updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING *
    `, [name, category, quantity, unit_price, cost_price, low_stock_threshold, barcode, description, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Item not found' 
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Item updated successfully'
    });
  } catch (error) {
    console.error('❌ Update item error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update item' 
    });
  }
});

/**
 * DELETE /api/inventory/:id - Delete item
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query('DELETE FROM items WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Item not found' 
      });
    }

    res.json({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete item error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete item' 
    });
  }
});

/**
 * POST /api/inventory/process-bill - Process purchase bill with AI
 */
router.post('/process-bill', upload.single('billImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'Bill image is required' 
      });
    }

    console.log(`📄 Processing bill: ${req.file.originalname} (${req.file.size} bytes)`);

    // Upload image to S3 first
    const imageUrl = await s3Service.uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      'bills'
    );

    // Process with Gemini AI
    const billData = await geminiService.processBillImage(
      req.file.buffer,
      req.file.mimetype
    );

    // Save bill record
    const billResult = await query(`
      INSERT INTO purchase_bills (vendor_name, bill_number, total_amount, bill_image_url, processed_data)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [
      billData.vendor || '',
      billData.billNumber || '',
      billData.grandTotal || 0,
      imageUrl,
      JSON.stringify(billData)
    ]);

    const billId = billResult.rows[0].id;

    // Process each item
    const processedItems = [];
    
    for (const item of billData.items) {
      try {
        // Check if item exists
        const existingItem = await query(
          'SELECT * FROM items WHERE name ILIKE $1',
          [item.item]
        );

        let itemRecord;
        
        if (existingItem.rows.length > 0) {
          // Update existing item quantity
          const updateResult = await query(`
            UPDATE items 
            SET quantity = quantity + $1, 
                cost_price = $2,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $3
            RETURNING *
          `, [item.quantity, item.price, existingItem.rows[0].id]);
          
          itemRecord = updateResult.rows[0];
        } else {
          // Create new item
          const insertResult = await query(`
            INSERT INTO items (name, quantity, unit_price, cost_price)
            VALUES ($1, $2, $3, $4)
            RETURNING *
          `, [item.item, item.quantity, item.price, item.price]);
          
          itemRecord = insertResult.rows[0];
        }

        // Record purchase item
        await query(`
          INSERT INTO purchase_items (bill_id, item_id, quantity, unit_price, total_price)
          VALUES ($1, $2, $3, $4, $5)
        `, [billId, itemRecord.id, item.quantity, item.price, item.total]);

        processedItems.push({
          ...itemRecord,
          purchased_quantity: item.quantity,
          purchase_price: item.price
        });

      } catch (itemError) {
        console.error(`❌ Error processing item "${item.item}":`, itemError);
      }
    }

    res.json({
      success: true,
      data: {
        bill: billResult.rows[0],
        items: processedItems,
        summary: {
          totalItems: billData.items.length,
          processedItems: processedItems.length,
          vendor: billData.vendor,
          totalAmount: billData.grandTotal
        }
      },
      message: `Successfully processed ${processedItems.length} items from bill`
    });

  } catch (error) {
    console.error('❌ Bill processing error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to process bill' 
    });
  }
});

/**
 * GET /api/inventory/categories - Get all categories
 */
router.get('/meta/categories', async (req, res) => {
  try {
    const result = await query(`
      SELECT DISTINCT category 
      FROM items 
      WHERE category IS NOT NULL AND category != ''
      ORDER BY category
    `);

    res.json({
      success: true,
      data: result.rows.map(row => row.category)
    });
  } catch (error) {
    console.error('❌ Get categories error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch categories' 
    });
  }
});

/**
 * GET /api/inventory/low-stock - Get low stock items
 */
router.get('/alerts/low-stock', async (req, res) => {
  try {
    const result = await query(`
      SELECT * FROM items 
      WHERE quantity <= low_stock_threshold
      ORDER BY quantity ASC
    `);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('❌ Get low stock error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch low stock items' 
    });
  }
});

module.exports = router;