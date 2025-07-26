import { useEffect, useState } from 'react';

export function AuthSuccessPage() {
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Simulate getting token from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const authToken = urlParams.get('token');

    if (!authToken) {
      setError('No authentication token received');
      setIsProcessing(false);
      return;
    }

    try {
      // Store the token in component state
      setToken(authToken);

      // Decode the JWT to get user info
      const payload = JSON.parse(atob(authToken.split('.')[1]));
      const userData = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      };
      setUser(userData);

      // Simulate a brief processing time for better UX
      setTimeout(() => {
        setIsProcessing(false);
        // Auto-redirect simulation after 2 seconds
        setTimeout(() => {
          console.log('Would redirect to dashboard now');
          // In a real app: window.location.href = "/dashboard"
        }, 2000);
      }, 1000);
    } catch (err) {
      console.error('Error processing authentication:', err);
      setError('Failed to process authentication token');
      setIsProcessing(false);
    }
  }, []);

  const handleBackToLogin = () => {
    console.log('Would redirect to login');
    // In a real app: window.location.href = "/login"
  };

  const handleContinueToDashboard = () => {
    console.log('Would redirect to dashboard');
    // In a real app: window.location.href = "/dashboard"
  };

  if (error) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f9fafb',
          padding: '1rem',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '28rem',
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            padding: '1.5rem',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <h2
              style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#dc2626',
                margin: '0 0 0.5rem 0',
              }}
            >
              Authentication Error
            </h2>
            <p
              style={{
                color: '#6b7280',
                margin: 0,
              }}
            >
              {error}
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={handleBackToLogin}
              style={{
                width: '100%',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = '#2563eb')}
              onMouseOut={(e) => (e.target.style.backgroundColor = '#3b82f6')}
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f9fafb',
        padding: '1rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '28rem',
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          padding: '1.5rem',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            {isProcessing ? (
              <div
                style={{
                  width: '3rem',
                  height: '3rem',
                  margin: '0 auto',
                  border: '3px solid #e5e7eb',
                  borderTop: '3px solid #3b82f6',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }}
              ></div>
            ) : (
              <div
                style={{
                  width: '3rem',
                  height: '3rem',
                  margin: '0 auto',
                  backgroundColor: '#10b981',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                }}
              >
                ✓
              </div>
            )}
          </div>
          <h2
            style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: isProcessing ? '#3b82f6' : '#10b981',
              margin: '0 0 0.5rem 0',
            }}
          >
            {isProcessing ? 'Processing...' : 'Authentication Successful!'}
          </h2>
          <p
            style={{
              color: '#6b7280',
              margin: 0,
            }}
          >
            {isProcessing
              ? 'Please wait while we set up your account...'
              : 'You will be redirected to your dashboard shortly.'}
          </p>
        </div>
        {!isProcessing && (
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={handleContinueToDashboard}
              style={{
                width: '100%',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = '#2563eb')}
              onMouseOut={(e) => (e.target.style.backgroundColor = '#3b82f6')}
            >
              Continue to Dashboard
            </button>
          </div>
        )}
      </div>
      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
