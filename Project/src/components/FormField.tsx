import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

type InputType = 'text' | 'tel' | 'email' | 'date' | 'select' | 'textarea';

interface FormFieldProps {
  id: string;
  name: string;
  label: string;
  type: InputType;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  placeholder?: string;
  icon?: ReactNode;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  min?: string;
  children?: ReactNode;
  rows?: number;
}

export function FormField({
  id,
  name,
  label,
  type,
  value,
  onChange,
  placeholder,
  icon,
  error,
  required = false,
  disabled = false,
  className = '',
  min,
  children,
  rows = 3
}: FormFieldProps) {
  // Generate a unique ID for error message linking
  const errorId = `${id}-error`;
  
  // Border and background styling based on state
  const getBorderStyles = () => {
    if (error) return 'border-red-500';
    return '';
  };


  // Input group animation variants
  const inputGroupVariants = {
    initial: { y: 0 },
    focus: { y: -2 },
    error: { x: [-3, 3, -2, 2, -1, 1, 0], transition: { duration: 0.4 } }
  };

  return (
    <div className={`relative space-y-2 ${className}`}>
      {/* Field label */}
      <label
        htmlFor={id}
        className="block text-white/80 text-sm font-medium flex items-center"
      >
        {icon && <span className="mr-1.5 opacity-70">{icon}</span>}
        {label}
        {required && <span className="text-primary ml-1">*</span>}
      </label>

      {/* Input/select/textarea group with animations */}
      <motion.div
        variants={inputGroupVariants}
        initial="initial"
        whileHover={!disabled ? "focus" : undefined}
        whileFocus="focus"
        animate={error ? "error" : "initial"}
        className={`relative transition-all duration-200 bg-dark-900 border border-white/5 hover:border-white/10 rounded-xl overflow-hidden group`}
      >
        {type === 'textarea' ? (
          <textarea
            id={id}
            name={name}
            value={value}
            onChange={onChange}
            rows={rows}
            className="w-full px-4 py-3 bg-transparent text-white placeholder-white/30 focus:outline-none resize-none"
            placeholder={placeholder}
            disabled={disabled}
            aria-describedby={error ? errorId : undefined}
            aria-invalid={error ? 'true' : 'false'}
          />
        ) : type === 'select' ? (
          <select
            id={id}
            name={name}
            value={value}
            onChange={onChange}
            className="w-full px-4 py-3 bg-transparent text-white appearance-none focus:outline-none"
            disabled={disabled}
            aria-describedby={error ? errorId : undefined}
            aria-invalid={error ? 'true' : 'false'}
          >
            {children}
          </select>
        ) : (
          <input
            type={type}
            id={id}
            name={name}
            min={min}
            value={value}
            onChange={onChange}
            className="w-full px-4 py-3 bg-transparent text-white placeholder-white/30 focus:outline-none"
            placeholder={placeholder}
            disabled={disabled}
            aria-describedby={error ? errorId : undefined}
            aria-invalid={error ? 'true' : 'false'}
          />
        )}

        {/* Add subtle focus indicator animation */}
        <motion.div 
          className="absolute bottom-0 left-0 h-[2px] bg-primary" 
          initial={{ width: 0 }}
          whileHover={{ width: '100%' }}
          whileFocus={{ width: '100%' }}
          transition={{ duration: 0.2 }}
        />

        {/* Add arrow for select fields */}
        {type === 'select' && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-white/50">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        )}
      </motion.div>

      {/* Error message */}
      {error && (
        <motion.div
          id={errorId}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center text-red-500 text-sm mt-1"
          role="alert"
        >
          <AlertCircle className="h-3.5 w-3.5 mr-1.5" />
          {error}
        </motion.div>
      )}
    </div>
  );
}
