import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import '../styles/forms.css';
import { apiClient } from '../api/api.js';

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const Verify = () => {
  const query = useQuery();
  const pid = query.get('pid') || '';
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const verify = async () => {
      if (!pid) {
        setError('Missing product ID in URL.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await apiClient.get('/scan/verify', {
          params: { pid },
        });
        setResult(res.data);
      } catch (err) {
        const message =
          err.response?.data?.message ||
          '❌ Invalid QR / Scan limit exceeded';
        setResult({ status: 'invalid', message });
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [pid]);

  const getStatusClass = () => {
    if (!result) return '';
    if (result.status === 'verified') return 'badge badge-green';
    if (result.status === 'last_valid') return 'badge badge-amber';
    return 'badge badge-red';
  };

  return (
    <div
      className="page-centered"
      style={{
        padding: '1.5rem',
        background:
          'radial-gradient(circle at top, #22c55e, #020617 55%, #0b1120)',
      }}
    >
      <div className="card shadow-lg" style={{ maxWidth: 420 }}>
        <h1 className="card-title" style={{ textAlign: 'center' }}>
          Product Verification
        </h1>
        <p
          className="card-subtitle"
          style={{ textAlign: 'center', marginBottom: '1.25rem' }}
        >
          Scanned via QR code
        </p>
        {pid && (
          <p
            style={{
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              textAlign: 'center',
              marginBottom: '1rem',
              color: '#9ca3af',
            }}
          >
            Product ID: {pid}
          </p>
        )}
        {loading && <p style={{ textAlign: 'center' }}>Verifying…</p>}
        {!loading && error && (
          <div className="form-error" style={{ textAlign: 'center' }}>
            {error}
          </div>
        )}
        {!loading && result && (
          <div
            style={{
              textAlign: 'center',
              marginBottom: '0.75rem',
              fontSize: '1.05rem',
            }}
          >
            <span className={getStatusClass()}>{result.message}</span>
          </div>
        )}
        {!loading && result && (
          <p
            style={{
              textAlign: 'center',
              fontSize: '0.8rem',
              color: '#6b7280',
            }}
          >
            Scans used: {result.scanCount ?? '-'} / {result.maxScan ?? 5}
          </p>
        )}
      </div>
    </div>
  );
};

export default Verify;
