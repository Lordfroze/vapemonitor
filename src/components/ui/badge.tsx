'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'accent' | 'success' | 'neutral';
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'accent', children, ...props }, ref) => {
    const variants = {
      accent: 'badge badge-accent',
      success: 'badge badge-success',
      neutral: 'badge badge-neutral',
    };

    return (
      <span
        ref={ref}
        className={cn(variants[variant], className)}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';