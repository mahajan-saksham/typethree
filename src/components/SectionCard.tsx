import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface SectionCardProps {
  children: ReactNode;
  icon?: ReactNode;
  title?: string;
  variant?: 'default' | 'success' | 'error' | 'info';
  className?: string;
}

export function SectionCard({
  children,
  icon,
  title,
  variant = 'default',
  className = ''
}: SectionCardProps) {
  // Determine background and border styles based on variant
  const getStyles = () => {
    switch (variant) {
      case 'success':
        return 'bg-green-900/20 border-green-700/50';
      case 'error':
        return 'bg-red-900/20 border-red-700/50';
      case 'info':
        return 'bg-primary/5 border-primary/20';
      default:
        return 'bg-dark-900 border-white/5 hover:border-white/10';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-lg p-4 border ${getStyles()} transition-all duration-300 ${className}`}
    >
      {(title || icon) && (
        <div className="flex items-center mb-2">
          {icon && <span className="text-primary mr-2">{icon}</span>}
          {title && <p className={`font-medium ${variant === 'default' ? 'text-white/70' : 'text-white'} text-sm`}>{title}</p>}
        </div>
      )}
      {children}
    </motion.div>
  );
}
