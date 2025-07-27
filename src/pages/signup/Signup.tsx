'use client';

import type React from 'react';

import { useState, useEffect } from 'react';

export function Signup() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    phone: '',
  });

  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const errorMessage = urlParams.get('message');

    if (token) {
      setSuccess('Google authentication successful!');
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (errorMessage) {
      setError(decodeURIComponent(errorMessage));
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const validatePassword = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const validateForm = () => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          query: `
            mutation Signup($input: SignupRequest!) {
              signup(signupInput: $input) {
                user {
                  id
                  email
                  firstname
                  lastname
                  avatar
                  role
                  method
                }
                accessToken
              }
            }
          `,
          variables: {
            input: {
              firstname: formData.firstname,
              lastname: formData.lastname,
              email: formData.email,
              password: formData.password,
              phone: formData.phone.trim() || undefined,
            },
          },
        }),
      });

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      setSuccess('Account created successfully! You can now sign in.');
      setFormData({
        firstname: '',
        lastname: '',
        email: '',
        password: '',
        phone: '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    setIsGoogleLoading(true);
    setError(null);
    window.location.href = 'http://localhost:4000/auth/google';
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (field === 'password') {
      setPasswordStrength(validatePassword(value));
    }

    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const getPasswordStrengthText = () => {
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

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0:
      case 1:
        return '#ef4444';
      case 2:
        return '#f97316';
      case 3:
        return '#eab308';
      case 4:
        return '#22c55e';
      case 5:
        return '#16a34a';
      default:
        return '#e5e7eb';
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Create your account</h1>
          <p style={styles.subtitle}>Join us today and get started</p>
        </div>

        {/* Success Message */}
        {success && (
          <div style={styles.successAlert}>
            <div style={styles.successIcon}>✓</div>
            <p style={styles.successText}>{success}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={styles.errorAlert}>
            <div style={styles.errorIcon}>⚠</div>
            <p style={styles.errorText}>{error}</p>
          </div>
        )}

        {/* Google Sign Up Button */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={isGoogleLoading}
          style={{
            ...styles.googleButton,
            ...(isGoogleLoading ? styles.googleButtonDisabled : {}),
          }}
        >
          {isGoogleLoading ? (
            <div style={styles.spinner} />
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path
                fill="#4285f4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34a853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#fbbc05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#ea4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}
          {isGoogleLoading ? 'Signing up...' : 'Continue with Google'}
        </button>

        {/* Divider */}
        <div style={styles.divider}>
          <div style={styles.dividerLine} />
          <span style={styles.dividerText}>or</span>
          <div style={styles.dividerLine} />
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.nameRow}>
            <div style={styles.nameField}>
              <label htmlFor="firstname" style={styles.label}>
                First Name *
              </label>
              <input
                id="firstname"
                type="text"
                value={formData.firstname}
                onChange={(e) => handleInputChange('firstname', e.target.value)}
                style={{
                  ...styles.input,
                  ...(validationErrors.firstname ? styles.inputError : {}),
                }}
                placeholder="Enter your first name"
              />
              {validationErrors.firstname && (
                <span style={styles.fieldError}>
                  {validationErrors.firstname}
                </span>
              )}
            </div>
            <div style={styles.nameField}>
              <label htmlFor="lastname" style={styles.label}>
                Last Name *
              </label>
              <input
                id="lastname"
                type="text"
                value={formData.lastname}
                onChange={(e) => handleInputChange('lastname', e.target.value)}
                style={{
                  ...styles.input,
                  ...(validationErrors.lastname ? styles.inputError : {}),
                }}
                placeholder="Enter your last name"
              />
              {validationErrors.lastname && (
                <span style={styles.fieldError}>
                  {validationErrors.lastname}
                </span>
              )}
            </div>
          </div>

          <div style={styles.field}>
            <label htmlFor="email" style={styles.label}>
              Email Address *
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              style={{
                ...styles.input,
                ...(validationErrors.email ? styles.inputError : {}),
              }}
              placeholder="Enter your email address"
            />
            {validationErrors.email && (
              <span style={styles.fieldError}>{validationErrors.email}</span>
            )}
          </div>

          <div style={styles.field}>
            <label htmlFor="phone" style={styles.label}>
              Phone Number <span style={styles.optional}>(optional)</span>
            </label>
            <input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              style={{
                ...styles.input,
                ...(validationErrors.phone ? styles.inputError : {}),
              }}
              placeholder="Enter your phone number"
            />
            {validationErrors.phone && (
              <span style={styles.fieldError}>{validationErrors.phone}</span>
            )}
          </div>

          <div style={styles.field}>
            <label htmlFor="password" style={styles.label}>
              Password *
            </label>
            <div style={styles.passwordContainer}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                style={{
                  ...styles.passwordInput,
                  ...(validationErrors.password ? styles.inputError : {}),
                }}
                placeholder="Create a strong password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.passwordToggle}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {validationErrors.password && (
              <span style={styles.fieldError}>{validationErrors.password}</span>
            )}
            {formData.password && (
              <div style={styles.passwordStrength}>
                <div style={styles.strengthBar}>
                  <div
                    style={{
                      ...styles.strengthFill,
                      width: `${(passwordStrength / 5) * 100}%`,
                      backgroundColor: getPasswordStrengthColor(),
                    }}
                  />
                </div>
                <span
                  style={{
                    ...styles.strengthText,
                    color: getPasswordStrengthColor(),
                  }}
                >
                  {getPasswordStrengthText()}
                </span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              ...styles.submitButton,
              ...(isLoading ? styles.submitButtonDisabled : {}),
            }}
          >
            {isLoading ? (
              <>
                <div style={styles.spinner} />
                Creating account...
              </>
            ) : (
              'Create account'
            )}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            Already have an account?{' '}
            <a href="/signin" style={styles.link}>
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    padding: '20px',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  card: {
    width: '100%',
    maxWidth: '480px',
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '16px',
    boxShadow:
      '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    border: '1px solid #e2e8f0',
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '32px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1a202c',
    margin: '0 0 8px 0',
    lineHeight: '1.2',
  },
  subtitle: {
    color: '#64748b',
    fontSize: '16px',
    margin: 0,
    lineHeight: '1.5',
  },
  successAlert: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px',
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '12px',
    marginBottom: '24px',
  },
  successIcon: {
    color: '#16a34a',
    fontSize: '18px',
    fontWeight: 'bold',
    marginRight: '12px',
  },
  successText: {
    color: '#15803d',
    fontSize: '14px',
    margin: 0,
    fontWeight: '500',
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '12px',
    marginBottom: '24px',
  },
  errorIcon: {
    color: '#dc2626',
    fontSize: '18px',
    fontWeight: 'bold',
    marginRight: '12px',
  },
  errorText: {
    color: '#dc2626',
    fontSize: '14px',
    margin: 0,
    fontWeight: '500',
  },
  googleButton: {
    width: '100%',
    padding: '14px 20px',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    backgroundColor: 'white',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    marginBottom: '28px',
    transition: 'all 0.2s ease',
    color: '#374151',
  },
  googleButtonDisabled: {
    cursor: 'not-allowed',
    opacity: 0.6,
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '28px',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    backgroundColor: '#e2e8f0',
  },
  dividerText: {
    padding: '0 20px',
    color: '#64748b',
    fontSize: '14px',
    fontWeight: '500',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
  },
  nameRow: {
    display: 'flex',
    gap: '16px',
  },
  nameField: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
  },
  field: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '8px',
    display: 'block',
  },
  optional: {
    color: '#64748b',
    fontWeight: '400',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '16px',
    transition: 'all 0.2s ease',
    backgroundColor: '#fafafa',
    boxSizing: 'border-box' as const,
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  passwordContainer: {
    position: 'relative' as const,
  },
  passwordInput: {
    width: '100%',
    padding: '12px 50px 12px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '16px',
    transition: 'all 0.2s ease',
    backgroundColor: '#fafafa',
    boxSizing: 'border-box' as const,
  },
  passwordToggle: {
    position: 'absolute' as const,
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    fontSize: '18px',
    padding: '4px',
    borderRadius: '4px',
  },
  passwordStrength: {
    marginTop: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  strengthBar: {
    flex: 1,
    height: '4px',
    backgroundColor: '#e2e8f0',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    transition: 'all 0.3s ease',
    borderRadius: '2px',
  },
  strengthText: {
    fontSize: '12px',
    fontWeight: '600',
    minWidth: '80px',
  },
  fieldError: {
    color: '#ef4444',
    fontSize: '12px',
    marginTop: '4px',
    fontWeight: '500',
  },
  submitButton: {
    width: '100%',
    padding: '14px 20px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginTop: '8px',
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
    cursor: 'not-allowed',
  },
  footer: {
    textAlign: 'center' as const,
    marginTop: '32px',
  },
  footerText: {
    color: '#64748b',
    fontSize: '14px',
    margin: 0,
  },
  link: {
    color: '#3b82f6',
    textDecoration: 'none',
    fontWeight: '600',
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid transparent',
    borderTop: '2px solid currentColor',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
};
