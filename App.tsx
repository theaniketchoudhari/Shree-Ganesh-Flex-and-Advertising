import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Bill, Service, AppView, Expense, PersonalTransaction, SubscriptionData } from './types';
import { DEFAULT_SERVICES } from './constants';
import BillingView from './components/BillingView';
import HistoryView from './components/HistoryView';
import InsightsView from './components/InsightsView';
import PersonalView from './components/PersonalView';
import LockOverlay from './components/LockOverlay';
import Login from './components/Login';
import { auth, db, logout, OperationType, handleFirestoreError } from './services/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  getDoc,
  serverTimestamp 
} from 'firebase/firestore';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<AppView>('Billing');
  const [bills, setBills] = useState<Bill[]>([]);
  const [services, setServices] = useState<Service[]>(DEFAULT_SERVICES);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [personalTransactions, setPersonalTransactions] = useState<PersonalTransaction[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionData>({
    installDate: new Date().toISOString(),
    isActivated: false
  });
  
  const [lastSync, setLastSync] = useState<string>(new Date().toLocaleTimeString());
  const [isSyncing, setIsSyncing] = useState(false);

  // Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Real-time Firestore Listeners
  useEffect(() => {
    if (!user) return;

    setIsSyncing(true);
    
    // Subscriptions
    const subRef = doc(db, 'subscriptions', user.uid);
    const unsubSub = onSnapshot(subRef, (snap) => {
      if (snap.exists()) {
        setSubscription(snap.data() as SubscriptionData);
      } else {
        // Init subscription for new user
        const initialSub: SubscriptionData = {
          userId: user.uid,
          installDate: new Date().toISOString(),
          isActivated: false,
          pendingKey: 'SG-' + Math.random().toString(36).substring(7).toUpperCase()
        };
        setDoc(subRef, initialSub).catch(e => handleFirestoreError(e, OperationType.CREATE, 'subscriptions'));
      }
    }, (e) => handleFirestoreError(e, OperationType.GET, 'subscriptions'));

    // Bills
    const billsQuery = query(collection(db, 'bills'), where('userId', '==', user.uid));
    const unsubBills = onSnapshot(billsQuery, (snap) => {
      console.log("Bills sync:", snap.size);
      const data = snap.docs.map(d => d.data() as Bill).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      setBills(data);
      setLastSync(new Date().toLocaleTimeString());
      setIsSyncing(false);
    }, (e) => handleFirestoreError(e, OperationType.LIST, 'bills'));

    // Services
    const servicesQuery = query(collection(db, 'services'), where('userId', '==', user.uid));
    const unsubServices = onSnapshot(servicesQuery, (snap) => {
      const customServices = snap.docs.map(d => d.data() as Service);
      setServices([...DEFAULT_SERVICES, ...customServices]);
    }, (e) => handleFirestoreError(e, OperationType.LIST, 'services'));

    // Expenses
    const expensesQuery = query(collection(db, 'expenses'), where('userId', '==', user.uid));
    const unsubExpenses = onSnapshot(expensesQuery, (snap) => {
      console.log("Expenses sync:", snap.size);
      const data = snap.docs.map(d => d.data() as Expense).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setExpenses(data);
    }, (e) => handleFirestoreError(e, OperationType.LIST, 'expenses'));

    // Personal Transactions
    const personalQuery = query(collection(db, 'personalTransactions'), where('userId', '==', user.uid));
    const unsubPersonal = onSnapshot(personalQuery, (snap) => {
      console.log("Personal transactions sync:", snap.size);
      const data = snap.docs.map(d => d.data() as PersonalTransaction).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setPersonalTransactions(data);
    }, (e) => handleFirestoreError(e, OperationType.LIST, 'personalTransactions'));

    return () => {
      unsubSub();
      unsubBills();
      unsubServices();
      unsubExpenses();
      unsubPersonal();
    };
  }, [user]);

  // Activation Logic
  const PREMIUM_DAYS = 30;
  const TRIAL_DAYS = 0; 
  const now = new Date();
  let daysLeft = 0;
  let progress = 0;

  if (subscription.isActivated && subscription.lastActivationDate) {
    const start = new Date(subscription.lastActivationDate);
    const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 3600 * 24));
    daysLeft = Math.max(0, PREMIUM_DAYS - diff);
    progress = (daysLeft / PREMIUM_DAYS) * 100;
  } else if (subscription.installDate) {
    const start = new Date(subscription.installDate);
    const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 3600 * 24));
    daysLeft = Math.max(0, TRIAL_DAYS - diff);
  }

  const isLocked = !subscription.isActivated && daysLeft <= 0;

  const addBill = async (newBill: Bill) => {
    if (!user) return;
    try {
      console.log("Saving Bill:", newBill.id, "for user:", user.uid);
      const existingIdx = bills.findIndex(b => b.status === 'Pending' && b.customerPhone === newBill.customerPhone && b.customerPhone !== '');
      if (existingIdx !== -1) {
        const existing = bills[existingIdx];
        const updatedBill = {
          ...existing,
          items: [...existing.items, ...newBill.items],
          totalAmount: existing.totalAmount + newBill.totalAmount,
          notes: (existing.notes || '') + (newBill.notes ? ` | ${newBill.notes}` : ''),
          updatedAt: serverTimestamp(),
          userId: user.uid // Ensure userId is preserved
        };
        await setDoc(doc(db, 'bills', existing.id), updatedBill);
        alert(`Merged items into ${newBill.customerName}'s account.`);
      } else {
        await setDoc(doc(db, 'bills', newBill.id), { 
          ...newBill, 
          userId: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        console.log("Bill Saved Successfully:", newBill.id);
      }
    } catch (e) {
      console.error("Error saving bill:", e);
      handleFirestoreError(e, OperationType.WRITE, 'bills');
    }
  };

  const updateItemStatus = async (billId: string, itemId: string, status: 'Pending' | 'Paid') => {
    const bill = bills.find(b => b.id === billId);
    if (!bill) return;
    const items = bill.items.map(i => i.id === itemId ? { ...i, status } : i);
    const allPaid = items.every(i => i.status === 'Paid');
    try {
      await updateDoc(doc(db, 'bills', billId), { 
        items, 
        status: allPaid ? 'Paid' : 'Pending',
        updatedAt: serverTimestamp()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'bills');
    }
  };

  const deleteBill = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'bills', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, 'bills');
    }
  };

  const addService = async (s: Service) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'services', s.id), { ...s, userId: user.uid });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'services');
    }
  };

  const deleteService = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'services', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, 'services');
    }
  };

  const addExpense = async (e: Expense) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'expenses', e.id), { ...e, userId: user.uid });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'expenses');
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'expenses', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, 'expenses');
    }
  };

  const addPersonal = async (t: PersonalTransaction) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'personalTransactions', t.id), { ...t, userId: user.uid });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'personalTransactions');
    }
  };

  const deletePersonal = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'personalTransactions', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, 'personalTransactions');
    }
  };

  const activateSubscription = async () => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'subscriptions', user.uid), {
        isActivated: true,
        lastActivationDate: new Date().toISOString()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'subscriptions');
    }
  };

  const exportCSV = () => {
    const headers = [
      "Invoice ID", "Date", "Time", "Customer Name", "Contact",
      "Item Service", "Width (ft)", "Height (ft)", "Sqft/Unit", "Rate", "Qty",
      "Item Amount", "Item Payment", "Grand Total", "Bill Status", "Office Notes"
    ];
    const rows: string[] = [];
    bills.forEach(bill => {
      bill.items.forEach(item => {
        const rowData = [
          `"${bill.id}"`, `"${bill.date}"`, `"${bill.time}"`,
          `"${bill.customerName.replace(/"/g, '""')}"`, `"${bill.customerPhone}"`,
          `"${item.serviceName.replace(/"/g, '""')}"`, item.width, item.height,
          item.sqft.toFixed(2), item.rate, item.quantity, item.amount,
          `"${item.status}"`, bill.totalAmount, `"${bill.status}"`,
          `"${bill.notes.replace(/"/g, '""')}"`
        ];
        rows.push(rowData.join(","));
      });
    });
    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ShreeGanesh_Detailed_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#0F172A]">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="h-screen flex flex-col md:flex-row bg-[#F8FAFC] font-sans overflow-hidden">
      <style>{`
        .thin-scrollbar::-webkit-scrollbar { width: 4px; }
        .thin-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
        @keyframes pulse-io { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        .pulse-io { animation: pulse-io 2s infinite; }
        .spinner {
          width: 56px;
          height: 56px;
          border: 6px solid rgba(255, 255, 255, 0.1);
          border-top: 6px solid #EA580C;
          border-radius: 50%;
          animation: spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>

      {isLocked && <LockOverlay onActivate={activateSubscription} pendingKey={subscription.pendingKey || 'SG-KEY'} />}

      {/* Nav Sidebar */}
      <nav className="w-full md:w-80 bg-[#0F172A] text-white flex flex-col flex-shrink-0 z-20 shadow-2xl">
        <div className="p-10 border-b border-slate-800">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-orange-600 rounded-[1.25rem] flex items-center justify-center shadow-2xl shadow-orange-900/50">
               <i className="fas fa-print text-lg"></i>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter leading-none">SHREE GANESH</h1>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">Business ERP v8.0</span>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4 p-3 bg-slate-800/50 rounded-2xl border border-slate-700/50 group">
            <img src={user.photoURL || ''} alt="Avatar" className="w-8 h-8 rounded-full border border-orange-500/50" />
            <div className="flex-1 overflow-hidden">
               <div className="text-[10px] font-black text-white truncate">{user.displayName}</div>
               <div className="text-[8px] text-slate-500 truncate uppercase tracking-widest">{user.email}</div>
            </div>
            <button onClick={logout} className="text-slate-500 hover:text-white transition-colors">
               <i className="fas fa-sign-out-alt text-xs"></i>
            </button>
          </div>
        </div>

        <div className="flex-1 py-10 space-y-1 overflow-y-auto thin-scrollbar">
          {[
            { id: 'Billing', label: 'Create Invoice', icon: 'fa-plus-circle' },
            { id: 'History', label: 'Sales History', icon: 'fa-receipt' },
            { id: 'Analytics', label: 'Finance Intelligence', icon: 'fa-chart-pie' },
            { id: 'Personal', label: 'Private Vault', icon: 'fa-user-lock' }
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setView(item.id as AppView)}
              className={`w-full text-left px-10 py-5 flex items-center gap-4 transition-all relative group ${view === item.id ? 'bg-orange-600 text-white' : 'text-slate-400 hover:bg-slate-800/50'}`}
            >
              {view === item.id && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-white"></div>}
              <i className={`fas ${item.icon} text-sm transition-transform group-hover:scale-110`}></i>
              <span className="font-black text-xs uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="p-10 border-t border-slate-800 bg-slate-900/30 space-y-6">
          <div className="space-y-4">
             <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                <span>License Integrity</span>
                <i className="fas fa-shield-alt text-green-500"></i>
             </div>
             <div className="bg-slate-800/50 rounded-3xl p-5 border border-slate-700/50">
               <div className="flex justify-between items-end mb-3">
                  <div className="text-2xl font-black text-white">{daysLeft} <span className="text-[10px] text-slate-500 uppercase tracking-widest">Days</span></div>
                  <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${subscription.isActivated ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'}`}>
                    {subscription.isActivated ? 'Active' : 'Trial'}
                  </span>
               </div>
               <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
                 <div className="h-full bg-orange-600 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
               </div>
             </div>
          </div>
          <button onClick={exportCSV} className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[9px] font-black uppercase tracking-widest py-4 rounded-2xl flex items-center justify-center gap-3 transition-all">
            <i className="fas fa-database text-orange-500"></i>
            Detailed CSV Export
          </button>
          <div className="flex items-center justify-center gap-2">
             <div className={`w-1.5 h-1.5 rounded-full ${isSyncing ? 'bg-orange-500 animate-spin' : 'bg-green-500 pulse-io'}`}></div>
             <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">Cloud Layer Online</span>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto thin-scrollbar relative p-8 md:p-16">
        <div className="max-w-7xl mx-auto pb-20">
          {view === 'Billing' && <BillingView services={services} onSave={addBill} onAddService={addService} onDeleteService={deleteService} />}
          {view === 'History' && <HistoryView bills={bills} onUpdateItemStatus={updateItemStatus} onDelete={deleteBill} />}
          {view === 'Analytics' && <InsightsView bills={bills} expenses={expenses} onAddExpense={addExpense} onDeleteExpense={deleteExpense} />}
          {view === 'Personal' && <PersonalView transactions={personalTransactions} onAdd={addPersonal} onDelete={deletePersonal} />}
        </div>
      </main>

      <div className="fixed bottom-0 left-0 w-full bg-[#0F172A] border-t border-slate-800 h-10 flex items-center px-10 overflow-hidden z-30">
        <div className="whitespace-nowrap flex items-center gap-10 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
           <span>Cloud Sync: {lastSync}</span>
           <span className="text-orange-600">Developer Support: +91 9960967852</span>
           <span>Persistent Engine: Cloud V1.0 Stable</span>
           <span>User Node: {user.uid.substring(0, 8)}</span>
        </div>
      </div>
    </div>
  );
};

export default App;