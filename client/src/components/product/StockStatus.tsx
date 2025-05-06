import React from 'react';

interface StockStatusProps {
  stock: number;
  showCount?: boolean; // Option to hide the exact count
  className?: string; // Allow custom styling
}

const StockStatus: React.FC<StockStatusProps> = ({ 
  stock, 
  showCount = true,
  className = '' 
}) => {
  if (stock <= 0) {
    return (
      <div className={`bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium inline-flex items-center ${className}`}>
        <span className="h-2 w-2 rounded-full bg-red-500 mr-1.5"></span>
        Out of Stock
      </div>
    );
  }
  
  if (stock <= 5) {
    return (
      <div className={`bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium inline-flex items-center ${className}`}>
        <span className="h-2 w-2 rounded-full bg-yellow-500 mr-1.5"></span>
        Low Stock{showCount ? `: ${stock} left` : ''}
      </div>
    );
  }
  
  return (
    <div className={`bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium inline-flex items-center ${className}`}>
      <span className="h-2 w-2 rounded-full bg-green-500 mr-1.5"></span>
      In Stock{showCount ? `: ${stock} available` : ''}
    </div>
  );
};

export default StockStatus; 