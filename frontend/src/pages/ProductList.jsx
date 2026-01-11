import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/api.js';
import { Search, Download, ChevronLeft, ChevronRight, Eye, Plus, Trash2, Power, PowerOff, CheckCircle, XCircle } from 'lucide-react';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const ProductList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, [page, search, statusFilter]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        page,
        limit: 10,
      };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const res = await apiClient.get('/products', { params });
      setProducts(res.data.products || []);
      setPagination(res.data.pagination || pagination);
    } catch (err) {
      setError('Failed to load products.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const qrDownloadUrl = (productId) =>
    `${API_BASE_URL}/api/products/${productId}/qr`;

  const handleDeleteProduct = async (productId, productName) => {
    if (!window.confirm(`Are you sure you want to delete "${productName}" (ID: ${productId})? This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      await apiClient.delete(`/products/${productId}`);
      setSuccess(`Product "${productName}" deleted successfully`);
      setDeleteConfirm(null);
      fetchProducts(); // Refresh list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete product');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (productId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'invalid' : 'active';
    
    try {
      setUpdatingStatus(productId);
      setError('');
      setSuccess('');
      await apiClient.patch(`/products/${productId}/status`, { status: newStatus });
      setSuccess(`Product status updated to ${newStatus}`);
      fetchProducts(); // Refresh list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update product status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-2">
            View all products, their scan status, and download QR codes.
          </p>
        </div>
        <button
          onClick={() => navigate('/add-product')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add New Product
        </button>
      </div>

      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Search by product name or ID..."
              className="input-field pl-10 text-black"
            />
          </div>
          <select
            value={statusFilter}
            onChange={handleStatusFilter}
            className="input-field md:w-48 text-black"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="invalid">Invalid</option>
          </select>
        </div>
      </div>

      <div className="card">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
            <XCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            {success}
          </div>
        )}

        {!loading && products.length === 0 && (
          <p className="text-center py-12 text-gray-500">
            No products found. Add one from the Add Product page or upload in bulk.
          </p>
        )}

        {!loading && products.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      QR Preview
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Scan Count
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((p) => (
                    <tr key={p._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <button
                          onClick={() => navigate(`/products/${p.productId}`)}
                          className="text-primary-600 hover:text-primary-800 hover:underline flex items-center gap-1"
                        >
                          {p.productName}
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                        {p.productId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img
                          src={qrDownloadUrl(p.productId)}
                          alt="QR preview"
                          className="w-20 h-20 object-contain rounded-lg border border-gray-200 bg-white"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {p.scanCount} / {p.maxScan}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            p.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => navigate(`/products/${p.productId}`)}
                            className="btn-secondary inline-flex items-center gap-1 px-3 py-1.5 text-xs"
                          >
                            <Eye className="w-3 h-3" />
                            View
                          </button>
                          <a
                            href={qrDownloadUrl(p.productId)}
                            className="btn-secondary inline-flex items-center gap-1 px-3 py-1.5 text-xs"
                            download={`qr_${p.productId}.png`}
                          >
                            <Download className="w-3 h-3" />
                            QR
                          </a>
                          <button
                            onClick={() => handleToggleStatus(p.productId, p.status)}
                            disabled={updatingStatus === p.productId}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                              p.status === 'active'
                                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                : 'bg-green-100 text-green-800 hover:bg-green-200'
                            }`}
                            title={p.status === 'active' ? 'Deactivate Product' : 'Activate Product'}
                          >
                            {updatingStatus === p.productId ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                            ) : p.status === 'active' ? (
                              <PowerOff className="w-3 h-3" />
                            ) : (
                              <Power className="w-3 h-3" />
                            )}
                            {p.status === 'active' ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.productId, p.productName)}
                            disabled={loading}
                            className="bg-red-100 text-red-800 hover:bg-red-200 inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination.pages > 1 && (
              <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(page - 1) * pagination.limit + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(page * pagination.limit, pagination.total)}
                  </span>{' '}
                  of <span className="font-medium">{pagination.total}</span> results
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                    disabled={page === pagination.pages}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProductList;
