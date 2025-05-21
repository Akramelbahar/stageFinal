import React from 'react';

// Status badge component that changes color based on status
const StatusBadge = ({ status, className = '' }) => {
  const getStatusConfig = () => {
    switch (status?.toUpperCase()) {
      case 'OPERATIONNEL':
      case 'COMPLETED':
      case 'ACTIVE':
        return { 
          bgColor: 'bg-green-100', 
          textColor: 'text-green-800', 
          borderColor: 'border-green-200' 
        };
      
      case 'EN MAINTENANCE':
      case 'IN_PROGRESS':
      case 'PLANNED':
      case 'PENDING':
        return { 
          bgColor: 'bg-orange-100', 
          textColor: 'text-orange-800', 
          borderColor: 'border-orange-200' 
        };
      
      case 'HORS SERVICE':
      case 'FAILED':
      case 'CANCELLED':
        return { 
          bgColor: 'bg-red-100', 
          textColor: 'text-red-800', 
          borderColor: 'border-red-200' 
        };
      
      default:
        return { 
          bgColor: 'bg-gray-100', 
          textColor: 'text-gray-800', 
          borderColor: 'border-gray-200' 
        };
    }
  };

  const { bgColor, textColor, borderColor } = getStatusConfig();

  return (
    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full border ${bgColor} ${textColor} ${borderColor} ${className}`}>
      {status}
    </span>
  );
};

export default StatusBadge;