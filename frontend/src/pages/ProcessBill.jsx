import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  FileImage, 
  CheckCircle, 
  AlertCircle, 
  Loader,
  Eye,
  Save,
  X
} from 'lucide-react';
import { inventoryAPI, formatCurrency } from '../services/api';
import toast from 'react-hot-toast';

const ProcessBill = () => {
  const [processing, setProcessing] = useState(false);
  const [processedData, setProcessedData] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
      
      // Create preview URL for images
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      }
      
      // Reset processed data when new file is uploaded
      setProcessedData(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const processBill = async () => {
    if (!uploadedFile) {
      toast.error('Please select a file first');
      return;
    }

    setProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append('billImage', uploadedFile);

      const response = await inventoryAPI.processBill(formData);
      setProcessedData(response.data.data);
      
      toast.success(`Successfully processed ${response.data.data.items.length} items from bill`);
    } catch (error) {
      console.error('Bill processing error:', error);
      toast.error(error.response?.data?.error || 'Failed to process bill');
    } finally {
      setProcessing(false);
    }
  };

  const resetForm = () => {
    setUploadedFile(null);
    setPreviewUrl(null);
    setProcessedData(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  const ItemCard = ({ item, index }) => (
    <div className="card p-4 border-l-4 border-l-blue-500">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{item.name}</h4>
          {item.category && (
            <span className="badge-secondary mt-1">{item.category}</span>
          )}
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600">
            Qty: <span className="font-medium">{item.purchased_quantity}</span>
          </div>
          <div className="text-sm text-gray-600">
            Price: <span className="font-medium">{formatCurrency(item.purchase_price)}</span>
          </div>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            {item.id ? 'Updated existing item' : 'Created new item'}
          </span>
          <span className="font-medium text-gray-900">
            New Stock: {item.quantity}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Process Purchase Bill</h1>
        <p className="text-gray-600">
          Upload a purchase bill image and let AI automatically extract items and update your inventory
        </p>
      </div>

      {/* Upload Section */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Bill Image</h2>
        
        {!uploadedFile ? (
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive 
                ? 'border-primary-500 bg-primary-50' 
                : 'border-gray-300 hover:border-gray-400'
              }
            `}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            
            {isDragActive ? (
              <p className="text-primary-600 font-medium">Drop the file here...</p>
            ) : (
              <div>
                <p className="text-gray-600 mb-2">
                  Drag & drop a bill image here, or click to select
                </p>
                <p className="text-sm text-gray-500">
                  Supports: JPG, PNG, GIF, BMP, PDF (Max 10MB)
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* File Info */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileImage className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={resetForm}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Image Preview */}
            {previewUrl && (
              <div className="border rounded-lg overflow-hidden">
                <img
                  src={previewUrl}
                  alt="Bill preview"
                  className="w-full h-64 object-contain bg-gray-50"
                />
              </div>
            )}

            {/* Process Button */}
            {!processedData && (
              <div className="flex justify-center">
                <button
                  onClick={processBill}
                  disabled={processing}
                  className="btn-primary btn-lg"
                >
                  {processing ? (
                    <>
                      <Loader className="h-5 w-5 mr-2 animate-spin" />
                      Processing with AI...
                    </>
                  ) : (
                    <>
                      <Eye className="h-5 w-5 mr-2" />
                      Process Bill with AI
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Processing Results */}
      {processedData && (
        <div className="space-y-6">
          {/* Bill Summary */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Processing Results</h2>
              <div className="flex items-center text-green-600">
                <CheckCircle className="h-5 w-5 mr-2" />
                <span className="font-medium">Successfully Processed</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Vendor</p>
                <p className="text-lg font-bold text-blue-900">
                  {processedData.bill.vendor_name || 'Unknown Vendor'}
                </p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Bill Number</p>
                <p className="text-lg font-bold text-green-900">
                  {processedData.bill.bill_number || 'N/A'}
                </p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-600 font-medium">Total Amount</p>
                <p className="text-lg font-bold text-purple-900">
                  {formatCurrency(processedData.bill.total_amount || 0)}
                </p>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-orange-600 font-medium">Items Processed</p>
                <p className="text-lg font-bold text-orange-900">
                  {processedData.items.length}
                </p>
              </div>
            </div>
          </div>

          {/* Processed Items */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Updated Inventory Items
            </h3>
            
            {processedData.items.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {processedData.items.map((item, index) => (
                  <ItemCard key={index} item={item} index={index} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Items Processed</h4>
                <p className="text-gray-600">
                  The AI couldn't extract any items from this bill. Please try with a clearer image.
                </p>
              </div>
            )}
          </div>

          {/* Summary Stats */}
          {processedData.summary && (
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Processing Summary</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Total Items Found</span>
                  <span className="font-bold text-gray-900">
                    {processedData.summary.totalItems}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Successfully Processed</span>
                  <span className="font-bold text-green-600">
                    {processedData.summary.processedItems}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Total Value</span>
                  <span className="font-bold text-gray-900">
                    {formatCurrency(processedData.summary.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={resetForm}
              className="btn-secondary"
            >
              Process Another Bill
            </button>
            <button
              onClick={() => window.location.href = '/inventory'}
              className="btn-primary"
            >
              <Save className="h-4 w-4 mr-2" />
              View Updated Inventory
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="card p-6 bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          Tips for Best Results
        </h3>
        <ul className="space-y-2 text-blue-800">
          <li className="flex items-start">
            <CheckCircle className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
            <span>Ensure the bill image is clear and well-lit</span>
          </li>
          <li className="flex items-start">
            <CheckCircle className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
            <span>Make sure all text is readable and not blurred</span>
          </li>
          <li className="flex items-start">
            <CheckCircle className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
            <span>Include the entire bill in the image frame</span>
          </li>
          <li className="flex items-start">
            <CheckCircle className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
            <span>Avoid shadows or reflections on the bill</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ProcessBill;