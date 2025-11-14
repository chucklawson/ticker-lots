
import React, { useState, useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import outputs from '../amplify_outputs.json';

Amplify.configure(outputs);
const client = generateClient();

// Types
interface TickerLot {
  id: string;
  ticker: string;
  quantity: number;
  costPerShare: number;
  purchaseDate: string;
  totalCost: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface LotFormData {
  ticker: string;
  quantity: string;
  costPerShare: string;
  purchaseDate: string;
  notes: string;
}

interface LotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  lot: TickerLot | null;
  mode: 'create' | 'edit';
}

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            {mode === 'edit' ? 'Edit Lot' : 'Add New Lot'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
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
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              {mode === 'edit' ? 'Update' : 'Add'} Lot
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App Component
function TickerLotApp() {
  const [lots, setLots] = useState<TickerLot[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedLot, setSelectedLot] = useState<TickerLot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLots();

    // Subscribe to real-time updates
    const subscription = client.models.TickerLot.observeQuery().subscribe({
      next: ({ items }) => {
        setLots(items as TickerLot[]);
      },
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchLots = async () => {
    try {
      setLoading(true);
      const { data } = await client.models.TickerLot.list();
      setLots(data as TickerLot[]);
    } catch (error) {
      console.error('Error fetching lots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLot = async (formData: any) => {
    try {
      await client.models.TickerLot.create({
        ticker: formData.ticker,
        quantity: formData.quantity,
        costPerShare: formData.costPerShare,
        purchaseDate: formData.purchaseDate,
        totalCost: formData.totalCost,
        notes: formData.notes || undefined,
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error creating lot:', error);
      alert('Failed to create lot');
    }
  };

  const handleUpdateLot = async (formData: any) => {
    if (!selectedLot) return;

    try {
      await client.models.TickerLot.update({
        id: selectedLot.id,
        ticker: formData.ticker,
        quantity: formData.quantity,
        costPerShare: formData.costPerShare,
        purchaseDate: formData.purchaseDate,
        totalCost: formData.totalCost,
        notes: formData.notes || undefined,
      });
      setIsModalOpen(false);
      setSelectedLot(null);
    } catch (error) {
      console.error('Error updating lot:', error);
      alert('Failed to update lot');
    }
  };

  const handleDeleteLot = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lot?')) return;

    try {
      await client.models.TickerLot.delete({ id });
    } catch (error) {
      console.error('Error deleting lot:', error);
      alert('Failed to delete lot');
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedLot(null);
    setIsModalOpen(true);
  };

  const openEditModal = (lot: TickerLot) => {
    setModalMode('edit');
    setSelectedLot(lot);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedLot(null);
  };

  const getTotalValue = () => {
    return lots.reduce((sum, lot) => sum + lot.totalCost, 0);
  };

  const groupedLots = lots.reduce((acc, lot) => {
    if (!acc[lot.ticker]) {
      acc[lot.ticker] = [];
    }
    acc[lot.ticker].push(lot);
    return acc;
  }, {} as Record<string, TickerLot[]>);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md mb-6 p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-800">Ticker Lot Manager</h1>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              <Plus size={20} />
              Add Lot
            </button>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-md">
            <p className="text-sm opacity-90">Total Portfolio Value</p>
            <p className="text-3xl font-bold">${getTotalValue().toFixed(2)}</p>
            <p className="text-sm opacity-90 mt-1">{lots.length} total lots</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading lots...</p>
          </div>
        ) : lots.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg">No lots yet. Add your first ticker lot to get started!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedLots).map(([ticker, tickerLots]) => (
              <div key={ticker} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-gray-100 px-6 py-3 border-b">
                  <h2 className="text-xl font-bold text-gray-800">{ticker}</h2>
                  <p className="text-sm text-gray-600">
                    {tickerLots.length} lot(s) • Total: $
                    {tickerLots.reduce((sum, lot) => sum + lot.totalCost, 0).toFixed(2)}
                  </p>
                </div>

                <div className="divide-y">
                  {tickerLots.map((lot) => (
                    <div key={lot.id} className="p-6 hover:bg-gray-50 transition">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
                            <div>
                              <p className="text-xs text-gray-500 uppercase">Quantity</p>
                              <p className="text-lg font-semibold text-gray-800">{lot.quantity}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase">Cost/Share</p>
                              <p className="text-lg font-semibold text-gray-800">${lot.costPerShare.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase">Total Cost</p>
                              <p className="text-lg font-semibold text-green-600">${lot.totalCost.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase">Purchase Date</p>
                              <p className="text-lg font-semibold text-gray-800">
                                {new Date(lot.purchaseDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          {lot.notes && (
                            <p className="text-sm text-gray-600 mt-2 italic">{lot.notes}</p>
                          )}
                        </div>

                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => openEditModal(lot)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                            title="Edit lot"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteLot(lot.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                            title="Delete lot"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <LotModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={modalMode === 'edit' ? handleUpdateLot : handleCreateLot}
        lot={selectedLot}
        mode={modalMode}
      />
    </div>
  );
}

// Export with Authenticator wrapper
export default function App() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div>
          <div className="bg-gray-800 text-white px-6 py-3 flex items-center justify-between">
            <p className="text-sm">Signed in as: {user?.signInDetails?.loginId}</p>
            <button
              onClick={signOut}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
            >
              Sign Out
            </button>
          </div>
          <TickerLotApp />
        </div>
      )}
    </Authenticator>
  );
}