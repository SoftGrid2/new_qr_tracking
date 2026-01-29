import { useEffect } from 'react';

const VerificationModal = ({ result, onClose }) => {
  const isSuccess = result?.status === 'verified';
  const isLastScan = result?.status === 'last_valid';
  const isInvalid = result?.status === 'invalid';

  // Determine UI based on status
  const getConfig = () => {
    if (isSuccess) {
      return {
        icon: '✅',
        title: 'Product Verified Successfully By SoftGrid Info Pvt. Ltd.',
        message: 'Your product has been verified successfully.',
        bgColor: 'rgba(22, 163, 74, 0.08)',
        borderColor: '#16a34a',
        textColor: '#16a34a',
        darkTextColor: '#15803d',
      };
    }
    if (isLastScan) {
      return {
        icon: '⚠️',
        title: 'Last Valid Scan',
        message: 'This product has reached its last valid scan.',
        bgColor: 'rgba(245, 158, 11, 0.08)',
        borderColor: '#f59e0b',
        textColor: '#d97706',
        darkTextColor: '#b45309',
      };
    }
    return {
      icon: '❌',
      title: 'Invalid anti-counterfeiting code',
      message: 'This QR code is no longer valid. ',
      // bgColor: 'rgba(220, 38, 38, 0.08)',
      borderColor: '#dc2626',
      textColor: '#991b1b',
      darkTextColor: '#7f1d1d',
    };
  };

  const config = getConfig();

  return (
    <div
      className="verification-modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        animation: 'fadeIn 0.3s ease-in-out',
        padding: '1rem',
      }}
    >
      <div
        className="verification-modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '1.25rem',
          padding: '2rem',
          maxWidth: '420px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)',
          animation: 'slideUp 0.4s ease-out',
        }}
      >
        {/* Icon */}
        <div
          style={{
            fontSize: '3.5rem',
            marginBottom: '1.25rem',
            animation: 'scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: config.bgColor,
            margin: '-3rem auto 1.25rem',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {config.icon}
        </div>

        {/* Title */}
        <h2
          style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#1f2937',
            marginBottom: '0.75rem',
            letterSpacing: '-0.02em',
          }}
        >
          {config.title}
        </h2>

        {/* Message */}
        <p
          style={{
            fontSize: '1rem',
            color: '#6b7280',
            marginBottom: '2rem',
            lineHeight: '1.6',
            fontWeight: '500',
          }}
        >
          {config.message}
        </p>

        {/* Product ID Section */}
        {result?.productId && (
          <div
            style={{
              backgroundColor: '#f9fafb',
              borderRadius: '0.75rem',
              padding: '1rem',
              marginBottom: '1.5rem',
              border: '1px solid #e5e7eb',
            }}
          >
            <p
              style={{
                fontSize: '0.75rem',
                color: '#9ca3af',
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontWeight: '600',
              }}
            >
              Product ID
            </p>
            <p
              style={{
                fontFamily: 'monospace',
                fontSize: '1rem',
                fontWeight: '700',
                color: '#1f2937',
                letterSpacing: '0.02em',
                wordBreak: 'break-all',
              }}
            >
              {result.productId}
            </p>
          </div>
        )}

        {/* Scan Count Section */}
        {/* {(result?.scanCount !== undefined || result?.maxScan !== undefined) && (
          <div
            style={{
              backgroundColor: config.bgColor,
              borderRadius: '0.75rem',
              padding: '1rem',
              marginBottom: '1.5rem',
              border: `1.5px solid ${config.borderColor}`,
            }}
          >
            <p
              style={{
                fontSize: '0.875rem',
                color: config.textColor,
                fontWeight: '600',
                margin: '0 0 0.5rem 0',
              }}
            >
              Scan Count
            </p>
            <p
              style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: config.textColor,
                margin: '0 0 0.5rem 0',
              }}
            >
              {result.scanCount ?? '-'} <span style={{ fontSize: '1rem', color: config.darkTextColor }}>/</span> {result.maxScan ?? 5}
            </p>
            <p
              style={{
                fontSize: '0.75rem',
                color: config.darkTextColor,
                margin: '0',
                fontWeight: '500',
              }}
            >
              {result.scanCount >= result.maxScan
                ? '⚠️ No scans remaining'
                : `${result.maxScan - result.scanCount} scans remaining`}
            </p>
          </div>
        )} */}

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            marginTop: '2rem',
          }}
        >
          {/* <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '0.875rem 1.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              border: 'none',
              borderRadius: '0.75rem',
              backgroundColor: isInvalid ? '#6b7280' : '#4f46e5',
              color: '#ffffff',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = isInvalid ? '#4b5563' : '#4338ca';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = `0 8px 16px ${isInvalid ? 'rgba(107, 114, 128, 0.3)' : 'rgba(79, 70, 229, 0.4)'}`;
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = isInvalid ? '#6b7280' : '#4f46e5';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            {isInvalid ? '🔄 Try Again' : '✓ Confirm'}
          </button> */}
        </div>

        {/* Secondary Action */}
        {/* <button
          onClick={onClose}
          style={{
            marginTop: '0.75rem',
            width: '100%',
            padding: '0.75rem 1.5rem',
            fontSize: '0.95rem',
            fontWeight: '500',
            border: '1px solid #e5e7eb',
            borderRadius: '0.75rem',
            backgroundColor: '#ffffff',
            color: '#6b7280',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#f9fafb';
            e.target.style.borderColor = '#d1d5db';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#ffffff';
            e.target.style.borderColor = '#e5e7eb';
          }}
        >
          ← Back
        </button> */}
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            transform: scale(0.5);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default VerificationModal;
