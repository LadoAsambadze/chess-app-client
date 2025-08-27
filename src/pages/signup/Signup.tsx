import type React from 'react';
import { useState, useEffect } from 'react';
import {
  Link,
  useNavigate,
  useLocation,
  useSearchParams,
} from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  UserPlus,
  X,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useSignUp } from '../../hooks/useAuth';
import { ROUTES } from '../../constants/routes';

// Google Icon Component
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="currentColor"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="currentColor"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="currentColor"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

interface SignupFormData {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  phone: string;
}

export const Signup = () => {
  const [formData, setFormData] = useState<SignupFormData>({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    phone: '',
  });
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { mutate: signUp, isLoading, error } = useSignUp();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Handle Google OAuth callback
  useEffect(() => {
    const handleGoogleCallback = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('message');

      if (error) {
        setAuthError(decodeURIComponent(error));
        navigate(location.pathname, { replace: true });
        return;
      }

      if (token) {
        localStorage.setItem('accessToken', token);
        setAuthSuccess(
          'Google authentication successful! Redirecting to dashboard...'
        );
        navigate(location.pathname, { replace: true });
        setTimeout(() => {
          navigate(ROUTES.DASHBOARD);
        }, 1500);
      }
    };

    if (searchParams.get('token') || searchParams.get('message')) {
      handleGoogleCallback();
    }
  }, [searchParams, navigate, location]);

  useEffect(() => {
    if (error) {
      setAuthError((error as Error).message || 'Failed to create account');
    }
  }, [error]);

  const validatePassword = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!formData.firstname.trim()) {
      errors.firstname = 'First name is required';
    }

    if (!formData.lastname.trim()) {
      errors.lastname = 'Last name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    }

    if (
      formData.phone &&
      !/^[+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))
    ) {
      errors.phone = 'Please enter a valid phone number';
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

    if (name === 'password') {
      setPasswordStrength(validatePassword(value));
    }

    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }

    if (authError) {
      setAuthError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    if (!validateForm()) return;

    signUp(
      {
        firstname: formData.firstname.trim(),
        lastname: formData.lastname.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone?.trim() || undefined,
      },
      {
        onSuccess: () => {
          setAuthSuccess('Account created successfully! You can now sign in.');
          setFormData({
            firstname: '',
            lastname: '',
            email: '',
            password: '',
            phone: '',
          });
          setPasswordStrength(0);

          setTimeout(() => {
            navigate(ROUTES.SIGNIN);
          }, 2000);
        },
        onError: (err: any) => {
          console.error('Signup error:', err);
          setAuthError(err.message || 'Failed to create account');
        },
      }
    );
  };

  const handleGoogleSignup = async () => {
    setAuthError(null);
    setGoogleLoading(true);

    try {
      const backendUrl = 'http://localhost:4000';
      window.location.href = `${backendUrl}/auth/google`;
    } catch (error: any) {
      console.error('Google signup error:', error);
      setAuthError('Failed to initiate Google sign up');
      setGoogleLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const getPasswordStrengthText = (): string => {
    switch (passwordStrength) {
      case 0:
      case 1:
        return 'Very Weak';
      case 2:
        return 'Weak';
      case 3:
        return 'Fair';
      case 4:
        return 'Good';
      case 5:
        return 'Strong';
      default:
        return '';
    }
  };

  const getPasswordStrengthColor = (): string => {
    switch (passwordStrength) {
      case 0:
      case 1:
        return 'bg-red-500';
      case 2:
        return 'bg-orange-500';
      case 3:
        return 'bg-yellow-500';
      case 4:
        return 'bg-green-400';
      case 5:
        return 'bg-green-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getPasswordStrengthTextColor = (): string => {
    switch (passwordStrength) {
      case 0:
      case 1:
        return 'text-red-500';
      case 2:
        return 'text-orange-500';
      case 3:
        return 'text-yellow-500';
      case 4:
        return 'text-green-400';
      case 5:
        return 'text-green-500';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/95 backdrop-blur-sm shadow-2xl rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-8 text-center text-white">
            <div className="mb-4">
              <UserPlus className="h-12 w-12 mx-auto" />
            </div>
            <h1 className="text-3xl font-bold">Create Your Account</h1>
            <p className="text-blue-100 mt-2">Join us today and get started</p>
          </div>

          <div className="px-8 py-8">
            {/* Success Alert */}
            {authSuccess && (
              <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-sm text-green-800">{authSuccess}</span>
                  <button
                    onClick={() => setAuthSuccess(null)}
                    className="ml-auto text-green-500 hover:text-green-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Error Alert */}
            {authError && (
              <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                  <span className="text-sm text-red-800">{authError}</span>
                  <button
                    onClick={() => setAuthError(null)}
                    className="ml-auto text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Google Sign Up Button */}
            <button
              type="button"
              onClick={handleGoogleSignup}
              disabled={isLoading || googleLoading}
              className="w-full flex justify-center items-center px-6 py-4 border-2 border-red-300 rounded-xl shadow-sm text-lg font-semibold text-red-600 bg-white hover:bg-red-50 hover:border-red-400 hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-300 ease-in-out mb-6"
            >
              {googleLoading ? (
                <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-3" />
              ) : (
                <GoogleIcon />
              )}
              <span className="ml-3">
                {googleLoading ? 'Redirecting...' : 'Continue with Google'}
              </span>
            </button>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">OR</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Fields Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="firstname"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    First Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="firstname"
                      name="firstname"
                      type="text"
                      autoComplete="given-name"
                      required
                      value={formData.firstname}
                      onChange={handleInputChange}
                      disabled={isLoading || googleLoading}
                      className={`block w-full pl-10 pr-3 py-3 border ${
                        validationErrors.firstname
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      } rounded-xl shadow-sm bg-white placeholder-gray-500 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200`}
                      placeholder="Enter your first name"
                    />
                  </div>
                  {validationErrors.firstname && (
                    <p className="mt-1 text-sm text-red-600">
                      {validationErrors.firstname}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="lastname"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Last Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="lastname"
                      name="lastname"
                      type="text"
                      autoComplete="family-name"
                      required
                      value={formData.lastname}
                      onChange={handleInputChange}
                      disabled={isLoading || googleLoading}
                      className={`block w-full pl-10 pr-3 py-3 border ${
                        validationErrors.lastname
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      } rounded-xl shadow-sm bg-white placeholder-gray-500 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200`}
                      placeholder="Enter your last name"
                    />
                  </div>
                  {validationErrors.lastname && (
                    <p className="mt-1 text-sm text-red-600">
                      {validationErrors.lastname}
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isLoading || googleLoading}
                    className={`block w-full pl-10 pr-3 py-3 border ${
                      validationErrors.email
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    } rounded-xl shadow-sm bg-white placeholder-gray-500 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200`}
                    placeholder="Enter your email address"
                  />
                </div>
                {validationErrors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {validationErrors.email}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Phone Number (optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={isLoading || googleLoading}
                    className={`block w-full pl-10 pr-3 py-3 border ${
                      validationErrors.phone
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    } rounded-xl shadow-sm bg-white placeholder-gray-500 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200`}
                    placeholder="Enter your phone number"
                  />
                </div>
                {validationErrors.phone && (
                  <p className="mt-1 text-sm text-red-600">
                    {validationErrors.phone}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={isLoading || googleLoading}
                    className={`block w-full pl-10 pr-12 py-3 border ${
                      validationErrors.password
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    } rounded-xl shadow-sm bg-white placeholder-gray-500 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200`}
                    placeholder="Enter your password"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      disabled={isLoading || googleLoading}
                      className="text-gray-400 hover:text-gray-600 focus:outline-none disabled:opacity-50"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
                {validationErrors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {validationErrors.password}
                  </p>
                )}

                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getPasswordStrengthColor()} transition-all duration-300 rounded-full`}
                          style={{ width: `${(passwordStrength / 5) * 100}%` }}
                        />
                      </div>
                      <span
                        className={`text-xs font-semibold ${getPasswordStrengthTextColor()}`}
                      >
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || googleLoading}
                className="w-full flex justify-center items-center px-6 py-4 border border-transparent rounded-xl shadow-sm text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-300 ease-in-out"
              >
                {isLoading ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5 mr-3" />
                    Create Account
                  </>
                )}
              </button>
            </form>

            {/* Sign In Link */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  to={ROUTES.SIGNIN}
                  className="font-semibold text-blue-600 hover:text-blue-500 hover:underline focus:outline-none focus:underline transition-colors duration-200"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            © 2025 Your Company. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};
