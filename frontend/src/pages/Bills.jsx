import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Eye, 
  Calendar,
  DollarSign,
  Package,
  ShoppingCart,
  Filter
} from 'lucide-react';
import { billsAPI, formatCurrency, formatDate } from '../services/api';
import toast from 'react-hot-toast';

const Bills = () => {
  const [purchaseBills, setPurchaseBills] = useState([]);
  const [salesBills, setSalesBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('purchase');
  const [selectedBill, setSelectedBill] = useState(null);

  useEffect(() => {
    loadBills();
  }, [activeTab]);

  const loadBills = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'purchase') {
        const response = await billsAPI.getPurchaseBills({ limit: 100 });
        setPurchaseBills(response.data.data);
      } else {
        const response = await billsAPI.getSalesBills({ limit: 100 });
        setSalesBills(response.data.data);
      }
    } catch (error) {
      console.error('Load bills error:', error);
      toast.error('Failed to load bills');
    } finally {
      setLoading(false);
    }
  };

  const BillDetailModal = ({ bill, onClose }) => {
    const [billDetails, setBillDetails] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(true);

    useEffect(() => {
      loadBillDetails();
    }, []);

    const loadBillDetails = async () => {
      try {
        setDetailsLoading(true);
        let response;
        
        if (activeTab === 'purchase') {
          response = await billsAPI.getPurchaseBill(bill.id);
        } else {
          // For sales bills, we already have the basic info
          setBillDetails(bill);
          setDetailsLoading(false);
          return;
        }
        
        setBillDetails(response.data.data);
      } catch (error) {
        console.error('Load bill details error:', error);
        toast.error('Failed to load bill details');
      } finally {
        setDetailsLoading(false);
      }
    };

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={onClose}></div>
          
          <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {activeTab === 'purchase' ? 'Purchase Bill Details' : 'Sales Bill Details'}
              </h3>
            </div>

            <div className="p-6">
              {detailsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="loading-spinner h-8 w-8"></div>
                </div>
              ) : billDetails ? (
                <div className="space-y-6">
                  {/* Bill Header */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Bill ID</p>
                      <p className="font-medium text-gray-900">#{billDetails.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Date</p>
                      <p className="font-medium text-gray-900">
                        {formatDate(billDetails.created_at)}
                      </p>
                    </div>
                    
                    {activeTab === 'purchase' ? (
                      <>
                        <div>
                          <p className="text-sm text-gray-600">Vendor</p>
                          <p className="font-medium text-gray-900">
                            {billDetails.vendor_name || 'Unknown Vendor'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Bill Number</p>
                          <p className="font-medium text-gray-900">
                            {billDetails.bill_number || 'N/A'}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <p className="text-sm text-gray-600">Customer</p>
                          <p className="font-medium text-gray-900">
                            {billDetails.customer_name || 'Walk-in Customer'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Payment Method</p>
                          <p className="font-medium text-gray-900 capitalize">
                            {billDetails.payment_method}
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Items */}
                  {billDetails.items && billDetails.items.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Items</h4>
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Item</th>
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Qty</th>
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Price</th>
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {billDetails.items.map((item, index) => (
                              <tr key={index} className="border-t border-gray-100">
                                <td className="px-4 py-2 text-sm text-gray-900">
                                  {item.item_name || item.name}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-600">
                                  {item.quantity}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-600">
                                  {formatCurrency(item.unit_price)}
                                </td>
                                <td className="px-4 py-2 text-sm font-medium text-gray-900">
                                  {formatCurrency(item.total_price)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Total */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium text-gray-900">Total Amount:</span>
                      <span className="text-xl font-bold text-gray-900">
                        {formatCurrency(billDetails.total_amount)}
                      </span>
                    </div>
                  </div>

                  {/* Bill Image/PDF */}
                  {activeTab === 'purchase' && billDetails.bill_image_url && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Original Bill</h4>
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <img
                          src={billDetails.bill_image_url}
                          alt="Original bill"
                          className="w-full h-64 object-contain bg-gray-50"
                        />
                      </div>
                    </div>
                  )}

                  {/* PDF Download for Sales */}
                  {activeTab === 'sales' && billDetails.bill_pdf_url && (
                    <div className="flex justify-center">
                      <a
                        href={billDetails.bill_pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Customer Bill
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-center text-gray-500">Failed to load bill details</p>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button onClick={onClose} className="btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const currentBills = activeTab === 'purchase' ? purchaseBills : salesBills;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bills & Documents</h1>
        <p className="text-gray-600">View and manage purchase bills and sales invoices</p>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('purchase')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'purchase'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Package className="h-4 w-4 inline mr-2" />
              Purchase Bills
            </button>
            <button
              onClick={() => setActiveTab('sales')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'sales'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ShoppingCart className="h-4 w-4 inline mr-2" />
              Sales Bills
            </button>
          </nav>
        </div>

        {/* Bills Table */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="loading-spinner h-8 w-8"></div>
            </div>
          ) : currentBills.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No {activeTab} bills found
              </h3>
              <p className="text-gray-600">
                {activeTab === 'purchase' 
                  ? 'Process your first purchase bill to see it here'
                  : 'Make your first sale to generate bills'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead className="table-header">
                  <tr>
                    <th className="table-head">Bill ID</th>
                    {activeTab === 'purchase' ? (
                      <>
                        <th className="table-head">Vendor</th>
                        <th className="table-head">Bill Number</th>
                      </>
                    ) : (
                      <>
                        <th className="table-head">Customer</th>
                        <th className="table-head">Payment</th>
                      </>
                    )}
                    <th className="table-head">Items</th>
                    <th className="table-head">Amount</th>
                    <th className="table-head">Date</th>
                    <th className="table-head">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentBills.map((bill) => (
                    <tr key={bill.id} className="table-row">
                      <td className="table-cell">
                        <span className="font-medium text-gray-900">#{bill.id}</span>
                      </td>
                      {activeTab === 'purchase' ? (
                        <>
                          <td className="table-cell">
                            <span className="text-gray-900">
                              {bill.vendor_name || 'Unknown Vendor'}
                            </span>
                          </td>
                          <td className="table-cell">
                            <span className="text-gray-600">
                              {bill.bill_number || 'N/A'}
                            </span>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="table-cell">
                            <div>
                              <div className="font-medium text-gray-900">
                                {bill.customer_name || 'Walk-in Customer'}
                              </div>
                              {bill.customer_phone && (
                                <div className="text-sm text-gray-500">{bill.customer_phone}</div>
                              )}
                            </div>
                          </td>
                          <td className="table-cell">
                            <span className="badge-secondary capitalize">
                              {bill.payment_method}
                            </span>
                          </td>
                        </>
                      )}
                      <td className="table-cell">
                        <span className="font-medium">{bill.item_count || 0} items</span>
                      </td>
                      <td className="table-cell">
                        <span className="font-medium text-gray-900">
                          {formatCurrency(bill.total_amount)}
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className="text-sm text-gray-600">
                          {formatDate(bill.created_at)}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedBill(bill)}
                            className="p-1 text-gray-400 hover:text-blue-600"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          
                          {activeTab === 'sales' && bill.bill_pdf_url && (
                            <a
                              href={bill.bill_pdf_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 text-gray-400 hover:text-green-600"
                              title="Download PDF"
                            >
                              <Download className="h-4 w-4" />
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
      </div>

      {/* Summary Stats */}
      {currentBills.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card p-4">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Bills</p>
                <p className="text-xl font-bold text-gray-900">{currentBills.length}</p>
              </div>
            </div>
          </div>
          
          <div className="card p-4">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(
                    currentBills.reduce((sum, bill) => sum + parseFloat(bill.total_amount || 0), 0)
                  )}
                </p>
              </div>
            </div>
          </div>
          
          <div className="card p-4">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-xl font-bold text-gray-900">
                  {currentBills.filter(bill => {
                    const billDate = new Date(bill.created_at);
                    const now = new Date();
                    return billDate.getMonth() === now.getMonth() && 
                           billDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bill Detail Modal */}
      {selectedBill && (
        <BillDetailModal
          bill={selectedBill}
          onClose={() => setSelectedBill(null)}
        />
      )}
    </div>
  );
};

export default Bills;