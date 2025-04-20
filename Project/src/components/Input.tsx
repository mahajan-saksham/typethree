import React from 'react';
import { cn } from '../design-system/utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, helperText, fullWidth = true, id, required, ...props }, ref) => {
    // Generate a unique ID if none is provided
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={cn('space-y-2', fullWidth && 'w-full')}>
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium text-light/80"
          >
            {label}
            {required && <span className="text-primary ml-1">*</span>}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          className={cn(
            'flex h-11 rounded-lg border border-light/20 bg-dark-200 px-3 py-2 text-base text-light ring-offset-dark file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-light/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-error focus-visible:ring-error',
            fullWidth && 'w-full',
            className
          )}
          ref={ref}
          aria-invalid={error ? 'true' : 'false'}
          aria-required={required}
          required={required}
          {...props}
        />
        {error && (
          <p className="text-sm text-error" role="alert">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-sm text-light/60">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';