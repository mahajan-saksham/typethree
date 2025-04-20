import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const cardVariants = cva(
  'transition-all duration-300 flex flex-col',
  {
    variants: {
      variant: {
        default: 'bg-white shadow-lg',
        glass: 'backdrop-blur-lg bg-white/10 border border-white/20',
        dark: 'bg-dark-100 border border-light/10'
      },
      hover: {
        true: 'hover:scale-[1.02] hover:shadow-xl'
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
        xl: 'p-12'
      },
      radius: {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        full: 'rounded-full'
      },
      align: {
        start: 'justify-start',
        center: 'justify-center',
        between: 'justify-between',
        around: 'justify-around',
        evenly: 'justify-evenly'
      },
      equalHeight: {
        true: 'h-full'
      }
    },
    defaultVariants: {
      variant: 'default',
      hover: false,
      padding: 'md',
      radius: 'lg',
      align: 'start',
      equalHeight: true
    }
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  containerClassName?: string;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ 
    className, 
    containerClassName, 
    variant, 
    hover, 
    padding, 
    radius, 
    align,
    equalHeight,
    children, 
    ...props 
  }, ref) => {
    return (
      <div className={cn(containerClassName)}>
        <div
          ref={ref}
          className={cn(cardVariants({ 
            variant, 
            hover, 
            padding, 
            radius, 
            align,
            equalHeight,
            className 
          }))}
          {...props}
        >
          {children}
        </div>
      </div>
    );
  }
);

Card.displayName = 'Card';