import { useState, useEffect } from 'react';
import { apiClient } from '../api/api.js';
import { Download, Upload, CheckSquare, Square, Loader } from 'lucide-react';

const QRManagement = () => {
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/products', { params: { limit: 1000 } });
      setProducts(res.data.products || []);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map((p) => p.productId));
    }
  };

  const handleSelectProduct = (productId) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter((id) => id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  const handleBulkDownload = async () => {
    try {
      setDownloading(true);
      const productIds = selectedProducts.length > 0 ? selectedProducts : null;

      const response = await apiClient.post(
        '/qr/bulk-download',
        { productIds },
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `qr_codes_${Date.now()}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSelectedProducts([]);
    } catch (err) {
      console.error('Failed to download QR codes:', err);
      alert('Failed to download QR codes. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handleBulkImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      // This is a placeholder - implement based on backend API
      alert('Bulk QR import feature is being implemented');
    } catch (err) {
      console.error('Failed to import QR codes:', err);
      alert('Failed to import QR codes. Please try again.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">QR Management</h1>
        <p className="text-gray-600 mt-2">
          Download QR codes in bulk or import custom QR designs
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Bulk QR Download</h2>
          <p className="text-gray-600 mb-4">
            Download all or selected product QR codes as a ZIP file. Each QR image contains the
            product ID printed below.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleBulkDownload}
              disabled={downloading || products.length === 0}
              className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {downloading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  {selectedProducts.length > 0
                    ? `Download Selected (${selectedProducts.length})`
                    : 'Download All QR Codes'}
                </>
              )}
            </button>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Bulk QR Import</h2>
          <p className="text-gray-600 mb-4">
            Upload a ZIP file containing custom QR images. File names should contain productId
            (e.g., QR_1234567812345678.png).
          </p>
          <label className="btn-secondary inline-flex items-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4" />
            <input
              type="file"
              accept=".zip"
              onChange={handleBulkImport}
              className="hidden"
              disabled={uploading}
            />
            {uploading ? 'Uploading...' : 'Upload ZIP File'}
          </label>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Select Products</h2>
          <button
            onClick={handleSelectAll}
            className="btn-secondary flex items-center gap-2"
          >
            {selectedProducts.length === products.length ? (
              <>
                <CheckSquare className="w-4 h-4" />
                Deselect All
              </>
            ) : (
              <>
                <Square className="w-4 h-4" />
                Select All
              </>
            )}
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : products.length === 0 ? (
          <p className="text-center py-12 text-gray-500">No products found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === products.length && products.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(p.productId)}
                        onChange={() => handleSelectProduct(p.productId)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {p.productName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                      {p.productId}
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRManagement;
