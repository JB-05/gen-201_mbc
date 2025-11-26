'use client';

import * as React from 'react';
import { Input } from './input';

export interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const CustomInput = React.forwardRef<HTMLInputElement, CustomInputProps>(
  ({ className, ...props }, ref) => {
    // Filter out problematic attributes
    const safeProps = Object.fromEntries(
      Object.entries(props).filter(([key]) => 
        !key.startsWith('data-temp-mail-org') && 
        key !== 'style'
      )
    );

    return (
      <Input
        ref={ref}
        className={className}
        {...safeProps}
      />
    );
  }
);

CustomInput.displayName = 'CustomInput';
