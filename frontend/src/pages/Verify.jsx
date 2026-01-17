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

  // Show ONLY the modal when verification is complete
  if (showPopup && result) {
    return (
      <VerificationModal 
        result={result} 
        onClose={() => {
          // setShowPopup(false);
          // // navigate(-1);
          // window.close();
        }} 
      />
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div
        className="page-centered flex-col"
        style={{
          padding: '1.5rem',
          background: 'radial-gradient(circle at top, #22c55e, #020617 55%, #0b1120)',
        }}
      >
        <div className="card shadow-lg" style={{ maxWidth: 420 }}>
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div
              style={{
                display: 'inline-block',
                width: '50px',
                height: '50px',
                border: '4px solid #e5e7eb',
                borderTop: '4px solid #4f46e5',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginBottom: '1.5rem',
              }}
            />
            <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '1.1rem', fontWeight: '500' }}>
              Verifying your product…
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state (should not reach here in normal flow)
  if (error) {
    return (
      <div
        className="page-centered flex-col"
        style={{
          padding: '1.5rem',
          background: 'radial-gradient(circle at top, #22c55e, #020617 55%, #0b1120)',
        }}
      >
        <div className="card shadow-lg" style={{ maxWidth: 420 }}>
          <h1 className="card-title" style={{ textAlign: 'center', color: '#dc2626' }}>
            ❌ Verification Error
          </h1>
          <div className="form-error" style={{ textAlign: 'center', marginBottom: '1rem' }}>
            {error}
          </div>
        </div>
      </div>
    );
  }

  // Default render (should not reach here)
  return (
    <div
      className="page-centered flex-col"
      style={{
        padding: '1.5rem',
        background: 'radial-gradient(circle at top, #22c55e, #020617 55%, #0b1120)',
      }}
    >
      <div className="card shadow-lg" style={{ maxWidth: 420 }}>
        <h1 className="card-title" style={{ textAlign: 'center' }}>
          Product Verification
        </h1>
        <p style={{ textAlign: 'center', color: '#6b7280' }}>
          Loading…
        </p>
      </div>
    </div>
  );
};

export default Verify;
