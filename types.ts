
export interface Service {
  id: string;
  userId?: string; // Cloud sync
  name: string;
  defaultRate: number; // rate per sqft or per unit
  category: 'sqft' | 'unit';
}

export interface BillItem {
  id: string;
  serviceId: string;
  serviceName: string;
  width: number;
  height: number;
  sqft: number;
  rate: number;
  quantity: number;
  amount: number;
  status: 'Pending' | 'Paid'; // Added individual status
}

export interface Bill {
  id: string;
  userId?: string; // Cloud sync
  customerName: string;
  customerPhone: string;
  date: string;
  time: string;
  items: BillItem[];
  totalAmount: number;
  status: 'Pending' | 'Paid';
  notes: string;
  timestamp?: number;
}

export interface Expense {
  id: string;
  userId?: string; // Cloud sync
  amount: number;
  date: string;
  description: string;
}

export interface PersonalTransaction {
  id: string;
  userId?: string; // Cloud sync
  amount: number;
  date: string;
  description: string;
  category: string;
}

export type AppView = 'Billing' | 'History' | 'Analytics' | 'Personal';

export interface SubscriptionData {
  userId?: string; // Cloud sync
  installDate: string;
  isActivated: boolean;
  lastActivationDate?: string;
  pendingKey?: string;
}
