import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Discount {
  _id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  minPurchase: number;
  maxUses: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  createdAt: string;
}

interface DiscountFormData {
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  minPurchase: number;
  maxUses: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}

const initialFormData: DiscountFormData = {
  code: '',
  description: '',
  discountType: 'percentage',
  value: 0,
  minPurchase: 0,
  maxUses: 0,
  validFrom: new Date().toISOString().split('T')[0],
  validUntil: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
  isActive: true
};

const DiscountManager: React.FC = () => {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<DiscountFormData>(initialFormData);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data } = await axios.get('/api/discounts');
      
      if (data.success) {
        setDiscounts(data.discounts);
      } else {
        setError('Failed to fetch discounts');
      }
    } catch (err: any) {
      console.error('Error fetching discounts:', err);
      setError(err.response?.data?.message || 'Failed to fetch discounts');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : type === 'number' 
          ? parseFloat(value) 
          : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setError(null);
      
      if (formMode === 'create') {
        // Create new discount
        const { data } = await axios.post('/api/discounts/new', formData);
        
        if (data.success) {
          setDiscounts([...discounts, data.discount]);
          resetForm();
        }
      } else {
        // Update existing discount
        const { data } = await axios.put(`/api/discounts/${editId}`, formData);
        
        if (data.success) {
          setDiscounts(discounts.map(d => d._id === editId ? data.discount : d));
          resetForm();
        }
      }
      
      setShowForm(false);
    } catch (err: any) {
      console.error('Discount save error:', err);
      setError(err.response?.data?.message || 'Failed to save discount');
    }
  };

  const handleEdit = (discount: Discount) => {
    setFormMode('edit');
    setEditId(discount._id);
    setFormData({
      code: discount.code,
      description: discount.description,
      discountType: discount.discountType,
      value: discount.value,
      minPurchase: discount.minPurchase,
      maxUses: discount.maxUses,
      validFrom: new Date(discount.validFrom).toISOString().split('T')[0],
      validUntil: new Date(discount.validUntil).toISOString().split('T')[0],
      isActive: discount.isActive
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this discount?')) {
      return;
    }
    
    try {
      setError(null);
      
      const { data } = await axios.delete(`/api/discounts/${id}`);
      
      if (data.success) {
        setDiscounts(discounts.filter(d => d._id !== id));
      } else {
        setError('Failed to delete discount');
      }
    } catch (err: any) {
      console.error('Discount delete error:', err);
      setError(err.response?.data?.message || 'Failed to delete discount');
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setFormMode('create');
    setEditId(null);
  };

  const toggleDiscountStatus = async (id: string, currentStatus: boolean) => {
    try {
      setError(null);
      
      const { data } = await axios.put(`/api/discounts/${id}`, {
        isActive: !currentStatus
      });
      
      if (data.success) {
        setDiscounts(discounts.map(d => d._id === id ? data.discount : d));
      } else {
        setError('Failed to update discount status');
      }
    } catch (err: any) {
      console.error('Discount status update error:', err);
      setError(err.response?.data?.message || 'Failed to update discount status');
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Discount Codes</h2>
        <button 
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          {showForm ? 'Cancel' : 'Add New Discount'}
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {showForm && (
        <div className="bg-gray-50 p-4 mb-6 rounded-lg border">
          <h3 className="text-xl font-semibold mb-4">
            {formMode === 'create' ? 'Create New Discount' : 'Edit Discount'}
          </h3>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-1">Code</label>
                <input 
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  required
                  disabled={formMode === 'edit'}
                />
                {formMode === 'edit' && (
                  <p className="text-sm text-gray-500 mt-1">Discount codes cannot be changed once created</p>
                )}
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1">Type</label>
                <select
                  name="discountType"
                  value={formData.discountType}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1">
                  {formData.discountType === 'percentage' ? 'Percentage (%)' : 'Amount ($)'}
                </label>
                <input 
                  type="number"
                  name="value"
                  value={formData.value}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  required
                  min="0"
                  max={formData.discountType === 'percentage' ? 100 : undefined}
                  step="0.01"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1">Minimum Purchase ($)</label>
                <input 
                  type="number"
                  name="minPurchase"
                  value={formData.minPurchase}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1">Max Uses (0 for unlimited)</label>
                <input 
                  type="number"
                  name="maxUses"
                  value={formData.maxUses}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  min="0"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1">Valid From</label>
                <input 
                  type="date"
                  name="validFrom"
                  value={formData.validFrom}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1">Valid Until</label>
                <input 
                  type="date"
                  name="validUntil"
                  value={formData.validUntil}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              
              <div className="flex items-center">
                <input 
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label htmlFor="isActive">Active</label>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                rows={3}
                required
              />
            </div>
            
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                {formMode === 'create' ? 'Create Discount' : 'Update Discount'}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
                className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      
      {discounts.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          No discount codes found
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valid Period</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {discounts.map(discount => (
                <tr key={discount._id}>
                  <td className="px-4 py-3 whitespace-nowrap font-medium">{discount.code}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {discount.discountType === 'percentage' ? 'Percentage' : 'Fixed'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {discount.discountType === 'percentage' 
                      ? `${discount.value}%` 
                      : `$${discount.value.toFixed(2)}`
                    }
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {discount.usedCount} / {discount.maxUses > 0 ? discount.maxUses : '∞'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {new Date(discount.validFrom).toLocaleDateString()} - {new Date(discount.validUntil).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      discount.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {discount.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => toggleDiscountStatus(discount._id, discount.isActive)}
                      className={`mr-2 text-xs px-2 py-1 rounded ${
                        discount.isActive 
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {discount.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleEdit(discount)}
                      className="mr-2 text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(discount._id)}
                      className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DiscountManager; 