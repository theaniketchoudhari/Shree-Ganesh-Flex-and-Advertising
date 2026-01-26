
import React, { useState } from 'react';
import { Bill } from '../types';
import { generateReminderMessage } from '../services/geminiService';

interface HistoryViewProps {
  bills: Bill[];
  onUpdateItemStatus: (billId: string, itemId: string, status: 'Pending' | 'Paid') => void;
  onDelete: (id: string) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ bills, onUpdateItemStatus, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredBills = bills.filter(bill => 
    bill.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (bill.customerPhone && bill.customerPhone.includes(searchTerm)) ||
    bill.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleWhatsApp = async (bill: Bill) => {
    if (!bill.customerPhone) {
      alert("No phone number found for this customer.");
      return;
    }
    setSendingId(bill.id);
    const message = await generateReminderMessage(bill);
    setSendingId(null);
    const encodedMsg = encodeURIComponent(message);
    const phone = bill.customerPhone.replace(/\D/g, '');
    window.open(`https://wa.me/${phone.startsWith('91') ? phone : '91' + phone}?text=${encodedMsg}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-black text-gray-800 tracking-tight">Sales Records</h2>
        <div className="relative w-full md:w-96">
          <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
          <input
            type="text"
            placeholder="Search customer, phone, ID..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none bg-white text-slate-900 font-medium"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Client & Date</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Billing Info</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Payment Status</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredBills.map(bill => (
                <React.Fragment key={bill.id}>
                  <tr className="hover:bg-gray-50/30 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => setExpandedId(expandedId === bill.id ? null : bill.id)}
                          className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-all flex items-center justify-center"
                        >
                          <i className={`fas ${expandedId === bill.id ? 'fa-chevron-up' : 'fa-chevron-down'} text-[10px]`}></i>
                        </button>
                        <div>
                          <div className="text-sm font-black text-gray-900">{bill.customerName}</div>
                          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center mt-0.5">
                            {bill.date} • {bill.time}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-lg font-black text-slate-800">₹{bill.totalAmount.toLocaleString('en-IN')}</div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                         {bill.items.filter(i => i.status === 'Paid').length} / {bill.items.length} Jobs Paid
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className={`inline-flex px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                          bill.status === 'Paid' 
                            ? 'bg-green-50 text-green-700 border-green-200' 
                            : 'bg-orange-50 text-orange-700 border-orange-200'
                        }`}
                      >
                        {bill.status === 'Paid' ? 'Complete' : 'Pending Payment'}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end space-x-2">
                        {bill.status === 'Pending' && (
                          <button
                            onClick={() => handleWhatsApp(bill)}
                            disabled={sendingId === bill.id}
                            className="p-3 text-green-600 bg-green-50 hover:bg-green-100 rounded-xl disabled:opacity-50"
                          >
                            <i className={`fab fa-whatsapp ${sendingId === bill.id ? 'animate-spin' : ''}`}></i>
                          </button>
                        )}
                        <button
                          onClick={() => onDelete(bill.id)}
                          className="p-3 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  
                  {expandedId === bill.id && (
                    <tr className="bg-slate-50/50">
                      <td colSpan={4} className="px-10 py-6">
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-inner overflow-hidden">
                          <table className="w-full text-left">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Job Service</th>
                                <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Specifications</th>
                                <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Amount</th>
                                <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Item Payment Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                              {bill.items.map((item, idx) => (
                                <tr key={item.id + idx} className="text-xs">
                                  <td className="px-4 py-4 font-bold text-slate-700">{item.serviceName}</td>
                                  <td className="px-4 py-4 text-center">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase">
                                      {item.width > 0 ? `${item.width}x${item.height} (${item.sqft.toFixed(1)}ft²)` : 'Unit Based'}
                                      <span className="mx-2">•</span>
                                      Qty: {item.quantity}
                                    </span>
                                  </td>
                                  <td className="px-4 py-4 text-center font-black text-slate-900">₹{item.amount.toLocaleString('en-IN')}</td>
                                  <td className="px-4 py-4 text-right">
                                    <button 
                                      onClick={() => onUpdateItemStatus(bill.id, item.id, item.status === 'Paid' ? 'Pending' : 'Paid')}
                                      className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                                        item.status === 'Paid' 
                                          ? 'bg-green-500 text-white shadow-lg shadow-green-100' 
                                          : 'bg-slate-100 text-slate-400 hover:bg-orange-50 hover:text-orange-500'
                                      }`}
                                    >
                                      {item.status === 'Paid' ? <><i className="fas fa-check-circle mr-1"></i> Paid</> : 'Mark Paid'}
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {bill.notes && (
                            <div className="p-4 bg-orange-50/30 border-t border-slate-100">
                              <p className="text-[9px] font-black text-orange-600 uppercase tracking-widest mb-1">Office Remark</p>
                              <p className="text-xs text-slate-600 italic">"{bill.notes}"</p>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        {filteredBills.length === 0 && (
          <div className="py-32 text-center text-gray-300">
            <i className="fas fa-folder-open text-6xl mb-4 block opacity-10"></i>
            <span className="text-sm font-black uppercase tracking-widest">No matching records found</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryView;
