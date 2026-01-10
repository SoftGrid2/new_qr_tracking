import { useState } from 'react';
import { apiClient } from '../api/api.js';
import { Package, Plus } from 'lucide-react';

const PRODUCT_ID_REGEX = /^[0-9]{16}$/;

const AddProduct = () => {
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
      await apiClient.post('/products', {
        productId,
        productName: productName.trim(),
      });
      setSuccess('Product created successfully.');
      setProductId('');
      setProductName('');
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to create product. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleProductIdChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 16);
    setProductId(value);
  };

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
              <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="input-field pl-10"
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
              className="input-field font-mono"
              placeholder="1234567812345678"
              required
              inputMode="numeric"
              pattern="[0-9]{16}"
              maxLength={16}
            />
            <p className="mt-1 text-sm text-gray-500">
              Enter exactly 16 digits (numbers only)
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {success}
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
