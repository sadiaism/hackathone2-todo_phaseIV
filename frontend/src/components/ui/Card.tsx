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
    <div className={`rounded-xl border bg-card text-card-foreground shadow ${className}`}>
      {(title || description) && (
        <div className="p-6 pb-0">
          {title && <h3 className="font-semibold leading-none tracking-tight">{title}</h3>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      )}
      <div className={`p-6 ${title || description ? '' : 'pt-0'}`}>
        {children}
      </div>
    </div>
  );
};

export default Card;