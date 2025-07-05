import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface FormErrorProps {
  message: string;
  icon?: ReactNode;
  className?: string;
}

export function FormError({ message, icon, className = '' }: FormErrorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      transition={{ duration: 0.3 }}
      className={`bg-red-900/20 border border-red-700/50 text-red-100 px-4 py-3 rounded-lg flex items-center ${className}`}
      role="alert"
    >
      {icon || <AlertTriangle className="h-5 w-5 mr-3 flex-shrink-0" />}
      <span>{message}</span>
    </motion.div>
  );
}
