import React, { useState, useEffect } from 'react';
import {
  Link,
  useNavigate,
  useLocation,
  useSearchParams,
} from 'react-router-dom';
import {
  Box,
  CardContent,
  TextField,
  Typography,
  Alert,
  Container,
  Divider,
  IconButton,
  InputAdornment,
  Stack,
  Paper,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Login,
  Google,
} from '@mui/icons-material';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../providers/auth-provider';
import { ROUTES } from '../../constants/routes';

export const Signin = () => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const [authError, setAuthError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { signin, isLoading, loginWithToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const from = location.state?.from?.pathname || ROUTES.DASHBOARD;

  // Handle Google OAuth callback
  useEffect(() => {
    const handleGoogleCallback = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('message');

      if (error) {
        setAuthError(decodeURIComponent(error));
        // Clean URL
        navigate(location.pathname, { replace: true });
        return;
      }

      if (token) {
        try {
          // If your auth provider has a method to login with token
          await loginWithToken?.(token);
          navigate(from, { replace: true });
        } catch (err: any) {
          setAuthError(err.message || 'Google authentication failed');
        }
        // Clean URL
        navigate(location.pathname, { replace: true });
      }
    };

    // Check if we're on auth success/error route
    if (
      location.pathname.includes('/auth/success') ||
      location.pathname.includes('/auth/error')
    ) {
      handleGoogleCallback();
    }
  }, [searchParams, navigate, location, from, loginWithToken]);

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }

    // Clear auth error on any input change
    if (authError) {
      setAuthError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!validateForm()) return;

    try {
      await signin({
        email: formData.email.trim(),
        password: formData.password,
      });

      // Navigate to intended page on success
      navigate(from, { replace: true });
    } catch (error: any) {
      console.error('Signin error:', error);
      setAuthError(error.message || 'Failed to sign in');

      // Clear password field for security
      setFormData((prev) => ({ ...prev, password: '' }));
    }
  };

  const handleGoogleSignin = async () => {
    setAuthError(null);
    setGoogleLoading(true);

    try {
      // Get your backend API URL from environment or config
      const backendUrl = 'http://localhost:4000';

      // Redirect to Google OAuth endpoint
      window.location.href = `${backendUrl}/auth/google`;
    } catch (error: any) {
      console.error('Google signin error:', error);
      setAuthError('Failed to initiate Google sign in');
      setGoogleLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${alpha(
          theme.palette.primary.main,
          0.1
        )} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 3,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={10}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            background: alpha(theme.palette.background.paper, 0.95),
            backdropFilter: 'blur(10px)',
          }}
        >
          <Box
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              color: 'white',
              py: 4,
              textAlign: 'center',
            }}
          >
            <Login sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="h4" component="h1" fontWeight="bold">
              Welcome Back
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, mt: 1 }}>
              Sign in to your account
            </Typography>
          </Box>

          <CardContent sx={{ p: 4 }}>
            {authError && (
              <Alert
                severity="error"
                sx={{ mb: 3, borderRadius: 2 }}
                onClose={() => setAuthError(null)}
              >
                {authError}
              </Alert>
            )}

            {/* Google Sign In Button */}
            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={handleGoogleSignin}
              loading={googleLoading}
              disabled={isLoading || googleLoading}
              startIcon={<Google />}
              sx={{
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1.1rem',
                fontWeight: 600,
                borderColor: '#db4437',
                color: '#db4437',
                mb: 3,
                '&:hover': {
                  borderColor: '#c23321',
                  backgroundColor: alpha('#db4437', 0.04),
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[4],
                },
                '&:disabled': {
                  borderColor: theme.palette.action.disabled,
                  color: theme.palette.action.disabled,
                },
                transition: 'all 0.3s ease-in-out',
              }}
            >
              {googleLoading ? 'Redirecting...' : 'Continue with Google'}
            </Button>

            <Divider sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary">
                OR
              </Typography>
            </Divider>

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  id="email"
                  name="email"
                  label="Email Address"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  error={!!validationErrors.email}
                  helperText={validationErrors.email}
                  disabled={isLoading || googleLoading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />

                <TextField
                  fullWidth
                  id="password"
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleInputChange}
                  error={!!validationErrors.password}
                  helperText={validationErrors.password}
                  disabled={isLoading || googleLoading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={togglePasswordVisibility}
                          edge="end"
                          disabled={isLoading || googleLoading}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  loading={isLoading}
                  disabled={isLoading || googleLoading}
                  loadingPosition="start"
                  startIcon={<Login />}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                      transform: 'translateY(-2px)',
                      boxShadow: theme.shadows[8],
                    },
                    '&:disabled': {
                      background: theme.palette.action.disabled,
                    },
                    transition: 'all 0.3s ease-in-out',
                  }}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </Stack>

              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography
                  component={Link}
                  to="/forgot-password"
                  variant="body2"
                  sx={{
                    color: theme.palette.primary.main,
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Forgot your password?
                </Typography>
              </Box>

              <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  OR
                </Typography>
              </Divider>

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Don't have an account?{' '}
                  <Typography
                    component={Link}
                    to={ROUTES.SIGNUP}
                    variant="body2"
                    sx={{
                      color: theme.palette.primary.main,
                      textDecoration: 'none',
                      fontWeight: 600,
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    Create one now
                  </Typography>
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Paper>

        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            © 2025 Your Company. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};
