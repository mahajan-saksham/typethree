import { motion } from 'framer-motion';
import { HomeIcon } from 'lucide-react';
import { Card } from './Card';

// After solar farms migration, this component only shows Rooftop Solar
export function ServiceSwitcher() {
  return (
    <Card variant="glass" className="p-2 backdrop-blur-xl" radius="lg">
      <button
        className="relative flex items-center justify-center gap-2 px-6 py-3 rounded-md text-dark"
      >
        <motion.div
          className="absolute inset-0 bg-primary rounded-md"
          initial={false}
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
        <HomeIcon className="relative z-10 h-5 w-5" />
        <span className="relative z-10 font-medium whitespace-nowrap">Rooftop Solar</span>
      </button>
    </Card>
  );
}