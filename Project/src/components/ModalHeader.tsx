import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalHeaderProps {
  title: string;
  icon?: ReactNode;
  onClose: () => void;
}

export function ModalHeader({ title, icon, onClose }: ModalHeaderProps) {
  return (
    <div className="flex items-center justify-between bg-dark-800 p-5 border-b border-white/5">
      <h2 className="text-xl font-semibold text-white flex items-center">
        {icon && <span className="mr-2 text-primary">{icon}</span>}
        {title}
      </h2>
      <motion.button 
        onClick={onClose}
        className="text-white/70 hover:text-white transition-colors p-1.5 rounded-md hover:bg-white/5"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Close modal"
      >
        <X className="h-5 w-5" />
      </motion.button>
    </div>
  );
}
