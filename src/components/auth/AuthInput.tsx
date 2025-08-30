import React from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import type { LucideIcon } from 'lucide-react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';

interface AuthInputProps {
  id: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'password';
  placeholder: string;
  icon: LucideIcon;
  register: UseFormRegisterReturn;
  error?: string;
  disabled?: boolean;
  autoComplete?: string;
  required?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const AuthInput: React.FC<AuthInputProps> = ({
  id,
  label,
  type,
  placeholder,
  icon: Icon,
  register,
  error,
  disabled = false,
  autoComplete,
  required = false,
  className = '',
  children,
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-white font-medium">
        {label} {required && '*'}
        {!required && <span className="text-slate-400">(optional)</span>}
      </Label>
      <div className="relative group">
        <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-purple-400 transition-colors duration-200" />
        <Input
          id={id}
          type={type}
          autoComplete={autoComplete}
          {...register}
          disabled={disabled}
          className={`${
            children ? 'pl-10 pr-12' : 'pl-10'
          } bg-white/10 border-white/20 text-white placeholder-slate-400 focus:border-purple-400 focus:ring-purple-400/50 transition-all duration-300 h-12 ${
            error
              ? 'border-red-400 focus:border-red-400 focus:ring-red-400/50'
              : ''
          } ${className}`}
          placeholder={placeholder}
        />
        {children}
      </div>
      {error && (
        <p className="text-sm text-red-300 animate-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
};
