
import React, { useState } from 'react';
import { Bill, Expense } from '../types';
import { 
  ComposedChart, 
  Bar, 
  Line, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer
} from 'recharts';

interface InsightsViewProps {
  bills: Bill[];
  expenses: Expense[];
  onAddExpense: (e: Expense) => void;
  onDeleteExpense: (id: string) => void;
}

const InsightsView: React.FC<InsightsViewProps> = ({ bills, expenses, onAddExpense, onDeleteExpense }) => {
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expAmount, setExpAmount] = useState<number>(0);
  const [expDesc, setExpDesc] = useState('');

  const handleAddExp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expAmount) return;
    onAddExpense({
      id: Math.random().toString(36).substr(2, 9),
      amount: expAmount,
      date: new Date().toLocaleDateString(),
      description: expDesc
    });
    setExpAmount(0);
    setExpDesc('');
    setShowAddExpense(false);
  };

  const totalRevenue = bills.reduce((acc, bill) => {
    const paidItemsTotal = bill.items
      .filter(item => item.status === 'Paid')
      .reduce((sum, item) => sum + item.amount, 0);
    return acc + paidItemsTotal;
  }, 0);
    
  const totalExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);
  
  const totalPending = bills.reduce((acc, bill) => {
    const pendingItemsTotal = bill.items
      .filter(item => item.status === 'Pending')
      .reduce((sum, item) => sum + item.amount, 0);
    return acc + pendingItemsTotal;
  }, 0);
    
  const netProfit = totalRevenue - totalExpenses;

  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toLocaleDateString();
  }).reverse();

  const chartData = last30Days.map(date => {
    const dailyRevenue = bills
      .filter(b => b.date === date)
      .reduce((billSum, b) => {
        const paidItemsForDay = b.items
          .filter(item => item.status === 'Paid')
          .reduce((itemSum, item) => itemSum + item.amount, 0);
        return billSum + paidItemsForDay;
      }, 0);
      
    const dailyExpenses = expenses
      .filter(e => e.date === date)
      .reduce((sum, e) => sum + e.amount, 0);
    
    return { 
      date: date.split('/')[0] + '/' + date.split('/')[1], 
      Revenue: dailyRevenue, 
      Expenses: dailyExpenses,
      Profit: dailyRevenue - dailyExpenses
    };
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-2xl font-black text-gray-800 tracking-tight">Financial Intelligence</h2>
           <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Item-Level Revenue Analysis (30 Days)</p>
        </div>
        <button 
          onClick={() => setShowAddExpense(!showAddExpense)}
          className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center shadow-lg shadow-red-100 transition-all"
        >
          <i className={`fas ${showAddExpense ? 'fa-times' : 'fa-minus-circle'} mr-2`}></i>
          {showAddExpense ? 'Cancel' : 'Record Expense'}
        </button>
      </div>

      {showAddExpense && (
        <form onSubmit={handleAddExp} className="bg-white p-6 rounded-2xl shadow-xl border border-red-100 flex flex-wrap gap-4 animate-slide-up">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Description</label>
            <input 
              type="text" 
              className="w-full bg-white border border-gray-200 rounded-lg p-2.5 focus:ring-2 focus:ring-red-500 outline-none text-slate-900 font-medium" 
              placeholder="Rent, Raw material, etc." 
              value={expDesc} 
              onChange={e => setExpDesc(e.target.value)} 
              required 
            />
          </div>
          <div className="w-32">
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Amount (₹)</label>
            <input 
              type="number" 
              className="w-full bg-white border border-gray-200 rounded-lg p-2.5 font-bold focus:ring-2 focus:ring-red-500 outline-none text-slate-900" 
              value={expAmount} 
              onChange={e => setExpAmount(parseFloat(e.target.value) || 0)} 
              required 
            />
          </div>
          <div className="flex items-end"><button type="submit" className="bg-slate-800 text-white px-6 py-2.5 rounded-lg font-bold">Save Expense</button></div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:border-green-200 transition-all">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-2xl"><i className="fas fa-wallet text-xl"></i></div>
            <div>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Paid Revenue</p>
              <h4 className="text-xl font-black text-gray-800">₹{totalRevenue.toLocaleString('en-IN')}</h4>
              <p className="text-[8px] text-green-500 font-bold uppercase tracking-tighter">Verified Items Only</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:border-red-200 transition-all">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-2xl"><i className="fas fa-arrow-down text-xl"></i></div>
            <div>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Expenses</p>
              <h4 className="text-xl font-black text-gray-800">₹{totalExpenses.toLocaleString('en-IN')}</h4>
              <p className="text-[8px] text-red-400 font-bold uppercase tracking-tighter">Operational Costs</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:border-amber-200 transition-all">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><i className="fas fa-clock text-xl"></i></div>
            <div>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Pending Dues</p>
              <h4 className="text-xl font-black text-amber-600">₹{totalPending.toLocaleString('en-IN')}</h4>
              <p className="text-[8px] text-amber-500 font-bold uppercase tracking-tighter">Market Outstanding</p>
            </div>
          </div>
        </div>
        <div className={`p-6 rounded-3xl shadow-sm border transition-all ${netProfit >= 0 ? 'bg-orange-600 text-white border-orange-500' : 'bg-red-600 text-white border-red-500'}`}>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-2xl"><i className="fas fa-chart-line text-xl"></i></div>
            <div>
              <p className="text-[10px] opacity-80 font-black uppercase tracking-widest">Net Realized Profit</p>
              <h4 className="text-xl font-black">₹{netProfit.toLocaleString('en-IN')}</h4>
              <p className="text-[8px] opacity-60 font-bold uppercase tracking-tighter">Revenue - Expenses</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <h3 className="text-xl font-black text-gray-800 flex items-center">
            <span className="w-2 h-8 bg-orange-500 rounded-full mr-3"></span>
            Monthly Flow (Paid Items Only)
          </h3>
          <div className="flex flex-wrap gap-4 text-[9px] font-black uppercase tracking-widest text-gray-400">
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-400 rounded-sm"></span> Received</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-400 rounded-sm"></span> Spent</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-orange-500 rounded-full"></span> Profit</span>
          </div>
        </div>
        <div className="h-[500px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{fontSize: 8, fill: '#94a3b8', fontWeight: 'bold'}} axisLine={false} tickLine={false} dy={10} interval={1} />
              <YAxis tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={false} tickLine={false} dx={-10} />
              <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', padding: '16px'}} />
              <Legend verticalAlign="top" height={36}/>
              <Bar dataKey="Revenue" fill="#4ade80" radius={[4, 4, 0, 0]} barSize={12} name="Realized Revenue" />
              <Bar dataKey="Expenses" fill="#f87171" radius={[4, 4, 0, 0]} barSize={12} name="Business Expenses" />
              <Area type="monotone" dataKey="Profit" fill="#fff7ed" stroke="none" />
              <Line type="monotone" dataKey="Profit" stroke="#f97316" strokeWidth={3} dot={{r: 3, fill: '#f97316', strokeWidth: 2, stroke: '#fff'}} name="Daily Profit" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="px-8 py-6 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-black text-gray-700 uppercase text-xs tracking-widest">Recent Expense Log</h3>
          <span className="text-[10px] bg-red-100 text-red-600 px-2 py-1 rounded font-bold">{expenses.length} Records</span>
        </div>
        <div className="max-h-96 overflow-y-auto thin-scrollbar">
          {expenses.length === 0 ? (
            <div className="p-20 text-center text-gray-300"><i className="fas fa-receipt text-3xl mb-3 opacity-20 block"></i> No expenses recorded yet.</div>
          ) : (
            <table className="w-full text-left">
              <tbody className="divide-y divide-gray-50">
                {expenses.map(exp => (
                  <tr key={exp.id} className="hover:bg-gray-50 group">
                    <td className="px-8 py-5">
                      <div className="text-sm font-bold text-gray-800">{exp.description}</div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase">{exp.date}</div>
                    </td>
                    <td className="px-8 py-5 text-right font-black text-red-500">- ₹{exp.amount.toLocaleString('en-IN')}</td>
                    <td className="px-8 py-5 text-right">
                      <button onClick={() => onDeleteExpense(exp.id)} className="text-gray-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><i className="fas fa-trash-alt"></i></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default InsightsView;
