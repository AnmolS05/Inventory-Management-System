const express = require('express');
const { query } = require('../config/database');
const pdfService = require('../services/pdfService');

const router = express.Router();

/**
 * GET /api/dashboard/overview - Get dashboard overview
 */
router.get('/overview', async (req, res) => {
  try {
    // Get total items and stock value
    const inventoryResult = await query(`
      SELECT 
        COUNT(*) as total_items,
        SUM(quantity) as total_stock,
        SUM(quantity * unit_price) as stock_value,
        COUNT(CASE WHEN quantity <= low_stock_threshold THEN 1 END) as low_stock_items
      FROM items
    `);

    // Get today's sales
    const todaySalesResult = await query(`
      SELECT 
        COUNT(*) as today_sales,
        COALESCE(SUM(total_amount), 0) as today_revenue
      FROM sales
      WHERE DATE(created_at) = CURRENT_DATE
    `);

    // Get this month's sales
    const monthSalesResult = await query(`
      SELECT 
        COUNT(*) as month_sales,
        COALESCE(SUM(total_amount), 0) as month_revenue
      FROM sales
      WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
    `);

    // Get recent activities (last 10 sales and purchases)
    const recentSalesResult = await query(`
      SELECT 'sale' as type, id, total_amount as amount, 
             customer_name as description, created_at
      FROM sales
      ORDER BY created_at DESC
      LIMIT 5
    `);

    const recentPurchasesResult = await query(`
      SELECT 'purchase' as type, id, total_amount as amount,
             vendor_name as description, created_at
      FROM purchase_bills
      ORDER BY created_at DESC
      LIMIT 5
    `);

    // Combine and sort recent activities
    const recentActivities = [...recentSalesResult.rows, ...recentPurchasesResult.rows]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 10);

    res.json({
      success: true,
      data: {
        inventory: inventoryResult.rows[0],
        sales: {
          today: todaySalesResult.rows[0],
          month: monthSalesResult.rows[0]
        },
        recentActivities
      }
    });
  } catch (error) {
    console.error('❌ Dashboard overview error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch dashboard data' 
    });
  }
});

/**
 * GET /api/dashboard/charts/sales - Get sales chart data
 */
router.get('/charts/sales', async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    
    let dateFilter = '';
    let groupBy = '';
    
    switch (period) {
      case 'week':
        dateFilter = `WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'`;
        groupBy = `DATE(created_at)`;
        break;
      case 'month':
        dateFilter = `WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'`;
        groupBy = `DATE(created_at)`;
        break;
      case 'year':
        dateFilter = `WHERE created_at >= CURRENT_DATE - INTERVAL '12 months'`;
        groupBy = `DATE_TRUNC('month', created_at)`;
        break;
      default:
        dateFilter = `WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'`;
        groupBy = `DATE(created_at)`;
    }

    const result = await query(`
      SELECT 
        ${groupBy} as period,
        COUNT(*) as sales_count,
        SUM(total_amount) as revenue
      FROM sales
      ${dateFilter}
      GROUP BY ${groupBy}
      ORDER BY period ASC
    `);

    res.json({
      success: true,
      data: result.rows.map(row => ({
        date: row.period,
        sales: parseInt(row.sales_count),
        revenue: parseFloat(row.revenue)
      }))
    });
  } catch (error) {
    console.error('❌ Sales chart error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch sales chart data' 
    });
  }
});

/**
 * GET /api/dashboard/charts/top-items - Get top selling items
 */
router.get('/charts/top-items', async (req, res) => {
  try {
    const { period = 'month', limit = 10 } = req.query;
    
    let dateFilter = '';
    
    switch (period) {
      case 'week':
        dateFilter = `AND s.created_at >= CURRENT_DATE - INTERVAL '7 days'`;
        break;
      case 'month':
        dateFilter = `AND s.created_at >= CURRENT_DATE - INTERVAL '30 days'`;
        break;
      case 'year':
        dateFilter = `AND s.created_at >= CURRENT_DATE - INTERVAL '12 months'`;
        break;
    }

    const result = await query(`
      SELECT 
        i.name,
        i.category,
        SUM(si.quantity) as total_sold,
        SUM(si.total_price) as total_revenue,
        COUNT(DISTINCT s.id) as order_count
      FROM sale_items si
      JOIN items i ON si.item_id = i.id
      JOIN sales s ON si.sale_id = s.id
      WHERE 1=1 ${dateFilter}
      GROUP BY i.id, i.name, i.category
      ORDER BY total_sold DESC
      LIMIT $1
    `, [limit]);

    res.json({
      success: true,
      data: result.rows.map(row => ({
        name: row.name,
        category: row.category,
        sold: parseInt(row.total_sold),
        revenue: parseFloat(row.total_revenue),
        orders: parseInt(row.order_count)
      }))
    });
  } catch (error) {
    console.error('❌ Top items chart error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch top items data' 
    });
  }
});

/**
 * GET /api/dashboard/reports/inventory - Generate inventory report
 */
router.get('/reports/inventory', async (req, res) => {
  try {
    const { format = 'json' } = req.query;
    
    const result = await query(`
      SELECT 
        name, category, quantity, unit_price, cost_price,
        (quantity * unit_price) as stock_value,
        low_stock_threshold,
        CASE 
          WHEN quantity <= low_stock_threshold THEN 'Low Stock'
          WHEN quantity <= low_stock_threshold * 2 THEN 'Medium Stock'
          ELSE 'Good Stock'
        END as stock_status,
        created_at, updated_at
      FROM items
      ORDER BY name ASC
    `);

    if (format === 'pdf') {
      // Generate PDF report
      const pdfUrl = await pdfService.generateInventoryReport(result.rows);
      
      res.json({
        success: true,
        data: {
          reportUrl: pdfUrl,
          itemCount: result.rows.length
        },
        message: 'Inventory report generated successfully'
      });
    } else {
      // Return JSON data
      res.json({
        success: true,
        data: result.rows,
        summary: {
          totalItems: result.rows.length,
          totalValue: result.rows.reduce((sum, item) => sum + parseFloat(item.stock_value), 0),
          lowStockItems: result.rows.filter(item => item.stock_status === 'Low Stock').length
        }
      });
    }
  } catch (error) {
    console.error('❌ Inventory report error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate inventory report' 
    });
  }
});

/**
 * GET /api/dashboard/reports/sales - Generate sales report
 */
router.get('/reports/sales', async (req, res) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;
    
    let dateFilter = '';
    const queryParams = [];
    let paramCount = 0;

    if (startDate) {
      dateFilter += ` AND s.created_at >= $${++paramCount}`;
      queryParams.push(startDate);
    }

    if (endDate) {
      dateFilter += ` AND s.created_at <= $${++paramCount}`;
      queryParams.push(endDate);
    }

    const result = await query(`
      SELECT 
        s.id, s.customer_name, s.customer_phone, s.total_amount,
        s.payment_method, s.created_at,
        COUNT(si.id) as item_count,
        STRING_AGG(i.name || ' (x' || si.quantity || ')', ', ') as items_summary
      FROM sales s
      LEFT JOIN sale_items si ON s.id = si.sale_id
      LEFT JOIN items i ON si.item_id = i.id
      WHERE 1=1 ${dateFilter}
      GROUP BY s.id
      ORDER BY s.created_at DESC
    `, queryParams);

    const summary = {
      totalSales: result.rows.length,
      totalRevenue: result.rows.reduce((sum, sale) => sum + parseFloat(sale.total_amount), 0),
      averageSale: result.rows.length > 0 
        ? result.rows.reduce((sum, sale) => sum + parseFloat(sale.total_amount), 0) / result.rows.length 
        : 0,
      period: { startDate, endDate }
    };

    res.json({
      success: true,
      data: result.rows,
      summary
    });
  } catch (error) {
    console.error('❌ Sales report error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate sales report' 
    });
  }
});

module.exports = router;