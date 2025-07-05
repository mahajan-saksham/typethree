import React from 'react';

interface ErrorMessageProps {
  message?: string;
  type?: 'error' | 'warning' | 'info';
  onRetry?: () => void;
}

export function ErrorMessage({
  message = 'An error occurred while loading the data.',
  type = 'error',
  onRetry
}: ErrorMessageProps) {
  // Determine colors based on type
  let bgColor, textColor, borderColor, iconColor;
  
  switch (type) {
    case 'warning':
      bgColor = 'bg-yellow-50';
      textColor = 'text-yellow-800';
      borderColor = 'border-yellow-300';
      iconColor = 'text-yellow-400';
      break;
    case 'info':
      bgColor = 'bg-blue-50';
      textColor = 'text-blue-800';
      borderColor = 'border-blue-300';
      iconColor = 'text-blue-400';
      break;
    case 'error':
    default:
      bgColor = 'bg-red-50';
      textColor = 'text-red-800';
      borderColor = 'border-red-300';
      iconColor = 'text-red-400';
      break;
  }
  
  return (
    <div className={`rounded-md ${bgColor} p-4 ${borderColor} border`}>
      <div className="flex">
        <div className="flex-shrink-0">
          {/* Error Icon */}
          <svg className={`h-5 w-5 ${iconColor}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className={`text-sm font-medium ${textColor}`}>{message}</p>
          
          {/* Retry Button */}
          {onRetry && (
            <div className="mt-2">
              <button
                type="button"
                onClick={onRetry}
                className={`px-2 py-1.5 rounded-md text-sm font-medium ${textColor} bg-white border ${borderColor} hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-${type === 'error' ? 'red' : type === 'warning' ? 'yellow' : 'blue'}-50 focus:ring-${type === 'error' ? 'red' : type === 'warning' ? 'yellow' : 'blue'}-500`}
              >
                Try again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
