import React, { useState } from 'react';
import { Bill, BillItem, Service } from '../types';

interface BillingViewProps {
  services: Service[];
  onSave: (bill: Bill) => void;
  onAddService: (service: Service) => void;
  onDeleteService: (id: string) => void;
}

const BillingView: React.FC<BillingViewProps> = ({ services, onSave, onAddService, onDeleteService }) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedItems, setSelectedItems] = useState<BillItem[]>([]);
  const [notes, setNotes] = useState('');
  const [showAddService, setShowAddService] = useState(false);
  const [newService, setNewService] = useState({ name: '', rate: 0, cat: 'sqft' as 'sqft' | 'unit' });

  const addServiceToBill = (service: Service) => {
    const newItem: BillItem = {
      id: Math.random().toString(36).substr(2, 9),
      serviceId: service.id,
      serviceName: service.name,
      width: service.category === 'sqft' ? 1 : 0,
      height: service.category === 'sqft' ? 1 : 0,
      sqft: service.category === 'sqft' ? 1 : 0,
      rate: service.defaultRate,
      quantity: 1,
      amount: service.defaultRate,
      status: 'Pending',
    };
    setSelectedItems(prev => [...prev, newItem]);
  };

  const updateItem = (id: string, updates: Partial<BillItem>) => {
    setSelectedItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, ...updates };
      
      const s = services.find(srv => srv.id === updated.serviceId);
      if (s?.category === 'sqft') {
        updated.sqft = updated.width * updated.height;
        updated.amount = updated.sqft * updated.rate * updated.quantity;
      } else {
        updated.amount = updated.rate * updated.quantity;
      }
      return updated;
    }));
  };

  const removeItem = (id: string) => setSelectedItems(prev => prev.filter(i => i.id !== id));
  const totalAmount = selectedItems.reduce((sum, item) => sum + item.amount, 0);

  const handleSave = () => {
    if (!customerName || selectedItems.length === 0) {
      alert("Required: Customer Name and at least one item.");
      return;
    }
    const newBill: Bill = {
      id: `INV-${Date.now()}`,
      customerName,
      customerPhone,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      items: selectedItems,
      totalAmount,
      status: 'Pending',
      notes
    };
    onSave(newBill);
    setCustomerName('');
    setCustomerPhone('');
    setSelectedItems([]);
    setNotes('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
      {/* Sidebar: Services */}
      <div className="lg:col-span-3 space-y-6">
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 h-fit">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-black text-slate-800 text-xs uppercase tracking-widest flex items-center">
              <span className="w-1.5 h-4 bg-orange-600 rounded-full mr-2"></span>
              Inventory
            </h3>
            <button 
              onClick={() => setShowAddService(!showAddService)}
              className="w-8 h-8 flex items-center justify-center bg-slate-900 text-white rounded-full hover:bg-orange-600 transition-colors shadow-lg shadow-slate-200"
            >
              <i className={`fas ${showAddService ? 'fa-times' : 'fa-plus'} text-[10px]`}></i>
            </button>
          </div>

          {showAddService && (
            <div className="mb-6 p-4 bg-orange-50/50 rounded-3xl border border-orange-100 space-y-3">
              <input 
                placeholder="Job Type" 
                className="w-full p-3 text-xs rounded-2xl border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-orange-500 outline-none"
                value={newService.name}
                onChange={e => setNewService({...newService, name: e.target.value})}
              />
              <div className="flex gap-2">
                <input 
                  type="number" 
                  placeholder="Rate" 
                  className="w-1/2 p-3 text-xs rounded-2xl border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-orange-500 outline-none font-bold"
                  onChange={e => setNewService({...newService, rate: parseFloat(e.target.value) || 0})}
                />
                <select 
                  className="w-1/2 p-3 text-xs rounded-2xl border-none ring-1 ring-slate-200 outline-none"
                  value={newService.cat}
                  onChange={e => setNewService({...newService, cat: e.target.value as any})}
                >
                  <option value="sqft">Sqft</option>
                  <option value="unit">Unit</option>
                </select>
              </div>
              <button 
                onClick={() => {
                  onAddService({ id: Date.now().toString(), name: newService.name, defaultRate: newService.rate, category: newService.cat });
                  setShowAddService(false);
                }}
                className="w-full py-3 bg-slate-900 text-white text-[10px] font-black rounded-2xl hover:bg-black uppercase tracking-widest"
              >
                Add to List
              </button>
            </div>
          )}

          <div className="space-y-2 max-h-[50vh] overflow-y-auto thin-scrollbar pr-2">
            {services.map(s => (
              <div key={s.id} className="flex group bg-slate-50 hover:bg-white rounded-2xl border border-transparent hover:border-orange-200 transition-all overflow-hidden">
                <button
                  onClick={() => addServiceToBill(s)}
                  className="flex-1 text-left p-4"
                >
                  <div className="text-sm font-bold text-slate-700 mb-1">{s.name}</div>
                  <div className="text-[9px] font-black text-orange-600 bg-orange-100 w-fit px-2 py-0.5 rounded-full uppercase">₹{s.defaultRate} / {s.category}</div>
                </button>
                <button onClick={() => onDeleteService(s.id)} className="px-3 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all">
                  <i className="fas fa-trash-alt text-[10px]"></i>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main: Invoice Generator */}
      <div className="lg:col-span-9 space-y-6">
        <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
            <div className="flex-1 space-y-5 w-full">
              <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">New Invoice</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Client Identity</label>
                  <input
                    type="text"
                    placeholder="Enter Customer Name"
                    className="w-full bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-orange-500 rounded-3xl px-6 py-4 outline-none font-bold text-slate-800 transition-all"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">WhatsApp Contact</label>
                  <input
                    type="text"
                    placeholder="e.g. 9876543210"
                    className="w-full bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-orange-500 rounded-3xl px-6 py-4 outline-none font-bold text-slate-800 transition-all"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto -mx-10 px-10">
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  <th className="pb-4 px-2">Description</th>
                  <th className="pb-4 px-2">Specifications</th>
                  <th className="pb-4 px-2 text-center">Net Area</th>
                  <th className="pb-4 px-2 text-center">Rate</th>
                  <th className="pb-4 px-2 text-center">Qty</th>
                  <th className="pb-4 px-2 text-right">Subtotal</th>
                  <th className="pb-4 px-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {selectedItems.map(item => {
                  const s = services.find(sv => sv.id === item.serviceId);
                  const isSqft = s?.category === 'sqft';
                  return (
                    <tr key={item.id} className="group hover:bg-slate-50/50 transition-all">
                      <td className="py-6 px-2">
                        <div className="font-bold text-slate-800">{item.serviceName}</div>
                      </td>
                      <td className="py-6 px-2">
                        {isSqft && (
                          <div className="flex items-center gap-2">
                            <input 
                              type="number" 
                              className="w-16 bg-white ring-1 ring-slate-200 focus:ring-2 focus:ring-orange-500 rounded-xl px-2 py-2 text-xs font-black text-center outline-none"
                              value={item.width}
                              onChange={e => updateItem(item.id, { width: parseFloat(e.target.value) || 0 })}
                            />
                            <span className="text-slate-300 font-black text-[10px]">×</span>
                            <input 
                              type="number" 
                              className="w-16 bg-white ring-1 ring-slate-200 focus:ring-2 focus:ring-orange-500 rounded-xl px-2 py-2 text-xs font-black text-center outline-none"
                              value={item.height}
                              onChange={e => updateItem(item.id, { height: parseFloat(e.target.value) || 0 })}
                            />
                          </div>
                        )}
                      </td>
                      <td className="py-6 px-2 text-center">
                        <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                          {isSqft ? `${item.sqft.toFixed(2)} ft²` : 'Fixed Unit'}
                        </span>
                      </td>
                      <td className="py-6 px-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-[10px] text-slate-300 font-bold">₹</span>
                          <input 
                            type="number" 
                            className="w-20 bg-white ring-1 ring-orange-100 focus:ring-2 focus:ring-orange-500 rounded-xl px-2 py-2 text-xs text-center font-black text-orange-600 outline-none"
                            value={item.rate}
                            onChange={e => updateItem(item.id, { rate: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                      </td>
                      <td className="py-6 px-2 text-center">
                        <input 
                          type="number" 
                          className="w-14 bg-white ring-1 ring-slate-200 focus:ring-2 focus:ring-orange-500 rounded-xl px-2 py-2 text-xs text-center font-black outline-none"
                          value={item.quantity}
                          onChange={e => updateItem(item.id, { quantity: parseInt(e.target.value) || 1 })}
                        />
                      </td>
                      <td className="py-6 px-2 text-right font-black text-slate-900">
                        ₹{item.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-6 px-2 text-right">
                        <button onClick={() => removeItem(item.id)} className="w-8 h-8 flex items-center justify-center text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-full transition-all">
                          <i className="fas fa-times"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-12 pt-10 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Job Instructions</label>
              <textarea
                className="w-full bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-orange-500 rounded-[2.5rem] p-6 text-sm outline-none text-slate-700 min-h-[140px] transition-all"
                placeholder="Specific flex quality, eyelets, frame type..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>
            <div className="bg-slate-900 p-10 rounded-[3rem] text-white flex flex-col justify-between shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                 <i className="fas fa-file-invoice-dollar text-7xl -rotate-12"></i>
              </div>
              <div className="mb-8">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 block mb-2">Total Amount Due</span>
                <span className="text-5xl font-black text-orange-500 tracking-tighter">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
              <button 
                onClick={handleSave}
                disabled={selectedItems.length === 0}
                className="w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xl active:scale-95"
              >
                Generate Bill
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingView;