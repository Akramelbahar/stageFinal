import React from 'react';

const Card = ({ 
  children, 
  title, 
  subtitle,
  action,
  className = '', 
  bodyClassName = '',
  noPadding = false
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm overflow-hidden ${className}`}>
      {(title || action) && (
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200">
          <div>
            {title && <h3 className="text-lg font-medium text-gray-800">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={`${noPadding ? '' : 'p-4'} ${bodyClassName}`}>
        {children}
      </div>
    </div>
  );
};

export default Card;