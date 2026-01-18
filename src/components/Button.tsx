import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { LoadingSpinner } from './LoadingSpinner';

export interface ButtonProps extends HTMLMotionProps<"button"> {
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: React.MouseEventHandler<HTMLButtonElement> | (() => Promise<void>) | (() => void);
  // Add title property for accessibility and tooltips
  title?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  isLoading = false,
  variant = 'primary',
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'px-6 py-3 font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-secondary transition-all duration-300 ease-in-out inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'bg-brand-primary text-brand-secondary hover:bg-yellow-300 focus:ring-brand-primary',
    secondary: 'bg-gray-700 text-white hover:bg-gray-600 focus:ring-gray-500',
    ghost: 'bg-transparent text-brand-primary hover:bg-brand-primary/10 focus:ring-brand-primary',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? <LoadingSpinner size="sm" /> : children}
    </motion.button>
  );
};

export default Button;