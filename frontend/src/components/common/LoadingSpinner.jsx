import React from 'react';

const LoadingSpinner = ({ message = 'Loading...', size = 'medium' }) => {
  const sizes = {
    small: { spinner: '32px', text: '14px' },
    medium: { spinner: '48px', text: '16px' },
    large: { spinner: '64px', text: '18px' }
  };

  const selectedSize = sizes[size] || sizes.medium;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 0',
      gap: '16px',
      width: '100%',
      minHeight: '200px'
    }}>
      <div style={{
        width: selectedSize.spinner,
        height: selectedSize.spinner,
        border: `4px solid ${document.documentElement.getAttribute('data-theme') === 'dark' ? '#334155' : '#e2e8f0'}`,
        borderTop: `4px solid #2563eb`,
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <div style={{
        color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#94a3b8' : '#64748b',
        fontSize: selectedSize.text,
        fontWeight: '500'
      }}>
        {message}
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;