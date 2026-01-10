import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/forms.css';
import { apiClient } from '../api/api.js';

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
        background:
          'radial-gradient(circle at top, #22c55e, #020617 55%, #0b1120)',
      }}
    >
      {/* Success/Error Popup Modal */}
      {showPopup && result && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            animation: 'fadeIn 0.3s ease-in',
          }}
          onClick={() => setShowPopup(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '1.5rem',
              padding: '2.5rem',
              maxWidth: '420px',
              width: '90%',
              textAlign: 'center',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.3)',
              animation: 'slideUp 0.4s ease-out',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                fontSize: '4rem',
                marginBottom: '1rem',
                animation: 'scaleIn 0.5s ease-out',
              }}
            >
              {getStatusIcon()}
            </div>
            <h2
              style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '0.5rem',
              }}
            >
              {result?.status === 'verified' 
                ? '✅ Scan Successful!' 
                : result?.status === 'last_valid'
                ? '⚠️ Last Valid Scan'
                : '❌ Verification Failed'}
            </h2>
            <p
              style={{
                fontSize: '1rem',
                color: '#6b7280',
                marginBottom: '1.5rem',
                lineHeight: '1.5',
              }}
            >
              {result?.message}
            </p>
            
            {displayProductId && (
              <div
                style={{
                  backgroundColor: '#f3f4f6',
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  marginBottom: '1.5rem',
                }}
              >
                <p
                  style={{
                    fontSize: '0.75rem',
                    color: '#6b7280',
                    marginBottom: '0.25rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Product ID
                </p>
                <p
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    color: '#1f2937',
                    letterSpacing: '0.05em',
                  }}
                >
                  {displayProductId}
                </p>
              </div>
            )}
            
            {result && (result.scanCount !== undefined || result.maxScan !== undefined) && (
              <div
                style={{
                  backgroundColor: result.status === 'verified' 
                    ? 'rgba(22, 163, 74, 0.1)' 
                    : result.status === 'last_valid'
                    ? 'rgba(245, 158, 11, 0.1)'
                    : 'rgba(220, 38, 38, 0.1)',
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  marginBottom: '1.5rem',
                  border: `2px solid ${
                    result.status === 'verified' 
                      ? '#16a34a' 
                      : result.status === 'last_valid'
                      ? '#f59e0b'
                      : '#dc2626'
                  }`,
                }}
              >
                <p
                  style={{
                    fontSize: '0.875rem',
                    color: 
                      result.status === 'verified' 
                        ? '#16a34a' 
                        : result.status === 'last_valid'
                        ? '#d97706'
                        : '#991b1b',
                    fontWeight: '600',
                    margin: '0',
                  }}
                >
                  Scans Used: <strong>{result.scanCount ?? '-'} / {result.maxScan ?? 5}</strong>
                </p>
                <p
                  style={{
                    fontSize: '0.75rem',
                    color: 
                      result.status === 'verified' 
                        ? '#15803d' 
                        : result.status === 'last_valid'
                        ? '#b45309'
                        : '#7f1d1d',
                    marginTop: '0.5rem',
                    margin: '0.5rem 0 0 0',
                  }}
                >
                  {result.scanCount >= result.maxScan 
                    ? '⚠️ All scans used - Product marked invalid' 
                    : `${result.maxScan - result.scanCount} scans remaining`}
                </p>
              </div>
            )}
            
            <div
              style={{
                display: 'flex',
                gap: '0.75rem',
                justifyContent: 'center',
              }}
            >
              <button
                onClick={() => setShowPopup(false)}
                style={{
                  backgroundColor: result?.status === 'invalid' ? '#6b7280' : '#4f46e5',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '0.75rem',
                  padding: '0.75rem 1.5rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  flex: 1,
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = result?.status === 'invalid' ? '#4b5563' : '#4338ca';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = result?.status === 'invalid' ? '#6b7280' : '#4f46e5';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                {result?.status === 'invalid' ? 'Try Again' : 'Continue'}
              </button>
              <button
                onClick={() => {
                  setShowPopup(false);
                  navigate(-1);
                }}
                style={{
                  backgroundColor: '#6b7280',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '0.75rem',
                  padding: '0.75rem 1.5rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  flex: 1,
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#4b5563';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = '#6b7280';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                ← Go Back
              </button>
            </div>
          </div>
        </div>
      )}

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
            <p style={{ textAlign: 'center', color: '#6b7280' }}>Verifying…</p>
          </div>
        )}
        {!loading && error && (
          <div className="form-error" style={{ textAlign: 'center', marginBottom: '1rem' }}>
            {error}
          </div>
        )}
        {!loading && result && (
          <div
            style={{
              textAlign: 'center',
              marginBottom: '0.75rem',
              fontSize: '1.1rem',
            }}
          >
            <span 
              className={getStatusClass()} 
              style={{ 
                padding: '0.5rem 1rem', 
                fontSize: '1rem',
                display: 'inline-block',
              }}
            >
              {getStatusIcon()} {result.message}
            </span>
          </div>
        )}
        {!loading && result && (result.scanCount !== undefined || result.maxScan !== undefined) && (
          <div
            style={{
              textAlign: 'center',
              padding: '0.75rem 1rem',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              borderRadius: '0.5rem',
              borderLeft: '4px solid #3b82f6',
            }}
          >
            <p
              style={{
                textAlign: 'center',
                fontSize: '0.875rem',
                color: '#6b7280',
                margin: '0',
              }}
            >
              <strong>Scans used:</strong> {result.scanCount ?? '-'} / {result.maxScan ?? 5}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Verify;
