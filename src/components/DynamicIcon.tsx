import React from 'react';
import * as LucideIcons from 'lucide-react';
import { Package } from 'lucide-react';

interface DynamicIconProps {
  name?: string;
  className?: string;
  size?: number;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({ name, className = 'w-5 h-5', size }) => {
  if (!name) {
    return <Package className={className} size={size} />;
  }

  // Handle name variations (PascalCase, kebab-case)
  const formattedName = name.includes('-')
    ? name
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('')
    : name.charAt(0).toUpperCase() + name.slice(1);

  const iconRegistry = LucideIcons as unknown as Record<string, React.ComponentType<any>>;
  const PossibleIcon = iconRegistry[formattedName] || iconRegistry[name];

  if (PossibleIcon && (typeof PossibleIcon === 'function' || typeof PossibleIcon === 'object')) {
    const Component = PossibleIcon;
    return <Component className={className} size={size} />;
  }

  return <Package className={className} size={size} />;
};

