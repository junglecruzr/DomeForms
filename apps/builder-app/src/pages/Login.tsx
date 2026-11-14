import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button } from '@domeforms/ui/components/button';
import { Input } from '@domeforms/ui/components/input';
import { Label } from '@domeforms/ui/components/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@domeforms/ui/components/card';
import { Loader2, Mail, Lock } from 'lucide-react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';

interface LoginForm {
  email: string;
  password: string;
}

export function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  
  // Use the AuthContext login function
  const { login, isLoading: authIsLoading } = useAuth();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  const onSubmit = (data: LoginForm) => {
    setError(null);
    login(data.email, data.password)
      .then(() => {
        // AuthContext.login already handles localStorage and React Context
        // Navigate to dashboard after successful login
        navigate('/');
      })
      .catch((error) => {
        setError(error.message || 'Login failed');
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Link to="/" className="flex justify-center">
            <svg className="h-12 w-12 text-primary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </Link>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">Welcome back</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your DomeForms account
          </p>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Sign in</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="text-red-600 text-sm text-center" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="pl-10"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                    aria-invalid={errors.email ? 'true' : 'false'}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                  />
                  {errors.email && (
                    <p id="email-error" className="text-red-600 text-sm" role="alert">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Password"
                    autoComplete="current-password"
                    className="pl-10"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: { value: 8, message: 'Password must be at least 8 characters' },
                    })}
                    aria-invalid={errors.password ? 'true' : 'false'}
                    aria-describedby={errors.password ? 'password-error' : undefined}
                  />
                  {errors.password && (
                    <p id="password-error" className="text-red-600 text-sm" role="alert">
                      {errors.password.message}
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={authIsLoading}
              >
                {authIsLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => navigate('/auth/github')}
              >
                <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.364 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.305-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.003.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.621-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 11.337 24 6.702 24 12c0-6.627-12-12-12-12z" />
                </svg>
                GitHub
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/auth/google')}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.09 1.06-3.42 1.06-2.86 0-5.29-1.93-6.13-4.53H2.76v2.91c1.91 1.22 4.3 1.94 6.98 1.94 5.52 0 10.14-3.6 10.14-9.84 0-1.64-.27-3.21-.74-4.63H12V5.63h6.53z"/>
                  <path fill="#FBBC05" d="M12 5.63c1.66 0 3.11.62 4.24 1.68l3.06-3.06c-1.82-1.91-4.38-2.98-7.3-2.98-5.39 0-9.76 4.37-9.76 9.76s4.37 9.76 9.76 9.76c2.92 0 5.35-1.17 4.06-2.93l-2.97-2.97c-1.78 1.78-4.51 1.78-6.29 0 1.78-1.78 1.78-4.51 0-6.29 1.17-2.93 4.06-4.63 6.98-4.63 2.56 0 4.84 1.05 6.51 2.71l2.88-2.88C21.61 7.92 19.18 7 16.5 7c-4.36 0-8.08 3.17-9.25 7.34z"/>
                  <path fill="#EA4335" d="M12 5.63c1.66 0 3.11.62 4.24 1.68l3.06-3.06c-1.82-1.91-4.38-2.98-7.3-2.98-5.39 0-9.76 4.37-9.76 9.76s4.37 9.76 9.76 9.76c2.92 0 5.35-1.17 4.06-2.93l-2.97-2.97c-1.78 1.78-4.51 1.78-6.29 0 1.78-1.78 1.78-4.51 0-6.29 1.17-2.93 4.06-4.63 6.98-4.63 2.56 0 4.84 1.05 6.51 2.71l2.88-2.88C21.61 7.92 19.18 7 16.5 7c-4.36 0-8.08 3.17-9.25 7.34z"/>
                </svg>
                Google
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center pt-4">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
