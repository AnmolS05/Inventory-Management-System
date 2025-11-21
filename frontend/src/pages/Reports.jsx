import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Download, 
  Calendar,
  FileText,
  TrendingUp,
  Package,
  DollarSign,
  Filter
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { dashboardAPI, formatCurrency, formatDateOnly } from '../services/api';
import toast from 'react-hot-toast';

const Reports = () => {
  const [salesData, setSalesData] = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [inventoryReport, setInventoryReport] = useState(null);
  const [salesReport, setSalesReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reportPeriod, setReportPeriod] = useState('month');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    loadReportData();
  }, [reportPeriod]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      
      const [salesChartRes, topItemsRes] = await Promise.all([
        dashboardAPI.getSalesChart({ period: reportPeriod }),
        dashboardAPI.getTopItemsChart({ period: reportPeriod, limit: 10 })
      ]);

      setSalesData(salesChartRes.data.data);
      setTopItems(topItemsRes.data.data);
    } catch (error) {
      console.error('Load report data error:', error);
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const generateInventoryReport = async (format = 'json') => {
    try {
      setLoading(true);
      const response = await dashboardAPI.generateInventoryReport({ format });
      
      if (format === 'pdf') {
        toast.success('Inventory report generated successfully');
        // Open PDF in new tab
        window.open(response.data.data.reportUrl, '_blank');
      } else {
        setInventoryReport(response.data);
        toast.success('Inventory report loaded');
      }
    } catch (error) {
      console.error('Generate inventory report error:', error);
      toast.error('Failed to generate inventory report');
    } finally {
      setLoading(false);
    }
  };

  const generateSalesReport = async () => {
    try {
      setLoading(true);
      const params = {};
      
      if (dateRange.startDate) params.startDate = dateRange.startDate;
      if (dateRange.endDate) params.endDate = dateRange.endDate;

      const response = await dashboardAPI.generateSalesReport(params);
      setSalesReport(response.data);
      toast.success('Sales report generated');
    } catch (error) {
      console.error('Generate sales report error:', error);
      toast.error('Failed to generate sales report');
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

  const ReportCard = ({ title, description, onGenerate, loading, children }) => (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        <button
          onClick={onGenerate}
          disabled={loading}
          className="btn-primary btn-sm"
        >
          {loading ? (
            <div className="loading-spinner mr-2"></div>
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Generate
        </button>
      </div>
      {children}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600">Generate detailed reports and analyze your business performance</p>
      </div>

      {/* Period Selector */}
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <label className="label">Report Period:</label>
            <select
              value={reportPeriod}
              onChange={(e) => setReportPeriod(e.target.value)}
              className="input w-auto"
            >
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="year">Last 12 Months</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              Showing data for {reportPeriod === 'week' ? 'last 7 days' : reportPeriod === 'month' ? 'last 30 days' : 'last 12 months'}
            </span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Trend</h3>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="loading-spinner h-8 w-8"></div>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => formatDateOnly(value)}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => formatDateOnly(value)}
                    formatter={(value, name) => [
                      name === 'revenue' ? formatCurrency(value) : value,
                      name === 'revenue' ? 'Revenue' : 'Sales Count'
                    ]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="revenue"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="sales"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Top Items Chart */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Items</h3>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="loading-spinner h-8 w-8"></div>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topItems.slice(0, 8)} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip formatter={(value) => [value, 'Units Sold']} />
                  <Bar dataKey="sold" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Report Generation Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory Report */}
        <ReportCard
          title="Inventory Report"
          description="Generate detailed inventory report with stock levels and values"
          onGenerate={() => generateInventoryReport('json')}
          loading={loading}
        >
          <div className="space-y-4">
            <div className="flex space-x-2">
              <button
                onClick={() => generateInventoryReport('json')}
                disabled={loading}
                className="btn-secondary btn-sm"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                View Report
              </button>
              <button
                onClick={() => generateInventoryReport('pdf')}
                disabled={loading}
                className="btn-primary btn-sm"
              >
                <FileText className="h-4 w-4 mr-2" />
                Download PDF
              </button>
            </div>
            
            {inventoryReport && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Total Items</p>
                    <p className="font-bold text-gray-900">{inventoryReport.summary.totalItems}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total Value</p>
                    <p className="font-bold text-gray-900">
                      {formatCurrency(inventoryReport.summary.totalValue)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Low Stock</p>
                    <p className="font-bold text-red-600">{inventoryReport.summary.lowStockItems}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ReportCard>

        {/* Sales Report */}
        <ReportCard
          title="Sales Report"
          description="Generate sales report for custom date range"
          onGenerate={generateSalesReport}
          loading={loading}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="label text-xs">Start Date</label>
                <input
                  type="date"
                  className="input text-sm"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({
                    ...dateRange,
                    startDate: e.target.value
                  })}
                />
              </div>
              <div>
                <label className="label text-xs">End Date</label>
                <input
                  type="date"
                  className="input text-sm"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({
                    ...dateRange,
                    endDate: e.target.value
                  })}
                />
              </div>
            </div>
            
            {salesReport && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Total Sales</p>
                    <p className="font-bold text-gray-900">{salesReport.summary.totalSales}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Revenue</p>
                    <p className="font-bold text-gray-900">
                      {formatCurrency(salesReport.summary.totalRevenue)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Avg Sale</p>
                    <p className="font-bold text-gray-900">
                      {formatCurrency(salesReport.summary.averageSale)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ReportCard>
      </div>

      {/* Detailed Reports Tables */}
      {inventoryReport && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory Details</h3>
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-head">Item Name</th>
                  <th className="table-head">Category</th>
                  <th className="table-head">Stock</th>
                  <th className="table-head">Unit Price</th>
                  <th className="table-head">Stock Value</th>
                  <th className="table-head">Status</th>
                </tr>
              </thead>
              <tbody>
                {inventoryReport.data.slice(0, 10).map((item, index) => (
                  <tr key={index} className="table-row">
                    <td className="table-cell font-medium">{item.name}</td>
                    <td className="table-cell">
                      <span className="badge-secondary">{item.category || 'N/A'}</span>
                    </td>
                    <td className="table-cell">{item.quantity}</td>
                    <td className="table-cell">{formatCurrency(item.unit_price)}</td>
                    <td className="table-cell">{formatCurrency(item.stock_value)}</td>
                    <td className="table-cell">
                      <span className={`badge ${
                        item.stock_status === 'Low Stock' ? 'badge-danger' :
                        item.stock_status === 'Medium Stock' ? 'badge-warning' :
                        'badge-success'
                      }`}>
                        {item.stock_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {inventoryReport.data.length > 10 && (
            <p className="text-sm text-gray-500 mt-4 text-center">
              Showing 10 of {inventoryReport.data.length} items. Download full report for complete data.
            </p>
          )}
        </div>
      )}

      {salesReport && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Details</h3>
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-head">Sale ID</th>
                  <th className="table-head">Customer</th>
                  <th className="table-head">Items</th>
                  <th className="table-head">Amount</th>
                  <th className="table-head">Payment</th>
                  <th className="table-head">Date</th>
                </tr>
              </thead>
              <tbody>
                {salesReport.data.slice(0, 10).map((sale, index) => (
                  <tr key={index} className="table-row">
                    <td className="table-cell font-medium">#{sale.id}</td>
                    <td className="table-cell">{sale.customer_name || 'Walk-in'}</td>
                    <td className="table-cell">{sale.item_count} items</td>
                    <td className="table-cell">{formatCurrency(sale.total_amount)}</td>
                    <td className="table-cell">
                      <span className="badge-secondary capitalize">{sale.payment_method}</span>
                    </td>
                    <td className="table-cell">{formatDateOnly(sale.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {salesReport.data.length > 10 && (
            <p className="text-sm text-gray-500 mt-4 text-center">
              Showing 10 of {salesReport.data.length} sales. Generate full report for complete data.
            </p>
          )}
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Revenue Growth</p>
              <p className="text-xl font-bold text-green-600">+12.5%</p>
            </div>
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Items Sold</p>
              <p className="text-xl font-bold text-gray-900">
                {topItems.reduce((sum, item) => sum + item.sold, 0)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-purple-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Avg Order Value</p>
              <p className="text-xl font-bold text-gray-900">
                {salesData.length > 0 
                  ? formatCurrency(
                      salesData.reduce((sum, day) => sum + day.revenue, 0) / 
                      salesData.reduce((sum, day) => sum + day.sales, 0)
                    )
                  : '$0.00'
                }
              </p>
            </div>
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-orange-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Best Day</p>
              <p className="text-xl font-bold text-gray-900">
                {salesData.length > 0 
                  ? formatDateOnly(
                      salesData.reduce((best, day) => 
                        day.revenue > best.revenue ? day : best
                      ).date
                    )
                  : 'N/A'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;