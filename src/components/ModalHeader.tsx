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
    <div className="flex items-center justify-between bg-dark-800/90 backdrop-blur-lg p-5 border-b border-white/10 relative">
      {/* Decorative gradient border */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary via-secondary to-primary opacity-30" />
      
      <motion.h2 
        className="text-2xl font-bold text-white flex items-center tracking-tight h-full"
        style={{ alignItems: 'center', transform: 'translateY(20%)' }}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        {icon && (
          <motion.span 
            className="mr-3 text-primary"
            animate={{ rotate: [0, 10, -5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {icon}
          </motion.span>
        )}
        {title}
      </motion.h2>
      
      <motion.button
        onClick={onClose}
        className="text-white/70 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary/50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Close modal"
      >
        <X className="h-5 w-5" />
      </motion.button>
    </div>
  );
}
