import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/api.js';
import { Package, Plus, CheckCircle, AlertCircle } from 'lucide-react';

const PRODUCT_ID_REGEX = /^[0-9]{16}$/;

const AddProduct = () => {
  const navigate = useNavigate();
  const [productId, setProductId] = useState('');
  const [productName, setProductName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!PRODUCT_ID_REGEX.test(productId)) {
      setError('Product ID must be exactly 16 digits (numbers only).');
      return;
    }

    if (!productName.trim()) {
      setError('Product name is required.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      await apiClient.post('/products', {
        productId,
        productName: productName.trim(),
      });
      setSuccess(`Product "${productName.trim()}" created successfully!`);
      setProductId('');
      setProductName('');
      // Optionally redirect to product list after 2 seconds
      setTimeout(() => {
        if (window.confirm('Product created successfully! Would you like to view all products?')) {
          navigate('/products');
        }
      }, 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to create product. Please try again.';
      setError(errorMessage);
      if (err.response?.status === 409) {
        // Duplicate product ID
        setError('A product with this ID already exists. Please use a different Product ID.');
      } else if (err.response?.status === 400) {
        // Validation error
        setError(errorMessage || 'Invalid product data. Please check Product ID (must be 16 digits) and Product Name.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProductIdChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 16);
    setProductId(value);
    // Clear error when user starts typing
    if (error) setError('');
  };

  // Clear success message after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Add Product</h1>
        <p className="text-gray-600 mt-2">
          Create a single product with a unique 16-digit Product ID.
        </p>
      </div>

      <div className="card max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Name
            </label>
            <div className="relative">
              <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 " />
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="input-field pl-10 text-black"
                placeholder="Enter product name"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product ID (16-digit numeric)
            </label>
            <input
              type="text"
              value={productId}
              onChange={handleProductIdChange}
              className="input-field font-mono text-black"
              placeholder="1234567812345678"
              required
              inputMode="numeric"
              pattern="[0-9]{16}"
              maxLength={16}
            />
            <p className="mt-1 text-sm text-gray-500">
              Enter exactly 16 digits (numbers only). Current length: {productId.length}/16
            </p>
            {productId.length > 0 && productId.length < 16 && (
              <p className="mt-1 text-sm text-amber-600">
                ⚠️ Product ID must be exactly 16 digits
              </p>
            )}
            {productId.length === 16 && PRODUCT_ID_REGEX.test(productId) && (
              <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                Valid Product ID format
              </p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <button
            type="submit"
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Add Product
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
