import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/forms.css';
import { apiClient } from '../api/api.js';
import VerificationModal from '../components/VerificationModal.jsx';

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const Verify = () => {
  const query = useQuery();
  const navigate = useNavigate();
  const pid = query.get('pid') || '';
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const verify = async () => {
      if (!pid) {
        setError('❌ Missing product ID in URL. Please scan a valid QR code.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        const res = await apiClient.get('/scan/verify', {
          params: { pid },
        });
        
        console.log('✅ Verify Response:', res.data);
        setResult(res.data);
        setError('');
        
        // Show popup for all responses (successful and failed)
        if (res.data.status === 'verified' || res.data.status === 'last_valid' || res.data.status === 'invalid') {
          setShowPopup(true);
        }
      } catch (err) {
        console.error('❌ Verify Error:', err);
        
        // Extract error message from backend response
        const message = 
          err.response?.data?.message ||
          err.message ||
          '❌ Invalid QR / Scan limit exceeded';
        
        const productId = err.response?.data?.productId || pid;
        const scanCount = err.response?.data?.scanCount;
        const maxScan = err.response?.data?.maxScan;
        
        // Set result with error details
        setResult({ 
          status: 'invalid', 
          message,
          productId,
          scanCount,
          maxScan,
        });
        setError(message);
        
        // Show popup for error cases too
        setShowPopup(true);
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

  const getStatusIcon = () => {
    if (!result) return '';
    if (result.status === 'verified') return '✅';
    if (result.status === 'last_valid') return '⚠️';
    return '❌';
  };

  const displayProductId = result?.productId || pid;

  return (
    <div
      className="page-centered"
      style={{
        padding: '1.5rem',
        background: 'radial-gradient(circle at top, #22c55e, #020617 55%, #0b1120)',
      }}
    >
      {/* Verification Modal - Shows on API response */}
      {showPopup && result && (
        <VerificationModal 
          result={result} 
          onClose={() => {
            setShowPopup(false);
            navigate(-1);
          }} 
        />
      )}

      {/* Loading & Main Card */}
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

        {displayProductId && (
          <div
            style={{
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '0.75rem',
              padding: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            <p
              style={{
                fontSize: '0.75rem',
                color: '#6b7280',
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                textAlign: 'center',
              }}
            >
              Product ID
            </p>
            <p
              style={{
                fontFamily: 'monospace',
                fontSize: '1.25rem',
                fontWeight: 'bold',
                textAlign: 'center',
                color: '#1f2937',
                letterSpacing: '0.05em',
                wordBreak: 'break-all',
              }}
            >
              {displayProductId}
            </p>
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div
              style={{
                display: 'inline-block',
                width: '40px',
                height: '40px',
                border: '4px solid #e5e7eb',
                borderTop: '4px solid #4f46e5',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginBottom: '1rem',
              }}
            />
            <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '1rem' }}>
              Verifying your product…
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="form-error" style={{ textAlign: 'center', marginBottom: '1rem' }}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default Verify;
