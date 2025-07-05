import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { cn } from '../design-system/utils/cn';

interface TextLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  external?: boolean;
  underline?: boolean;
}

export const TextLink = React.forwardRef<HTMLAnchorElement, TextLinkProps>(
  ({ to, external, className, underline = true, children, ...props }, ref) => {
    const baseStyles = cn(
      'relative inline-flex items-center transition-colors duration-200',
      'text-light/80 hover:text-primary focus-visible:text-primary',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-dark',
      underline && 'after:absolute after:left-0 after:bottom-0 after:w-full after:h-px after:bg-current after:opacity-20 hover:after:opacity-100',
      className
    );

    if (external) {
      return (
        <a
          ref={ref}
          href={to}
          target="_blank"
          rel="noopener noreferrer"
          className={baseStyles}
          {...props}
        >
          {children}
        </a>
      );
    }

    return (
      <RouterLink
        ref={ref as any}
        to={to}
        className={baseStyles}
        {...props}
      >
        {children}
      </RouterLink>
    );
  }
);

TextLink.displayName = 'TextLink';