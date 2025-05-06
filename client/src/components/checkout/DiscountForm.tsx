import React, { useState } from 'react';
import axios from 'axios';

interface DiscountFormProps {
  cartTotal: number;
  onApplyDiscount: (discount: {
    _id: string;
    code: string;
    discountType: 'percentage' | 'fixed';
    value: number;
    discountAmount: number;
  }) => void;
  onRemoveDiscount: () => void;
  appliedDiscount: any | null;
}

const DiscountForm: React.FC<DiscountFormProps> = ({ 
  cartTotal, 
  onApplyDiscount, 
  onRemoveDiscount,
  appliedDiscount 
}) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApplyDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) {
      setError('Please enter a discount code');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const { data } = await axios.post('/api/discounts/validate', {
        code,
        cartTotal
      });
      
      if (data.success) {
        onApplyDiscount(data.discount);
        setCode('');
      } else {
        setError('Invalid discount code');
      }
    } catch (err: any) {
      console.error('Error applying discount:', err);
      setError(err.response?.data?.message || 'Failed to apply discount');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDiscount = () => {
    onRemoveDiscount();
    setCode('');
    setError(null);
  };

  // If a discount is already applied, show the details
  if (appliedDiscount) {
    return (
      <div className="bg-green-50 p-4 rounded-md mb-4">
        <div className="flex justify-between items-center">
          <div>
            <span className="font-medium">Applied: </span>
            <span className="text-green-700">{appliedDiscount.code}</span>
            <span className="ml-2 text-gray-600">
              ({appliedDiscount.discountType === 'percentage' 
                ? `${appliedDiscount.value}%` 
                : `$${appliedDiscount.value.toFixed(2)}`} off)
            </span>
            <div className="text-green-600 font-medium">
              Savings: ${appliedDiscount.discountAmount.toFixed(2)}
            </div>
          </div>
          <button 
            onClick={handleRemoveDiscount} 
            className="text-sm text-red-600 hover:text-red-800 underline"
          >
            Remove
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <h3 className="text-lg font-medium mb-2">Discount Code</h3>
      <form onSubmit={handleApplyDiscount} className="flex">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter code"
          className="border rounded-l px-3 py-2 flex-grow"
        />
        <button
          type="submit"
          disabled={loading}
          className={`px-4 py-2 rounded-r font-medium ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {loading ? 'Applying...' : 'Apply'}
        </button>
      </form>
      {error && (
        <div className="text-red-600 text-sm mt-1">
          {error}
        </div>
      )}
    </div>
  );
};

export default DiscountForm; 