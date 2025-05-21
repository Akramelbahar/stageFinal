import React from 'react';

const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color = 'blue',
  className = '' 
}) => {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      icon: 'text-blue-500',
      progress: 'bg-blue-500'
    },
    green: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      icon: 'text-green-500',
      progress: 'bg-green-500'
    },
    orange: {
      bg: 'bg-orange-100',
      text: 'text-orange-800',
      icon: 'text-orange-500',
      progress: 'bg-orange-500'
    },
    red: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      icon: 'text-red-500',
      progress: 'bg-red-500'
    },
    purple: {
      bg: 'bg-purple-100',
      text: 'text-purple-800',
      icon: 'text-purple-500',
      progress: 'bg-purple-500'
    }
  };

  const { bg, text, icon: iconColor, progress } = colorClasses[color];

  return (
    <div className={`bg-white rounded-lg shadow-sm p-4 ${className}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        
        {icon && (
          <div className={`p-2 rounded-full ${bg}`}>
            <span className={`text-xl ${iconColor}`}>{icon}</span>
          </div>
        )}
      </div>
      
      <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full ${progress}`} style={{ width: '75%' }}></div>
      </div>
    </div>
  );
};

export default StatCard;