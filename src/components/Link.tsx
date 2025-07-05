import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { cn } from '../design-system/utils/cn';

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  external?: boolean;
  icon?: React.ReactNode;
}

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ to, external, icon, className, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-dark';

    if (external) {
      return (
        <a
          ref={ref}
          href={to}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(baseStyles, className)}
          {...props}
        >
          {children}
          {icon}
        </a>
      );
    }

    return (
      <RouterLink
        ref={ref as any}
        to={to}
        className={cn(baseStyles, className)}
        {...props}
      >
        {children}
        {icon}
      </RouterLink>
    );
  }
);

Link.displayName = 'Link';