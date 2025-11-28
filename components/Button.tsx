import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { IconCoffee1, IconCoffee2, IconCoffee3 } from './icons';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  className,
  variant = 'primary',
  size = 'md',
  isLoading,
  children,
  disabled,
  ...props
}) => {
  const [coffeeFrame, setCoffeeFrame] = useState(0);

  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setCoffeeFrame(prev => (prev + 1) % 3);
    }, 300);

    return () => clearInterval(interval);
  }, [isLoading]);

  const baseStyles = "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-black focus:ring-gray-900",
    secondary: "bg-white text-primary border border-primary/20 hover:bg-gray-50 focus:ring-gray-200 shadow-sm",
    ghost: "bg-transparent hover:bg-gray-100 text-primary focus:ring-gray-400",
    danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500",
  };

  const sizes = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 py-2",
    lg: "h-12 px-6 text-lg",
  };

  return (
    <button
      className={twMerge(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          {coffeeFrame === 0 && <IconCoffee3 width={16} height={16} style={{ marginRight: '8px' }} />}
          {coffeeFrame === 1 && <IconCoffee2 width={16} height={16} style={{ marginRight: '8px' }} />}
          {coffeeFrame === 2 && <IconCoffee1 width={16} height={16} style={{ marginRight: '8px' }} />}
          Processing...
        </>
      ) : children}
    </button>
  );
};