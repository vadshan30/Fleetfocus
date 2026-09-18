import React from 'react';
import * as LucideIcons from 'lucide-react';

const sizeMap = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

const Icon = ({ name, size = 'md', className = '', ...props }) => {
  const IconComponent = LucideIcons[name] || LucideIcons.HelpCircle;
  const pixelSize = typeof size === 'number' ? size : sizeMap[size] || 20;

  return (
    <IconComponent
      size={pixelSize}
      className={`inline-block shrink-0 ${className}`}
      {...props}
    />
  );
};

export default Icon;
