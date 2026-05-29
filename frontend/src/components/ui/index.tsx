// src/components/ui/index.tsx
import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

// ─── Button ──────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'teal' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary', size = 'md', loading, icon, className, children, disabled, ...props
}) => {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variants = {
    primary: 'bg-primary-700 hover:bg-primary-800 text-white shadow-sm focus:ring-primary-300',
    secondary: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm focus:ring-gray-300',
    teal: 'bg-teal-500 hover:bg-teal-600 text-white shadow-sm focus:ring-teal-300',
    ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-300',
    danger: 'bg-red-500 hover:bg-red-600 text-white shadow-sm focus:ring-red-300',
  };
  const sizes = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-5 py-2.5',
    lg: 'text-base px-6 py-3',
  };
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {children}
    </button>
  );
};

// ─── Input ────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'input-base',
              leftIcon && 'pl-10',
              error && 'border-red-400 focus:ring-red-300 focus:border-red-400',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-red-500 flex items-center gap-1">{error}</p>}
        {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

// ─── Textarea ─────────────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'input-base resize-none',
            error && 'border-red-400 focus:ring-red-300',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

// ─── Select ───────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={cn('input-base bg-white', error && 'border-red-400', className)}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';

// ─── Badge ────────────────────────────────────────────────────
interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({ children, className, dot }) => (
  <span className={cn('badge', className)}>
    {dot && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />}
    {children}
  </span>
);

// ─── Card ─────────────────────────────────────────────────────
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, className, hover, ...props }, ref) => (
  <div ref={ref} className={cn('card', hover && 'card-hover cursor-pointer', className)} {...props}>
    {children}
  </div>
));
Card.displayName = 'Card';

// ─── Spinner ──────────────────────────────────────────────────
export const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
  size = 'md', className,
}) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };
  return <Loader2 className={cn(sizes[size], 'animate-spin text-primary-600', className)} />;
};

// ─── Empty State ──────────────────────────────────────────────
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-gray-700 mb-1">{title}</h3>
    {description && <p className="text-sm text-gray-400 max-w-sm">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

// ─── Stat Card ────────────────────────────────────────────────
interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  iconBg: string;
  trend?: { value: string; positive: boolean };
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, iconBg, trend }) => (
  <div className="card">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        {trend && (
          <p className={cn('text-xs font-medium mt-1', trend.positive ? 'text-green-600' : 'text-red-500')}>
            {trend.positive ? '↑' : '↓'} {trend.value}
          </p>
        )}
      </div>
      <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', iconBg)}>
        {icon}
      </div>
    </div>
  </div>
);