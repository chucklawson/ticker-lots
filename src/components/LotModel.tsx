import React, { useState, useEffect } from 'react';
//import { Amplify } from 'aws-amplify';
//import { generateClient } from 'aws-amplify/data';
//import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import type {LotModalProps, LotFormData} from '../lib/types/TickerLotTypes'
//import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { X } from 'lucide-react';
//import outputs from '../amplify_outputs.json';
import "./LotModel.css"

// Modal Component

const LotModal: React.FC<LotModalProps> = ({ isOpen, onClose, onSave, lot, mode }) => {
  const [formData, setFormData] = useState<LotFormData>({
    ticker: '',
    quantity: '',
    costPerShare: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  useEffect(() => {
    if (lot && mode === 'edit') {
      setFormData({
        ticker: lot.ticker,
        quantity: lot.quantity.toString(),
        costPerShare: lot.costPerShare.toString(),
        purchaseDate: lot.purchaseDate,
        notes: lot.notes || '',
      });
    } else if (mode === 'create') {
      setFormData({
        ticker: '',
        quantity: '',
        costPerShare: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        notes: '',
      });
    }
  }, [lot, mode, isOpen]);

  const handleSubmit = () => {
    const quantity = parseFloat(formData.quantity);
    const costPerShare = parseFloat(formData.costPerShare);
    const totalCost = quantity * costPerShare;

    onSave({
      ...formData,
      quantity,
      costPerShare,
      totalCost,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(17, 24, 39, 0.3)' }}>
      {/*<div className="fixed inset-0 bg-gray-50 bg-opacity-90 flex items-center justify-center z-50 p-4">*/}
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">

        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            {mode === 'edit' ? 'Edit Lot' : 'Add New Lot'}
          </h2>

          <button style={{ backgroundColor: 'rgba(82, 227, 115, 0.3)' }}
            className= "text-gray-400 hover:text-gray-600 transition"
            onClick={onClose}
          >
            <X size={24} />
          </button>

        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ticker Symbol
            </label>
            <input
              type="text"
              required
              value={formData.ticker}
              onChange={(e) => setFormData({ ...formData, ticker: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="AAPL"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity
            </label>
            <input
              type="number"
              step="0.0001"
              required
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cost Per Share ($)
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.costPerShare}
              onChange={(e) => setFormData({ ...formData, costPerShare: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="150.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Purchase Date
            </label>
            <input
              type="date"
              required
              value={formData.purchaseDate}
              onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Additional notes..."
            />
          </div>

          {formData.quantity && formData.costPerShare && (
            <div className="bg-blue-50 p-4 rounded-md">
              <p className="text-sm font-medium text-gray-700">
                Total Cost: ${(parseFloat(formData.quantity) * parseFloat(formData.costPerShare)).toFixed(2)}
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              //style={{ backgroundColor: 'rgba(82, 227, 115, 0.3)' }}
              onClick={onClose}
              //className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
              className='button-class-popup'
            >
              Cancel
            </button>
            <button
              type="button"
              //style={{ backgroundColor: 'rgba(82, 227, 115, .3)' }}
              onClick={handleSubmit}
              //className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              className='button-class-popup'
            >
              {mode === 'edit' ? 'Update' : 'Add'} Lot
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default LotModal;

