// Types
export interface TickerLotEntries {
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

export interface LotFormData {
  ticker: string;
  quantity: string;
  costPerShare: string;
  purchaseDate: string;
  notes: string;
}
export interface LotSubmitData {
  ticker: string;
  quantity: number;
  costPerShare: number;
  purchaseDate: string;
  totalCost: number;
  notes: string;
}

export interface TickerLot {
  id: string;
  ticker: string;
  quantity: number;
  costPerShare: number;
  purchaseDate: string;
  totalCost: number;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: LotSubmitData) => void;
  lot: TickerLot | null;
  mode: 'create' | 'edit';
}