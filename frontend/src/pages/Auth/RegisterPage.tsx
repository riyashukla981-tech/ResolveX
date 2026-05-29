// src/pages/auth/RegisterPage.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button, Input } from '@/components/ui';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  enrollment_number: z.string().min(6, 'Enrollment number must be at least 6 characters').max(20),
  email: z.string().email('Invalid email address').refine(
    (val) => val.endsWith('@mitsgwl.ac.in'),
    { message: 'Email must be a valid MITS email (name@mitsgwl.ac.in)' }
  ),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[a-z]/, 'Must contain a lowercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

export const RegisterPage: React.FC = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setServerError('');
    const result = await registerUser(data.name, data.enrollment_number, data.email, data.password);
    if (result.success) {
      navigate('/dashboard', { replace: true });
    } else {
      setServerError(result.message || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
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
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 text-sm mt-1">Start submitting and tracking complaints</p>
        </div>

        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-8">
          {serverError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="Full name"
              leftIcon={<User className="w-4 h-4" />}
              error={errors.name?.message}
              required
              {...register('name')}
            />

            <Input
              label="Enrollment Number"
              type="text"
              placeholder="Enter your enrollment number"
              leftIcon={<ShieldCheck className="w-4 h-4" />}
              error={errors.enrollment_number?.message}
              required
              {...register('enrollment_number')}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="Enter your MITS email"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              required
              {...register('email')}
            />

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 8 chars with A-Z, a-z, 0-9"
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

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Repeat your password"
                  className={`input-base pl-10 ${errors.confirmPassword ? 'border-red-400 focus:ring-red-300' : ''}`}
                  {...register('confirmPassword')}
                />
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
            </div>

            <Button type="submit" className="w-full mt-2" loading={isSubmitting}>
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-700 font-medium hover:underline">
              Sign in
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          By registering, you agree to the campus usage policy.
        </p>
      </div>
    </div>
  );
};