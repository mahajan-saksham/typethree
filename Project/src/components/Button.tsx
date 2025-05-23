import React from 'react';
import { Link } from 'react-router-dom';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../design-system/utils/cn';

// Button variants using Tailwind CSS only - no styled-components
const buttonVariants = cva(
  'inline-flex items-center justify-between font-medium tracking-tight letter-spacing-[-0.02em] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-dark hover:bg-primary-hover active:bg-primary-active transform hover:scale-[1.02]',
        secondary: 'bg-secondary text-dark hover:bg-secondary-hover active:bg-secondary-active transform hover:scale-[1.02]',
        ghost: 'border-2 border-light text-light hover:bg-light hover:text-dark transform hover:scale-[1.02]',
        danger: 'bg-error text-light hover:bg-error-hover active:bg-error-active transform hover:scale-[1.02]',
        success: 'bg-success text-light hover:bg-success-hover active:bg-success-active transform hover:scale-[1.02]'
      },
      size: {
        sm: 'h-9 px-4 text-sm',
        md: 'h-11 px-6 text-base',
        lg: 'h-14 px-8 text-lg'
      },
      radius: {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        full: 'rounded-full'
      },
      fullWidth: {
        true: 'w-full'
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      radius: 'lg',
      fullWidth: false
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  to?: string;
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, radius, fullWidth, to, icon, type = "button", children, ...props }, ref) => {
    const Comp = to ? Link : 'button';
    const buttonProps = to ? {} : { type };

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, radius, fullWidth, className }))}
        ref={ref}
        to={to}
        {...buttonProps}
        {...props}
      >
        <span>{children}</span>
        {icon && (
          <span className={cn(
            size === 'sm' && "h-5 w-5",
            size === 'md' && "h-5 w-5",
            size === 'lg' && "h-7 w-7",
          )}>
            {icon}
          </span>
        )}
      </Comp>
    );
  }
);

Button.displayName = 'Button';
