// src/pages/auth/LoginPage.tsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, ShieldCheck, Hash } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button, Input } from '@/components/ui';

const schema = z.object({
  email: z.string().optional(),
  enrollment_number: z.string().optional(),
  password: z.string().min(1, 'Password is required'),
}).refine((d) => d.email || d.enrollment_number, {
  message: 'Email or enrollment number is required',
  path: ['email'],
});

type FormData = z.infer<typeof schema>;

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');

  const from = (location.state as any)?.from?.pathname;

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setServerError('');
    const result = await login(data.email || '', data.password, data.enrollment_number || '');
    if (result.success) {
      // Navigate based on role (auth state updates async, check localStorage)
      const stored = localStorage.getItem('rx_user');
      const u = stored ? JSON.parse(stored) : null;
      navigate(from || (u?.role === 'admin' ? '/admin' : '/dashboard'), { replace: true });
    } else {
      setServerError(result.message || 'Login failed.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-teal-500 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold">
              <span className="text-primary-800">Resolve</span>
              <span className="text-teal-500">X</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to your account to continue</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-8">
          {serverError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              placeholder="Enter your MITS email"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <div className="relative flex items-center gap-3 my-1">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium">OR</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <Input
              label="Enrollment Number"
              type="text"
              placeholder="Enter your enrollment number"
              leftIcon={<Hash className="w-4 h-4" />}
              error={errors.enrollment_number?.message}
              {...register('enrollment_number')}
            />

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`input-base pl-10 pr-10 ${errors.password ? 'border-red-400 focus:ring-red-300' : ''}`}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <Button type="submit" className="w-full" loading={isSubmitting}>
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-700 font-medium hover:underline">
              Create one
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Admin accounts are provisioned by system administrators.
        </p>
      </div>
    </div>
  );
};