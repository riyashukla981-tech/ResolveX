// src/pages/student/SubmitComplaintPage.tsx
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ImagePlus, X, EyeOff, Send, CheckCircle } from 'lucide-react';
import api from '@/lib/api';
import { COMPLAINT_CATEGORIES } from '@/lib/utils';
import { Button, Input, Textarea, Select } from '@/components/ui';

const schema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(255),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  category: z.enum(['Infrastructure', 'Academic', 'Hostel', 'Canteen', 'Others'], {
    required_error: 'Please select a category',
  }),
  is_anonymous: z.boolean().default(false),
});

type FormData = z.infer<typeof schema>;

export const SubmitComplaintPage: React.FC = () => {
  const navigate = useNavigate();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [serverError, setServerError] = useState('');
  const [submitted, setSubmitted] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    register, handleSubmit, watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { is_anonymous: false },
  });

  const isAnonymous = watch('is_anonymous');

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setServerError('Image must be under 5MB.');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setServerError('');
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const onSubmit = async (data: FormData) => {
    setServerError('');
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('category', data.category);
      formData.append('is_anonymous', String(data.is_anonymous));
      if (imageFile) formData.append('image', imageFile);

      const response = await api.post('/complaints/create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        setSubmitted(response.data.data.complaint_id);
      }
    } catch (err: any) {
      setServerError(err?.response?.data?.message || 'Submission failed. Please try again.');
    }
  };

  // Success screen
  if (submitted) {
    return (
      <div className="max-w-lg mx-auto text-center py-20 animate-slide-up">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Complaint Submitted!</h2>
        <p className="text-gray-500 mb-2">Your complaint has been received and is under review.</p>
        <p className="text-sm font-mono bg-gray-100 text-gray-700 px-4 py-2 rounded-lg inline-block mb-8">
          ID: {submitted}
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="secondary" onClick={() => navigate('/complaints')}>
            View My Complaints
          </Button>
          <Button onClick={() => { setSubmitted(null); }}>
            Submit Another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Submit a Complaint</h1>
        <p className="text-gray-500 text-sm mt-1">
          Describe your issue clearly. You'll receive a unique complaint ID to track progress.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-8">
        {serverError && (
          <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
          <Input
            label="Complaint Title"
            placeholder="Brief summary of your issue"
            error={errors.title?.message}
            required
            {...register('title')}
          />

          {/* Category */}
          <Select
            label="Category"
            placeholder="Select a category"
            options={COMPLAINT_CATEGORIES.map((c) => ({ value: c, label: c }))}
            error={errors.category?.message}
            required
            {...register('category')}
          />

          {/* Description */}
          <Textarea
            label="Description"
            placeholder="Provide a detailed description of your complaint. Include location, dates, and any relevant details..."
            rows={5}
            error={errors.description?.message}
            required
            {...register('description')}
          />

          {/* Image Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Attach Image <span className="text-gray-400 font-normal">(optional, max 5MB)</span>
            </label>

            {imagePreview ? (
              <div className="relative inline-block">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-40 rounded-xl object-cover border border-gray-200"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center gap-2 hover:border-primary-300 hover:bg-primary-50/30 transition-all text-gray-400 hover:text-primary-500"
              >
                <ImagePlus className="w-8 h-8" />
                <span className="text-sm">Click to upload image</span>
                <span className="text-xs">JPG, PNG, GIF, WebP</span>
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
              onChange={handleImage}
            />
          </div>

          {/* Anonymous Toggle */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 border border-gray-200">
            <input
              type="checkbox"
              id="is_anonymous"
              className="mt-0.5 w-4 h-4 accent-primary-600 cursor-pointer"
              {...register('is_anonymous')}
            />
            <div>
              <label htmlFor="is_anonymous" className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                <EyeOff className="w-4 h-4 text-gray-500" />
                Submit anonymously
              </label>
              <p className="text-xs text-gray-400 mt-0.5">
                Your name will be hidden from administrators. Your account is still linked for tracking purposes.
              </p>
            </div>
          </div>

          {isAnonymous && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-700">
              ⚠️ Anonymous complaints may take longer to process as follow-up is limited.
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/dashboard')}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isSubmitting}
              icon={<Send className="w-4 h-4" />}
              className="flex-1"
            >
              Submit Complaint
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};