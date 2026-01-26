import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Bill, Service, AppView, Expense, PersonalTransaction, SubscriptionData } from './types';
import { DEFAULT_SERVICES } from './constants';
import BillingView from './components/BillingView';
import HistoryView from './components/HistoryView';
import InsightsView from './components/InsightsView';
import PersonalView from './components/PersonalView';
import LockOverlay from './components/LockOverlay';

const App: React.FC = () => {
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
  const isInitialLoadDone = useRef(false);

  useEffect(() => {
    const loadData = () => {
      try {
        const savedBills = localStorage.getItem('sganesh_bills');
        const savedServices = localStorage.getItem('sganesh_services');
        const savedExpenses = localStorage.getItem('sganesh_expenses');
        const savedPersonal = localStorage.getItem('sganesh_personal');
        const savedSub = localStorage.getItem('sganesh_subscription');

        if (savedBills) setBills(JSON.parse(savedBills));
        if (savedServices) setServices(JSON.parse(savedServices));
        if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
        if (savedPersonal) setPersonalTransactions(JSON.parse(savedPersonal));
        if (savedSub) setSubscription(JSON.parse(savedSub));
        
        isInitialLoadDone.current = true;
      } catch (error) {
        console.error("Storage Restoration Error:", error);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (isInitialLoadDone.current) {
      setIsSyncing(true);
      const timer = setTimeout(() => {
        localStorage.setItem('sganesh_bills', JSON.stringify(bills));
        localStorage.setItem('sganesh_services', JSON.stringify(services));
        localStorage.setItem('sganesh_expenses', JSON.stringify(expenses));
        localStorage.setItem('sganesh_personal', JSON.stringify(personalTransactions));
        localStorage.setItem('sganesh_subscription', JSON.stringify(subscription));
        setLastSync(new Date().toLocaleTimeString());
        setIsSyncing(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [bills, services, expenses, personalTransactions, subscription]);

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
  } else {
    const start = new Date(subscription.installDate);
    const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 3600 * 24));
    daysLeft = Math.max(0, TRIAL_DAYS - diff);
  }

  const isLocked = !subscription.isActivated && daysLeft <= 0;

  const addBill = useCallback((newBill: Bill) => {
    setBills(prev => {
      const existingIdx = prev.findIndex(b => b.status === 'Pending' && b.customerPhone === newBill.customerPhone && b.customerPhone !== '');
      if (existingIdx !== -1) {
        const updated = [...prev];
        const existing = updated[existingIdx];
        updated[existingIdx] = {
          ...existing,
          items: [...existing.items, ...newBill.items],
          totalAmount: existing.totalAmount + newBill.totalAmount,
          notes: existing.notes + (newBill.notes ? ` | ${newBill.notes}` : '')
        };
        alert(`Merged items into ${newBill.customerName}'s account.`);
        return updated;
      }
      return [newBill, ...prev];
    });
  }, []);

  const updateItemStatus = (billId: string, itemId: string, status: 'Pending' | 'Paid') => {
    setBills(prev => prev.map(bill => {
      if (bill.id !== billId) return bill;
      const items = bill.items.map(i => i.id === itemId ? { ...i, status } : i);
      const allPaid = items.every(i => i.status === 'Paid');
      return { ...bill, items, status: allPaid ? 'Paid' : 'Pending' };
    }));
  };

  const exportCSV = () => {
    // Detailed headers for professional reporting
    const headers = [
      "Invoice ID", "Date", "Time", "Customer Name", "Contact",
      "Item Service", "Width (ft)", "Height (ft)", "Sqft/Unit", "Rate", "Qty",
      "Item Amount", "Item Payment", "Grand Total", "Bill Status", "Office Notes"
    ];

    const rows: string[] = [];

    bills.forEach(bill => {
      bill.items.forEach(item => {
        const rowData = [
          `"${bill.id}"`,
          `"${bill.date}"`,
          `"${bill.time}"`,
          `"${bill.customerName.replace(/"/g, '""')}"`,
          `"${bill.customerPhone}"`,
          `"${item.serviceName.replace(/"/g, '""')}"`,
          item.width,
          item.height,
          item.sqft.toFixed(2),
          item.rate,
          item.quantity,
          item.amount,
          `"${item.status}"`,
          bill.totalAmount,
          `"${bill.status}"`,
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

  return (
    <div className="h-screen flex flex-col md:flex-row bg-[#F8FAFC] font-sans overflow-hidden">
      <style>{`
        .thin-scrollbar::-webkit-scrollbar { width: 4px; }
        .thin-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
        @keyframes pulse-io { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        .pulse-io { animation: pulse-io 2s infinite; }
      `}</style>

      {isLocked && <LockOverlay onActivate={() => setSubscription(prev => ({ ...prev, isActivated: true, lastActivationDate: new Date().toISOString() }))} pendingKey={subscription.pendingKey || 'SG-KEY'} />}

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
             <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">Secure Layer Online</span>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto thin-scrollbar relative p-8 md:p-16">
        <div className="max-w-7xl mx-auto pb-20">
          {view === 'Billing' && <BillingView services={services} onSave={addBill} onAddService={s => setServices(p => [...p, s])} onDeleteService={id => setServices(p => p.filter(s => s.id !== id))} />}
          {view === 'History' && <HistoryView bills={bills} onUpdateItemStatus={updateItemStatus} onDelete={id => setBills(p => p.filter(b => b.id !== id))} />}
          {view === 'Analytics' && <InsightsView bills={bills} expenses={expenses} onAddExpense={e => setExpenses(p => [e, ...p])} onDeleteExpense={id => setExpenses(p => p.filter(e => e.id !== id))} />}
          {view === 'Personal' && <PersonalView transactions={personalTransactions} onAdd={t => setPersonalTransactions(p => [t, ...p])} onDelete={id => setPersonalTransactions(p => p.filter(t => t.id !== id))} />}
        </div>
      </main>

      <div className="fixed bottom-0 left-0 w-full bg-[#0F172A] border-t border-slate-800 h-10 flex items-center px-10 overflow-hidden z-30">
        <div className="whitespace-nowrap flex items-center gap-10 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
           <span>DB Sync: {lastSync}</span>
           <span className="text-orange-600">Developer Support: +91 9960967852</span>
           <span>Persistent Engine: V8.0.2 Stable</span>
           <span>Storage Cache: {(JSON.stringify(bills).length / 1024).toFixed(1)} KB</span>
        </div>
      </div>
    </div>
  );
};

export default App;