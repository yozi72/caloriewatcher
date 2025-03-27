
import React from 'react';

interface NutritionCardProps {
  title: string;
  value: string | number;
  unit?: string;
  color?: string;
  icon?: React.ReactNode;
  className?: string;
}

const NutritionCard: React.FC<NutritionCardProps> = ({
  title,
  value,
  unit = '',
  color = 'bg-health-blue',
  icon,
  className = '',
}) => {
  return (
    <div className={`relative overflow-hidden rounded-xl p-4 shadow-subtle bg-white ${className}`}>
      <div className={`absolute top-0 left-0 h-1 w-full ${color}`} />
      
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <div className="flex items-baseline mt-1">
            <p className="text-2xl font-semibold">{value}</p>
            {unit && <span className="ml-1 text-sm text-gray-500">{unit}</span>}
          </div>
        </div>
        
        {icon && (
          <div className={`p-2 rounded-full ${color} bg-opacity-10`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default NutritionCard;
