import { useState, useEffect } from 'react';

export function AuthSuccess() {
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Completing authentication...');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleAuthentication = async () => {
      try {
        setStatus('processing');
        setMessage('Verifying authentication...');
        setProgress(25);

        await new Promise((resolve) => setTimeout(resolve, 800));

        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const accessToken = params.get('accessToken');

        setProgress(50);
        setMessage('Securing your session...');

        await new Promise((resolve) => setTimeout(resolve, 600));

        if (!accessToken) {
          throw new Error('No access token found');
        }

        localStorage.setItem('accessToken', accessToken);

        localStorage.setItem('tokenTimestamp', Date.now().toString());

        setProgress(75);
        setMessage('Setting up your account...');

        await new Promise((resolve) => setTimeout(resolve, 600));

        window.history.replaceState(null, '', window.location.pathname);

        setStatus('success');
        setMessage('Login successful! Redirecting...');
        setProgress(100);

        window.dispatchEvent(new Event('authSuccess'));

        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      } catch (error) {
        console.error('Authentication error:', error);
        setStatus('error');
        setMessage('Authentication failed. Please try again.');
        setProgress(0);

        setTimeout(() => {
          window.location.href = '/signin';
        }, 3000);
      }
    };

    handleAuthentication();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full text-center border border-white/20 shadow-2xl">
        <div className="mb-6">
          {status === 'processing' && (
            <div className="w-16 h-16 mx-auto">
              <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
            </div>
          )}

          {status === 'success' && (
            <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center animate-pulse">
              <svg
                className="w-8 h-8 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          )}

          {status === 'error' && (
            <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          )}
        </div>

        <h2 className="text-2xl font-bold text-white mb-4">
          {status === 'processing' && 'Almost there...'}
          {status === 'success' && 'Welcome back!'}
          {status === 'error' && 'Oops!'}
        </h2>

        <p className="text-white/80 mb-6 text-lg">{message}</p>

        {status !== 'error' && (
          <div className="w-full bg-white/20 rounded-full h-2 mb-6 overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-400 to-blue-400 h-2 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}

        {status === 'success' && (
          <div className="text-sm text-white/60">
            <p>✓ Authentication verified</p>
            <p>✓ Account secured</p>
            <p>✓ Session established</p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-sm text-white/60">
            <p>Please check your connection and try again</p>
          </div>
        )}

        {status === 'processing' && (
          <div className="flex justify-center space-x-1 mt-4">
            <div
              className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
              style={{ animationDelay: '0ms' }}
            ></div>
            <div
              className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
              style={{ animationDelay: '150ms' }}
            ></div>
            <div
              className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
              style={{ animationDelay: '300ms' }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
}
