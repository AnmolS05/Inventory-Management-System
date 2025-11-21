import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  ShoppingCart, 
  Trash2, 
  FileText,
  CreditCard,
  DollarSign,
  User,
  Phone,
  Calendar
} from 'lucide-react';
import { salesAPI, inventoryAPI, formatCurrency, formatDate } from '../services/api';
import toast from 'react-hot-toast';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewSaleModal, setShowNewSaleModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadSales();
    loadItems();
  }, []);

  const loadSales = async () => {
    try {
      setLoading(true);
      const response = await salesAPI.getSales({ limit: 100 });
      setSales(response.data.data);
    } catch (error) {
      console.error('Load sales error:', error);
      toast.error('Failed to load sales');
    } finally {
      setLoading(false);
    }
  };

  const loadItems = async () => {
    try {
      const response = await inventoryAPI.getItems();
      setItems(response.data.data.filter(item => item.quantity > 0));
    } catch (error) {
      console.error('Load items error:', error);
    }
  };

  const NewSaleModal = ({ onClose, onSave }) => {
    const [saleItems, setSaleItems] = useState([]);
    const [customerInfo, setCustomerInfo] = useState({
      customer_name: '',
      customer_phone: '',
      payment_method: 'cash'
    });
    const [saving, setSaving] = useState(false);
    const [itemSearch, setItemSearch] = useState('');

    const filteredItems = items.filter(item =>
      item.name.toLowerCase().includes(itemSearch.toLowerCase()) &&
      !saleItems.find(saleItem => saleItem.item_id === item.id)
    );

    const addItem = (item) => {
      setSaleItems([...saleItems, {
        item_id: item.id,
        name: item.name,
        unit_price: item.unit_price,
        quantity: 1,
        max_quantity: item.quantity
      }]);
      setItemSearch('');
    };

    const updateItemQuantity = (index, quantity) => {
      const newItems = [...saleItems];
      newItems[index].quantity = Math.min(quantity, newItems[index].max_quantity);
      setSaleItems(newItems);
    };

    const removeItem = (index) => {
      setSaleItems(saleItems.filter((_, i) => i !== index));
    };

    const totalAmount = saleItems.reduce((sum, item) => 
      sum + (item.quantity * item.unit_price), 0
    );

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      if (saleItems.length === 0) {
        toast.error('Please add at least one item');
        return;
      }

      setSaving(true);

      try {
        const saleData = {
          items: saleItems.map(item => ({
            item_id: item.item_id,
            quantity: item.quantity
          })),
          ...customerInfo
        };

        await salesAPI.createSale(saleData);
        toast.success('Sale completed successfully');
        onSave();
        onClose();
      } catch (error) {
        console.error('Create sale error:', error);
        toast.error(error.response?.data?.error || 'Failed to create sale');
      } finally {
        setSaving(false);
      }
    };

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={onClose}></div>
          
          <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">New Sale</h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Customer Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label">Customer Name</label>
                  <input
                    type="text"
                    className="input"
                    value={customerInfo.customer_name}
                    onChange={(e) => setCustomerInfo({
                      ...customerInfo,
                      customer_name: e.target.value
                    })}
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="label">Phone Number</label>
                  <input
                    type="tel"
                    className="input"
                    value={customerInfo.customer_phone}
                    onChange={(e) => setCustomerInfo({
                      ...customerInfo,
                      customer_phone: e.target.value
                    })}
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="label">Payment Method</label>
                  <select
                    className="input"
                    value={customerInfo.payment_method}
                    onChange={(e) => setCustomerInfo({
                      ...customerInfo,
                      payment_method: e.target.value
                    })}
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Add Items */}
              <div>
                <label className="label">Add Items</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    className="input pl-10"
                    placeholder="Search items to add..."
                    value={itemSearch}
                    onChange={(e) => setItemSearch(e.target.value)}
                  />
                </div>
                
                {itemSearch && filteredItems.length > 0 && (
                  <div className="mt-2 border border-gray-200 rounded-md max-h-40 overflow-y-auto">
                    {filteredItems.slice(0, 5).map(item => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => addItem(item)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-500">Stock: {item.quantity}</p>
                          </div>
                          <p className="font-medium text-gray-900">
                            {formatCurrency(item.unit_price)}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Sale Items */}
              {saleItems.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Sale Items</h4>
                  <div className="space-y-3">
                    {saleItems.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-500">
                            {formatCurrency(item.unit_price)} each (Max: {item.max_quantity})
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <input
                            type="number"
                            min="1"
                            max={item.max_quantity}
                            value={item.quantity}
                            onChange={(e) => updateItemQuantity(index, parseInt(e.target.value))}
                            className="input w-20"
                          />
                          
                          <p className="font-medium text-gray-900 w-20 text-right">
                            {formatCurrency(item.quantity * item.unit_price)}
                          </p>
                          
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="p-1 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Total */}
              {saleItems.length > 0 && (
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total Amount:</span>
                    <span>{formatCurrency(totalAmount)}</span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || saleItems.length === 0}
                  className="btn-success"
                >
                  {saving ? (
                    <>
                      <div className="loading-spinner mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Complete Sale
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const filteredSales = sales.filter(sale =>
    sale.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.id.toString().includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Management</h1>
          <p className="text-gray-600">Process customer sales and generate bills</p>
        </div>
        <button
          onClick={() => setShowNewSaleModal(true)}
          className="btn-success"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Sale
        </button>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search sales by customer name or ID..."
            className="input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Sales Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="loading-spinner h-8 w-8"></div>
          </div>
        ) : filteredSales.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No sales found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? 'Try adjusting your search terms' 
                : 'Get started by making your first sale'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowNewSaleModal(true)}
                className="btn-success"
              >
                <Plus className="h-4 w-4 mr-2" />
                Make First Sale
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-head">Sale ID</th>
                  <th className="table-head">Customer</th>
                  <th className="table-head">Items</th>
                  <th className="table-head">Total Amount</th>
                  <th className="table-head">Payment</th>
                  <th className="table-head">Date</th>
                  <th className="table-head">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map((sale) => (
                  <tr key={sale.id} className="table-row">
                    <td className="table-cell">
                      <span className="font-medium text-gray-900">#{sale.id}</span>
                    </td>
                    <td className="table-cell">
                      <div>
                        <div className="font-medium text-gray-900">
                          {sale.customer_name || 'Walk-in Customer'}
                        </div>
                        {sale.customer_phone && (
                          <div className="text-sm text-gray-500">{sale.customer_phone}</div>
                        )}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div>
                        <span className="font-medium">{sale.item_count || 0} items</span>
                        {sale.items && sale.items[0] && (
                          <div className="text-sm text-gray-500">
                            {sale.items[0].item_name}
                            {sale.items.length > 1 && ` +${sale.items.length - 1} more`}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="font-medium text-gray-900">
                        {formatCurrency(sale.total_amount)}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className="badge-secondary capitalize">
                        {sale.payment_method}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className="text-sm text-gray-600">
                        {formatDate(sale.created_at)}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        {sale.bill_pdf_url && (
                          <a
                            href={sale.bill_pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-gray-400 hover:text-blue-600"
                            title="View Bill"
                          >
                            <FileText className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {filteredSales.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card p-4">
            <div className="flex items-center">
              <ShoppingCart className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Sales</p>
                <p className="text-xl font-bold text-gray-900">{filteredSales.length}</p>
              </div>
            </div>
          </div>
          
          <div className="card p-4">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(filteredSales.reduce((sum, sale) => sum + parseFloat(sale.total_amount), 0))}
                </p>
              </div>
            </div>
          </div>
          
          <div className="card p-4">
            <div className="flex items-center">
              <User className="h-8 w-8 text-purple-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Customers</p>
                <p className="text-xl font-bold text-gray-900">
                  {new Set(filteredSales.filter(s => s.customer_name).map(s => s.customer_name)).size}
                </p>
              </div>
            </div>
          </div>
          
          <div className="card p-4">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-orange-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Avg. Sale</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(
                    filteredSales.reduce((sum, sale) => sum + parseFloat(sale.total_amount), 0) / filteredSales.length
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Sale Modal */}
      {showNewSaleModal && (
        <NewSaleModal
          onClose={() => setShowNewSaleModal(false)}
          onSave={() => {
            loadSales();
            loadItems(); // Refresh items to update stock quantities
          }}
        />
      )}
    </div>
  );
};

export default Sales;