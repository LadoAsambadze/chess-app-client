import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { setAccessToken } from '../../utils/token.utils'; // Adjust path as needed

export function AuthSuccess() {
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authToken = urlParams.get('token');

    if (!authToken) {
      setError('No authentication token received');
      setIsProcessing(false);
      return;
    }

    try {
      // Use your token utility function to save the token
      setAccessToken(authToken);

      // Decode token payload (assuming JWT)
      const payload = JSON.parse(atob(authToken.split('.')[1]));
      const userData = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      };
      // You can do something with userData here if needed
      // For example, set in some global context or local state

      // Simulate processing delay for UX
      setTimeout(() => {
        setIsProcessing(false);
        setTimeout(() => {
          console.log('Would redirect to dashboard now');
          // window.location.href = '/dashboard';
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
    // window.location.href = '/login';
  };

  const handleContinueToDashboard = () => {
    console.log('Would redirect to dashboard');
    // window.location.href = '/dashboard';
  };

  if (error) {
    return (
      <Box
        minHeight="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bgcolor="#f9fafb"
        p={2}
      >
        <Box
          maxWidth={448}
          width="100%"
          bgcolor="background.paper"
          borderRadius={2}
          boxShadow={3}
          p={3}
          textAlign="center"
        >
          <ErrorOutlineIcon sx={{ fontSize: 48, color: 'error.main', mb: 1 }} />
          <Typography variant="h5" color="error" fontWeight="bold" gutterBottom>
            Authentication Error
          </Typography>
          <Typography color="text.secondary" mb={3}>
            {error}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleBackToLogin}
          >
            Back to Login
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bgcolor="#f9fafb"
      p={2}
    >
      <Box
        maxWidth={448}
        width="100%"
        bgcolor="background.paper"
        borderRadius={2}
        boxShadow={3}
        p={3}
        textAlign="center"
      >
        <Box mb={2}>
          {isProcessing ? (
            <CircularProgress size={48} color="primary" />
          ) : (
            <CheckCircleIcon
              sx={{ fontSize: 48, color: 'success.main', mx: 'auto' }}
            />
          )}
        </Box>
        <Typography
          variant="h5"
          fontWeight="bold"
          color={isProcessing ? 'primary.main' : 'success.main'}
          gutterBottom
        >
          {isProcessing ? 'Processing...' : 'Authentication Successful!'}
        </Typography>
        <Typography color="text.secondary" mb={3}>
          {isProcessing
            ? 'Please wait while we set up your account...'
            : 'You will be redirected to your dashboard shortly.'}
        </Typography>

        {!isProcessing && (
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleContinueToDashboard}
          >
            Continue to Dashboard
          </Button>
        )}
      </Box>
    </Box>
  );
}
