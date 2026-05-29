// src/pages/ProfilePage.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Phone, Building2, Lock, Save, CheckCircle } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Button, Input } from '@/components/ui';
import { getInitials, formatDate } from '@/lib/utils';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  enrollment_number: z.string().min(6, 'Enrollment number is required').optional(),
  phone: z.string().optional(),
  department: z.string().optional(),
});

const passwordSchema = z.object({
  current_password: z.string().min(1, 'Current password required'),
  new_password: z.string()
    .min(8, 'Minimum 8 characters')
    .regex(/[A-Z]/, 'Needs uppercase')
    .regex(/[a-z]/, 'Needs lowercase')
    .regex(/[0-9]/, 'Needs number'),
  confirm_password: z.string(),
}).refine((d) => d.new_password === d.confirm_password, {
  message: 'Passwords do not match', path: ['confirm_password'],
});

type ProfileData = z.infer<typeof profileSchema>;
type PasswordData = z.infer<typeof passwordSchema>;

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const profileForm = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      enrollment_number: user?.enrollment_number || '',
      phone: user?.phone || '',
      department: user?.department || '',
    },
  });

  const passwordForm = useForm<PasswordData>({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSubmit = async (data: ProfileData) => {
    setProfileError('');
    setProfileSuccess(false);
    try {
      const res = await api.put('/user/profile', data);
      if (res.data.success) {
        updateUser(res.data.data);
        setProfileSuccess(true);
        setTimeout(() => setProfileSuccess(false), 3000);
      }
    } catch (err: any) {
      setProfileError(err?.response?.data?.message || 'Update failed.');
    }
  };

  const onPasswordSubmit = async (data: PasswordData) => {
    setPasswordError('');
    setPasswordSuccess(false);
    try {
      const res = await api.put('/user/change-password', {
        current_password: data.current_password,
        new_password: data.new_password,
      });
      if (res.data.success) {
        setPasswordSuccess(true);
        passwordForm.reset();
        setTimeout(() => setPasswordSuccess(false), 3000);
      }
    } catch (err: any) {
      setPasswordError(err?.response?.data?.message || 'Password change failed.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>

      {/* Avatar Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center text-white text-xl font-bold">
          {getInitials(user?.name || 'U')}
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
          <p className="text-gray-500 text-sm">{user?.email}</p>
          {user?.enrollment_number && (
            <p className="text-gray-500 text-xs mt-0.5 font-mono bg-gray-50 inline-block px-1.5 py-0.5 rounded border border-gray-100">
              {user.enrollment_number}
            </p>
          )}
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              user?.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-primary-100 text-primary-700'
            }`}>
              {user?.role === 'admin' ? 'Administrator' : 'Student'}
            </span>
            {user?.created_at && (
              <span className="text-xs text-gray-400">Joined {formatDate(user.created_at)}</span>
            )}
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-5 flex items-center gap-2">
          <User className="w-5 h-5 text-primary-600" /> Personal Information
        </h2>

        {profileError && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">{profileError}</div>
        )}
        {profileSuccess && (
          <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-600 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> Profile updated successfully.
          </div>
        )}

        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
          <Input
            label="Full Name"
            leftIcon={<User className="w-4 h-4" />}
            error={profileForm.formState.errors.name?.message}
            {...profileForm.register('name')}
          />

          <Input
            label="Enrollment Number"
            placeholder="Enter your enrollment number"
            leftIcon={<CheckCircle className="w-4 h-4" />}
            error={profileForm.formState.errors.enrollment_number?.message}
            {...profileForm.register('enrollment_number')}
          />

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="input-base pl-10 opacity-60 cursor-not-allowed bg-gray-50"
              />
            </div>
            <p className="text-xs text-gray-400">Email cannot be changed. Contact admin if needed.</p>
          </div>

          <Input
            label="Phone Number"
            type="tel"
            placeholder="Enter phone number"
            leftIcon={<Phone className="w-4 h-4" />}
            error={profileForm.formState.errors.phone?.message}
            {...profileForm.register('phone')}
          />

          <Input
            label="Department"
            placeholder="Your department"
            leftIcon={<Building2 className="w-4 h-4" />}
            error={profileForm.formState.errors.department?.message}
            {...profileForm.register('department')}
          />

          <Button
            type="submit"
            icon={<Save className="w-4 h-4" />}
            loading={profileForm.formState.isSubmitting}
          >
            Save Changes
          </Button>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-5 flex items-center gap-2">
          <Lock className="w-5 h-5 text-primary-600" /> Change Password
        </h2>

        {passwordError && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">{passwordError}</div>
        )}
        {passwordSuccess && (
          <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-600 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> Password changed successfully.
          </div>
        )}

        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            placeholder="••••••••"
            leftIcon={<Lock className="w-4 h-4" />}
            error={passwordForm.formState.errors.current_password?.message}
            {...passwordForm.register('current_password')}
          />
          <Input
            label="New Password"
            type="password"
            placeholder="Min. 8 chars with A-Z, a-z, 0-9"
            leftIcon={<Lock className="w-4 h-4" />}
            error={passwordForm.formState.errors.new_password?.message}
            {...passwordForm.register('new_password')}
          />
          <Input
            label="Confirm New Password"
            type="password"
            placeholder="Repeat new password"
            leftIcon={<Lock className="w-4 h-4" />}
            error={passwordForm.formState.errors.confirm_password?.message}
            {...passwordForm.register('confirm_password')}
          />

          <Button
            type="submit"
            icon={<Save className="w-4 h-4" />}
            loading={passwordForm.formState.isSubmitting}
          >
            Change Password
          </Button>
        </form>
      </div>
    </div>
  );
};