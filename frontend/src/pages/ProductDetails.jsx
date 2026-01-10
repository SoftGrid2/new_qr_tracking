import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/api.js';
import { ArrowLeft, Download, Package, Hash, Scan, Calendar, CheckCircle, XCircle, Power, PowerOff, Trash2, AlertCircle } from 'lucide-react';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const ProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      const res = await apiClient.get(`/products/${productId}`);
      setProduct(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load product details.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!product) return;
    
    const newStatus = product.status === 'active' ? 'invalid' : 'active';
    
    try {
      setUpdatingStatus(true);
      setError('');
      setSuccess('');
      const res = await apiClient.patch(`/products/${productId}/status`, { status: newStatus });
      setProduct(res.data.product);
      setSuccess(`Product status updated to ${newStatus}`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update product status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!product) return;
    
    if (!window.confirm(`Are you sure you want to delete "${product.productName}" (ID: ${product.productId})? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeleting(true);
      setError('');
      setSuccess('');
      await apiClient.delete(`/products/${productId}`);
      setSuccess(`Product "${product.productName}" deleted successfully`);
      setTimeout(() => {
        navigate('/products');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete product');
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const qrDownloadUrl = `${API_BASE_URL}/api/products/${productId}/qr`;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div>
        <button
          onClick={() => navigate('/products')}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </button>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error || 'Product not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <button
        onClick={() => navigate('/products')}
        className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Products
      </button>

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Product Details</h1>
          <p className="text-gray-600 mt-2">Complete information about this product</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleStatus}
            disabled={updatingStatus}
            className={`btn-secondary inline-flex items-center gap-2 ${
              product.status === 'active'
                ? 'bg-yellow-50 text-yellow-700 border-yellow-300 hover:bg-yellow-100'
                : 'bg-green-50 text-green-700 border-green-300 hover:bg-green-100'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {updatingStatus ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                Updating...
              </>
            ) : product.status === 'active' ? (
              <>
                <PowerOff className="w-4 h-4" />
                Deactivate
              </>
            ) : (
              <>
                <Power className="w-4 h-4" />
                Activate
              </>
            )}
          </button>
          <button
            onClick={handleDeleteProduct}
            disabled={deleting}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Delete Product
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Information Card */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Product Information
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Product Name</label>
              <p className="text-lg text-gray-900 mt-1">{product.productName}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Hash className="w-4 h-4" />
                Product ID
              </label>
              <p className="text-lg font-mono text-gray-900 mt-1">{product.productId}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <div className="mt-1">
                <span
                  className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
                    product.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {product.status === 'active' ? (
                    <CheckCircle className="w-4 h-4 mr-1" />
                  ) : (
                    <XCircle className="w-4 h-4 mr-1" />
                  )}
                  {product.status}
                </span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Scan className="w-4 h-4" />
                Scan Count
              </label>
              <p className="text-lg text-gray-900 mt-1">
                {product.scanCount} / {product.maxScan}
              </p>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    product.scanCount >= product.maxScan
                      ? 'bg-red-500'
                      : product.scanCount / product.maxScan > 0.7
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                  style={{
                    width: `${Math.min((product.scanCount / product.maxScan) * 100, 100)}%`,
                  }}
                ></div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Created At
              </label>
              <p className="text-sm text-gray-900 mt-1">
                {new Date(product.createdAt).toLocaleString()}
              </p>
            </div>

            {product.updatedAt && (
              <div>
                <label className="text-sm font-medium text-gray-500">Last Updated</label>
                <p className="text-sm text-gray-900 mt-1">
                  {new Date(product.updatedAt).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* QR Code Card */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Package className="w-5 h-5" />
            QR Code
          </h2>

          <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg">
            <img
              src={qrDownloadUrl}
              alt="QR Code"
              className="w-64 h-64 object-contain rounded-lg border-4 border-white shadow-lg bg-white"
            />
            <p className="mt-4 text-sm text-gray-600 font-mono">{product.productId}</p>
            <a
              href={qrDownloadUrl}
              download={`qr_${product.productId}.png`}
              className="mt-4 btn-primary inline-flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download QR Code
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
