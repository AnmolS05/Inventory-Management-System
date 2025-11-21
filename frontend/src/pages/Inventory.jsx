import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  AlertTriangle,
  Package,
  DollarSign
} from 'lucide-react';
import { inventoryAPI, formatCurrency, formatDate } from '../services/api';
import toast from 'react-hot-toast';

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    loadInventory();
    loadCategories();
  }, [searchTerm, selectedCategory, showLowStock]);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const params = {};
      
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory) params.category = selectedCategory;
      if (showLowStock) params.lowStock = 'true';

      const response = await inventoryAPI.getItems(params);
      setItems(response.data.data);
    } catch (error) {
      console.error('Load inventory error:', error);
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await inventoryAPI.getCategories();
      setCategories(response.data.data);
    } catch (error) {
      console.error('Load categories error:', error);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      await inventoryAPI.deleteItem(id);
      toast.success('Item deleted successfully');
      loadInventory();
    } catch (error) {
      console.error('Delete item error:', error);
      toast.error('Failed to delete item');
    }
  };

  const getStockStatus = (item) => {
    if (item.quantity <= item.low_stock_threshold) {
      return { status: 'Low Stock', color: 'badge-danger' };
    } else if (item.quantity <= item.low_stock_threshold * 2) {
      return { status: 'Medium Stock', color: 'badge-warning' };
    } else {
      return { status: 'Good Stock', color: 'badge-success' };
    }
  };

  const ItemModal = ({ item, onClose, onSave }) => {
    const [formData, setFormData] = useState({
      name: item?.name || '',
      category: item?.category || '',
      quantity: item?.quantity || 0,
      unit_price: item?.unit_price || 0,
      cost_price: item?.cost_price || 0,
      low_stock_threshold: item?.low_stock_threshold || 10,
      barcode: item?.barcode || '',
      description: item?.description || ''
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setSaving(true);

      try {
        if (item) {
          await inventoryAPI.updateItem(item.id, formData);
          toast.success('Item updated successfully');
        } else {
          await inventoryAPI.addItem(formData);
          toast.success('Item added successfully');
        }
        onSave();
        onClose();
      } catch (error) {
        console.error('Save item error:', error);
        toast.error('Failed to save item');
      } finally {
        setSaving(false);
      }
    };

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={onClose}></div>
          
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {item ? 'Edit Item' : 'Add New Item'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
              <div>
                <label className="label">Item Name *</label>
                <input
                  type="text"
                  required
                  className="input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Category</label>
                <input
                  type="text"
                  className="input"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  list="categories"
                />
                <datalist id="categories">
                  {categories.map(cat => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Quantity *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="input"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="label">Unit Price *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    className="input"
                    value={formData.unit_price}
                    onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Cost Price</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="input"
                    value={formData.cost_price}
                    onChange={(e) => setFormData({ ...formData, cost_price: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="label">Low Stock Alert</label>
                  <input
                    type="number"
                    min="1"
                    className="input"
                    value={formData.low_stock_threshold}
                    onChange={(e) => setFormData({ ...formData, low_stock_threshold: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <label className="label">Barcode</label>
                <input
                  type="text"
                  className="input"
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Description</label>
                <textarea
                  className="input"
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

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
                  disabled={saving}
                  className="btn-primary"
                >
                  {saving ? (
                    <>
                      <div className="loading-spinner mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    item ? 'Update Item' : 'Add Item'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600">Manage your store inventory and stock levels</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search items..."
                className="input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input w-auto"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showLowStock}
              onChange={(e) => setShowLowStock(e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">Low Stock Only</span>
          </label>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="loading-spinner h-8 w-8"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedCategory || showLowStock 
                ? 'Try adjusting your filters' 
                : 'Get started by adding your first item'
              }
            </p>
            {!searchTerm && !selectedCategory && !showLowStock && (
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Item
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-head">Item</th>
                  <th className="table-head">Category</th>
                  <th className="table-head">Stock</th>
                  <th className="table-head">Unit Price</th>
                  <th className="table-head">Stock Value</th>
                  <th className="table-head">Status</th>
                  <th className="table-head">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const stockStatus = getStockStatus(item);
                  const stockValue = item.quantity * item.unit_price;
                  
                  return (
                    <tr key={item.id} className="table-row">
                      <td className="table-cell">
                        <div>
                          <div className="font-medium text-gray-900">{item.name}</div>
                          {item.barcode && (
                            <div className="text-sm text-gray-500">#{item.barcode}</div>
                          )}
                        </div>
                      </td>
                      <td className="table-cell">
                        <span className="badge-secondary">
                          {item.category || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center">
                          <span className="font-medium">{item.quantity}</span>
                          {item.quantity <= item.low_stock_threshold && (
                            <AlertTriangle className="h-4 w-4 text-red-500 ml-2" />
                          )}
                        </div>
                      </td>
                      <td className="table-cell">
                        {formatCurrency(item.unit_price)}
                      </td>
                      <td className="table-cell">
                        {formatCurrency(stockValue)}
                      </td>
                      <td className="table-cell">
                        <span className={`badge ${stockStatus.color}`}>
                          {stockStatus.status}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setEditingItem(item)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1 text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary */}
      {items.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card p-4">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-xl font-bold text-gray-900">{items.length}</p>
              </div>
            </div>
          </div>
          
          <div className="card p-4">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Stock Value</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0))}
                </p>
              </div>
            </div>
          </div>
          
          <div className="card p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Low Stock Items</p>
                <p className="text-xl font-bold text-gray-900">
                  {items.filter(item => item.quantity <= item.low_stock_threshold).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <ItemModal
          onClose={() => setShowAddModal(false)}
          onSave={loadInventory}
        />
      )}

      {editingItem && (
        <ItemModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={loadInventory}
        />
      )}
    </div>
  );
};

export default Inventory;