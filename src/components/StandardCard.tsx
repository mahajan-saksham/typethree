import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';

type StandardCardProps = {
  title: string;
  subtitle?: string;
  description?: string;
  icon?: LucideIcon;
  children?: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
  minHeight?: string;
  iconBackground?: string;
  onHoverY?: number;
};

export const StandardCard = ({
  title,
  subtitle,
  description,
  icon: Icon,
  children,
  className,
  footer,
  minHeight = 'min-h-[420px]',
  iconBackground = 'bg-primary/20',
  onHoverY = -5,
}: StandardCardProps) => {
  return (
    <motion.div
      whileHover={{ y: onHoverY, transition: { duration: 0.2 } }}
      className={cn(
        'relative bg-gradient-to-b from-dark to-dark-900 rounded-xl overflow-hidden group',
        minHeight,
        'flex flex-col backdrop-blur-lg bg-white/5 border border-white/10 hover:border-primary/20',
        'transition-all duration-300 p-6 md:p-8',
        className
      )}
    >
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        {Icon && (
          <div className="flex items-center gap-4 mb-6">
            <div className={cn('flex items-center justify-center w-12 h-12 rounded-full text-primary', iconBackground)}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-medium text-light/80">{title}</h3>
              {subtitle && <p className="text-sm text-light/60">{subtitle}</p>}
            </div>
          </div>
        )}

        {/* If no icon, just show title */}
        {!Icon && (
          <div className="mb-6">
            <h3 className="text-xl font-medium text-light/80">{title}</h3>
            {subtitle && <p className="text-sm text-light/60">{subtitle}</p>}
          </div>
        )}

        {/* Description */}
        {description && (
          <div className="space-y-4 mb-8">
            <p className="text-light/60 text-lg">{description}</p>
          </div>
        )}

        {/* Main content */}
        <div className="flex-grow">{children}</div>

        {/* Footer */}
        {footer && <div className="mt-8">{footer}</div>}
      </div>
    </motion.div>
  );
};

// List item component for use within StandardCard
type StandardListItemProps = {
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
  iconBackground?: string;
  onHoverX?: number;
};

export const StandardListItem = ({
  icon: Icon,
  children,
  className,
  iconBackground = 'bg-primary/10',
  onHoverX = 10,
}: StandardListItemProps) => {
  return (
    <motion.li
      className={cn(
        'flex items-center text-light/80 gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors duration-200',
        className
      )}
      whileHover={{ x: onHoverX }}
    >
      {Icon && (
        <div className={cn('flex items-center justify-center w-10 h-10 rounded-full text-primary', iconBackground)}>
          <Icon className="h-5 w-5" />
        </div>
      )}
      <span>{children}</span>
    </motion.li>
  );
};
