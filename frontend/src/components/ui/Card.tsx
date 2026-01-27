import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  description
}) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
      {(title || description) && (
        <div className="mb-4">
          {title && <h3 className="text-xl font-semibold text-gray-900 mb-1">{title}</h3>}
          {description && <p className="text-gray-600 text-sm">{description}</p>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;