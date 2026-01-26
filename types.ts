
export interface Service {
  id: string;
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
  customerName: string;
  customerPhone: string;
  date: string;
  time: string;
  items: BillItem[];
  totalAmount: number;
  status: 'Pending' | 'Paid';
  notes: string;
}

export interface Expense {
  id: string;
  amount: number;
  date: string;
  description: string;
}

export interface PersonalTransaction {
  id: string;
  amount: number;
  date: string;
  description: string;
  category: string;
}

export type AppView = 'Billing' | 'History' | 'Analytics' | 'Personal';

export interface SubscriptionData {
  installDate: string;
  isActivated: boolean;
  lastActivationDate?: string;
  pendingKey?: string;
}
