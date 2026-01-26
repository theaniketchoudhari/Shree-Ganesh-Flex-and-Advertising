
import React, { useState } from 'react';
import { PersonalTransaction } from '../types';

interface PersonalViewProps {
  transactions: PersonalTransaction[];
  onAdd: (t: PersonalTransaction) => void;
  onDelete: (id: string) => void;
}

const PersonalView: React.FC<PersonalViewProps> = ({ transactions, onAdd, onDelete }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [amount, setAmount] = useState<number>(0);
  const [desc, setDesc] = useState('');
  const [cat, setCat] = useState('Personal Expense');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !desc) return;
    onAdd({
      id: Math.random().toString(36).substr(2, 9),
      amount,
      description: desc,
      category: cat,
      date: new Date().toLocaleDateString()
    });
    setAmount(0);
    setDesc('');
    setShowAdd(false);
  };

  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-gray-800 tracking-tight">Personal Activity</h2>
          <p className="text-sm text-gray-400 font-bold">Private expense and transaction logging</p>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center shadow-lg shadow-indigo-100 transition-all"
        >
          <i className={`fas ${showAdd ? 'fa-times' : 'fa-plus'} mr-2`}></i>
          {showAdd ? 'Cancel' : 'Add Activity'}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="bg-white p-6 rounded-2xl shadow-xl border border-indigo-100 grid grid-cols-1 md:grid-cols-4 gap-4 animate-slide-up">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Activity Description</label>
            <input 
              type="text" 
              className="w-full bg-white border border-gray-200 rounded-lg p-2.5 focus:border-indigo-500 outline-none text-slate-900 font-medium"
              placeholder="e.g. Personal tea, Fuel, etc."
              value={desc}
              onChange={e => setDesc(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Category</label>
            <select 
              className="w-full bg-white border border-gray-200 rounded-lg p-2.5 focus:border-indigo-500 outline-none text-slate-900 font-medium"
              value={cat}
              onChange={e => setCat(e.target.value)}
            >
              <option>Personal Expense</option>
              <option>Savings</option>
              <option>Family</option>
              <option>Other Activity</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Amount (₹)</label>
            <div className="flex gap-2">
              <input 
                type="number" 
                className="w-full bg-white border border-gray-200 rounded-lg p-2.5 font-bold text-slate-900"
                value={amount}
                onChange={e => setAmount(parseFloat(e.target.value) || 0)}
                required
              />
              <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold">
                <i className="fas fa-check"></i>
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-indigo-600 p-8 rounded-[40px] text-white shadow-xl shadow-indigo-100 flex flex-col justify-center">
          <p className="text-xs font-black uppercase tracking-widest opacity-60 mb-2">Total Personal Activity Value</p>
          <h4 className="text-4xl font-black">₹{totalSpent.toLocaleString('en-IN')}</h4>
          <p className="text-[10px] mt-4 font-bold uppercase opacity-40">Separate from business finance</p>
        </div>

        <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-2 overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Recent Activity</h3>
            <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-1 rounded font-bold uppercase tracking-tighter">Private Log</span>
          </div>
          <div className="overflow-y-auto max-h-[300px] thin-scrollbar">
            {transactions.length === 0 ? (
              <div className="py-20 text-center text-gray-300">
                <i className="fas fa-user-shield text-3xl mb-3 opacity-20 block"></i>
                Log your personal activities here.
              </div>
            ) : (
              <table className="w-full text-left">
                <tbody className="divide-y divide-gray-50">
                  {transactions.map(t => (
                    <tr key={t.id} className="hover:bg-gray-50 group">
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-gray-800">{t.description}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded uppercase font-bold">{t.category}</span>
                          <span className="text-[9px] text-gray-400">{t.date}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-black text-slate-900">
                        ₹{t.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => onDelete(t.id)}
                          className="text-gray-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <i className="fas fa-trash-alt text-xs"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalView;
