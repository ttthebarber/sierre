"use client";

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface FadeInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}

export function FadeIn({ 
  children, 
  className, 
  delay = 0, 
  duration = 300 
}: FadeInProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={cn(
        'transition-all ease-out',
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-4',
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
}

// Staggered fade-up for multiple children
interface StaggeredFadeInProps {
  children: React.ReactNode[];
  className?: string;
  staggerDelay?: number;
  duration?: number;
}

export function StaggeredFadeIn({ 
  children, 
  className, 
  staggerDelay = 50, 
  duration = 300 
}: StaggeredFadeInProps) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <FadeIn
          key={index}
          delay={index * staggerDelay}
          duration={duration}
        >
          {child}
        </FadeIn>
      ))}
    </div>
  );
}
