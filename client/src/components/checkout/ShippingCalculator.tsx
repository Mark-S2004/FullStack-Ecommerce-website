import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface ShippingInfo {
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  phoneNo: string;
}

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  stock: number;
}

interface ShippingCalculatorProps {
  shippingInfo: ShippingInfo;
  orderItems: OrderItem[];
  onCalculationComplete: (calculation: {
    itemsPrice: number;
    shippingPrice: number;
    taxPrice: number;
    totalPrice: number;
  }) => void;
}

const ShippingCalculator: React.FC<ShippingCalculatorProps> = ({
  shippingInfo,
  orderItems,
  onCalculationComplete
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Convert cart items to the format expected by the API
  const prepareOrderItems = () => {
    return orderItems.map(item => ({
      product: item.productId,
      price: item.price,
      quantity: item.quantity
    }));
  };

  useEffect(() => {
    const calculateShipping = async () => {
      // Only calculate if we have complete shipping info and items
      if (!shippingInfo.country || !orderItems.length) {
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const prepared = prepareOrderItems();
        
        const { data } = await axios.post('/api/orders/calculate', {
          orderItems: prepared,
          shippingInfo
        });
        
        if (data.success) {
          onCalculationComplete({
            itemsPrice: data.itemsPrice,
            shippingPrice: data.shippingPrice,
            taxPrice: data.taxPrice,
            totalPrice: data.totalPrice
          });
        } else {
          setError('Failed to calculate shipping');
        }
      } catch (err: any) {
        console.error('Shipping calculation error:', err);
        setError(err.response?.data?.message || 'Failed to calculate shipping costs');
      } finally {
        setLoading(false);
      }
    };

    calculateShipping();
  }, [shippingInfo, orderItems]);

  if (loading) {
    return <div className="text-sm text-gray-600">Calculating shipping costs...</div>;
  }

  if (error) {
    return <div className="text-sm text-red-600">{error}</div>;
  }

  return null; // This component doesn't render anything visible, it just performs the calculation
};

export default ShippingCalculator; 