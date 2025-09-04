import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone, UserPlus } from 'lucide-react';
import { ROUTES } from '../../constants/routes';
import { Card, CardContent } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Button } from '../../components/ui/Button';
import { GoogleButton } from '../../components/ui/GoogleButton';
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
        username: data.username.trim(),
        email: data.email.trim(),
        password: data.password,
        phone: data.phone?.trim() || undefined,
      },
      {
        onSuccess: () => reset(),
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
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
              authType="signup"
              className="mb-6 text-gray-400 border-gray"
            />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">OR</span>
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
                  disabled={isLoading}
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
                  disabled={isLoading}
                  autoComplete="family-name"
                  required
                />
              </div>

              <AuthInput
                id="username"
                label="User Name"
                type="text"
                placeholder="Enter user name"
                icon={User}
                register={register('username')}
                error={errors.username?.message}
                disabled={isLoading}
                autoComplete="user-name"
                required
              />

              <AuthInput
                id="email"
                label="Email Address"
                type="email"
                placeholder="Enter your email address"
                icon={Mail}
                register={register('email')}
                error={errors.email?.message}
                disabled={isLoading}
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
                disabled={isLoading}
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
                disabled={isLoading}
                autoComplete="new-password"
                required
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={togglePasswordVisibility}
                  disabled={isLoading}
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
                disabled={!isValid || isLoading}
                className="w-full flex justify-center items-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
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
                  className="font-medium text-blue-600 hover:text-blue-500 hover:underline focus:outline-none focus:underline transition-colors duration-200"
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
