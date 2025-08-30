import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone, UserPlus } from 'lucide-react';
import { ROUTES } from '../../constants/routes';
import { Card, CardContent } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Button } from '../../components/ui/Button';
import { GoogleButton } from '../../components/ui/GoogleButton';
import { Separator } from '../../components/ui/separator';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  signupSchema,
  type SignupFormData,
} from '../../schemas/auth/signup.schema';
import { useForm } from 'react-hook-form';
import { useSignUp } from '../../hooks/useAuth';
import { AuthInput } from '../../components/auth/AuthInput';

export const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const [googleLoading, setGoogleLoading] = useState(false);
  const { mutate: signUp, isLoading, error } = useSignUp();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
    defaultValues: {
      firstname: '',
      lastname: '',
      email: '',
      password: '',
      phone: '',
    },
  });

  const onSubmit = async (data: SignupFormData) => {
    signUp(
      {
        firstname: data.firstname.trim(),
        lastname: data.lastname.trim(),
        email: data.email.trim(),
        password: data.password,
        phone: data.phone?.trim() || undefined,
      },
      {
        onSuccess: () => reset(),
      }
    );
  };

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    try {
      const backendUrl = 'http://localhost:4000';
      window.location.href = `${backendUrl}/auth/google`;
    } catch (err) {
      console.error('Google signup error:', err);
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-2xl mx-auto relative z-10 w-full">
        <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
          <CardContent className="p-8">
            {error && (
              <Alert className="mb-6 border-red-400/50 bg-red-500/10 backdrop-blur-sm">
                <AlertDescription className="text-red-300">
                  {error?.message || 'An error occurred during signup'}
                </AlertDescription>
              </Alert>
            )}

            <GoogleButton
              onClick={handleGoogleSignup}
              isLoading={googleLoading}
              disabled={isLoading || googleLoading}
              text="Continue with Google"
              loadingText="Redirecting..."
              className="mb-6"
            />

            <div className="relative mb-6">
              <Separator className="bg-white/20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-slate-900 px-4 text-sm text-slate-400 font-medium">
                  OR
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AuthInput
                  id="firstname"
                  label="First Name"
                  type="text"
                  placeholder="Enter your first name"
                  icon={User}
                  register={register('firstname')}
                  error={errors.firstname?.message}
                  disabled={isLoading || googleLoading}
                  autoComplete="given-name"
                  required
                />

                <AuthInput
                  id="lastname"
                  label="Last Name"
                  type="text"
                  placeholder="Enter your last name"
                  icon={User}
                  register={register('lastname')}
                  error={errors.lastname?.message}
                  disabled={isLoading || googleLoading}
                  autoComplete="family-name"
                  required
                />
              </div>

              <AuthInput
                id="email"
                label="Email Address"
                type="email"
                placeholder="Enter your email address"
                icon={Mail}
                register={register('email')}
                error={errors.email?.message}
                disabled={isLoading || googleLoading}
                autoComplete="email"
                required
              />

              <AuthInput
                id="phone"
                label="Phone Number"
                type="tel"
                placeholder="Enter your phone number"
                icon={Phone}
                register={register('phone')}
                error={errors.phone?.message}
                disabled={isLoading || googleLoading}
                autoComplete="tel"
              />

              <AuthInput
                id="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                icon={Lock}
                register={register('password')}
                error={errors.password?.message}
                disabled={isLoading || googleLoading}
                autoComplete="new-password"
                required
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={togglePasswordVisibility}
                  disabled={isLoading || googleLoading}
                  className="absolute right-1 top-1 h-10 w-10 hover:bg-white/10 text-slate-400 hover:text-purple-400 transition-colors duration-200"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </AuthInput>

              <Button
                type="submit"
                size="lg"
                disabled={!isValid || isLoading || googleLoading}
                className="w-full bg-gradient-to-r from-purple-600 via-purple-600 to-blue-600 hover:from-purple-700 hover:via-purple-700 hover:to-blue-700 hover:scale-105 focus:ring-purple-500/50 transition-all duration-300 ease-out h-14 text-white font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5 mr-2" />
                    Create Account
                  </>
                )}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-slate-400">
                Already have an account?{' '}
                <Link
                  to={ROUTES.SIGNIN}
                  className="font-semibold text-purple-400 hover:text-purple-300 hover:underline focus:outline-none focus:underline transition-colors duration-200"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
