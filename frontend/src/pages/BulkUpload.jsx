import { useState } from 'react';
import { apiClient } from '../api/api.js';
import { Upload, FileSpreadsheet, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const BulkUpload = () => {
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) {
      setFile(null);
      return;
    }

    // Validate file type
    const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
    if (fileExtension !== 'xlsx' && fileExtension !== 'xls') {
      setError('Please select a valid Excel file (.xlsx or .xls)');
      setFile(null);
      e.target.value = ''; // Reset input
      return;
    }

    // Validate file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      setFile(null);
      e.target.value = '';
      return;
    }

    setError('');
    setFile(selectedFile);
    setSummary(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSummary(null);

    if (!file) {
      setError('Please select an Excel (.xlsx) file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      const res = await apiClient.post('/upload/excel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSummary(res.data);
      // Clear file input after successful upload
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
      setFile(null);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to upload file. Please check format and try again.'
      );
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Bulk Upload Products</h1>
        <p className="text-gray-600 mt-2">
          Upload an Excel file with columns <strong>product_id</strong> and{' '}
          <strong>product_name</strong>.
        </p>
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Requirements:</strong>
          </p>
          <ul className="text-sm text-blue-700 mt-2 list-disc list-inside space-y-1">
            <li>Excel file must have headers: <code className="bg-blue-100 px-1 rounded">product_id</code> and <code className="bg-blue-100 px-1 rounded">product_name</code></li>
            <li>Product ID must be exactly 16 digits (numbers only)</li>
            <li><strong>Important:</strong> Format the <code className="bg-blue-100 px-1 rounded">product_id</code> column as <strong>Text</strong> in Excel to preserve leading zeros</li>
            <li>Product name is required for each row</li>
            <li>Duplicate product IDs will be skipped</li>
          </ul>
        </div>
      </div>

      <div className="card max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Excel file (.xlsx)
            </label>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-10 h-10 mb-3 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">Excel files only (.xlsx)</p>
              </div>
              <input
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
            {file && (
              <div className="mt-2 flex items-center gap-2 text-sm text-gray-700">
                <FileSpreadsheet className="w-4 h-4" />
                <span>{file.name}</span>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || !file}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload File
              </>
            )}
          </button>
        </form>

        {summary && (
          <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Summary</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Rows</p>
                  <p className="text-lg font-semibold text-gray-900">{summary.totalRows || 0}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Successfully Inserted</p>
                  <p className="text-lg font-semibold text-gray-900">{summary.inserted || 0}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Skipped Invalid</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {summary.skippedInvalid || 0}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Skipped Duplicate</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {summary.skippedDuplicate || 0}
                  </p>
                </div>
              </div>
            </div>
            
            {summary.errors && summary.errors.length > 0 && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm font-medium text-yellow-800 mb-2">
                  Validation Errors (showing first {summary.errors.length}):
                </p>
                <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                  {summary.errors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {summary.inserted > 0 && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-800">
                  ✓ Successfully uploaded {summary.inserted} product{summary.inserted !== 1 ? 's' : ''}!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkUpload;
