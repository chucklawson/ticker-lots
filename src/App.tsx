
import  { useState, useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { Plus, Edit2, Trash2, } from 'lucide-react';
import outputs from '../amplify_outputs.json';
import LotModal from "./components/LotModel.tsx";
import type {Schema } from '../amplify/data/resource'
import type {TickerLotEntries, LotSubmitData} from '../src/lib/types/TickerLotTypes'


Amplify.configure(outputs);
const client = generateClient<Schema>();


// Main App Component
function TickerLotApp() {
  const [lots, setLots] = useState<TickerLotEntries[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedLot, setSelectedLot] = useState<TickerLotEntries | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLots();

    const subscription = client.models.TickerLot.observeQuery().subscribe({
      next: ({ items }) => {
        setLots(items as TickerLotEntries[]);
      },
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchLots = async () => {
    try {
      setLoading(true);
      const { data } = await client.models.TickerLot.list();
      setLots(data as TickerLotEntries[]);
    } catch (error) {
      console.error('Error fetching lots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLot = async (formData: LotSubmitData) => {
    try {

      await client.models.TickerLot.create({
        ticker: formData.ticker,
        quantity: formData.quantity,
        costPerShare: formData.costPerShare,
        purchaseDate: formData.purchaseDate,
        totalCost: formData.totalCost,
        notes: formData.notes || null,
      });


      setIsModalOpen(false);
    } catch (error) {
      console.error('Error creating lot:', error);
      alert('Failed to create lot');
    }
  };

  const handleUpdateLot = async (formData: LotSubmitData) => {
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
    if (!window.confirm('Are you sure you want to delete this lot?')) return;

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

  const openEditModal = (lot: TickerLotEntries) => {
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
  }, {} as Record<string, TickerLotEntries[]>);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md mb-6 p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-800">Ticker Lot Manager</h1>
            <button
              style={{ backgroundColor: 'rgba(82, 227, 115, 0.3)' }}
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-gray-700 rounded-md hover:bg-blue-700 transition"
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
                            style={{ backgroundColor: 'rgba(82, 227, 115, 0.3)' }}
                            onClick={() => openEditModal(lot)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                            title="Edit lot"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            style={{ backgroundColor: 'rgba(82, 227, 115, 0.3)' }}
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
              style={{ backgroundColor: 'rgba(222, 221, 234, 0.3)' }}
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