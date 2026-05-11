import React from 'react';
import { Bill } from '../types';

interface PublicInvoiceViewProps {
  bill: Bill;
}

const PublicInvoiceView: React.FC<PublicInvoiceViewProps> = ({ bill }) => {
  const printInvoice = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8 print:bg-white print:py-0 print:px-0">
      <div className="max-w-4xl mx-auto bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 print:shadow-none print:border-none print:rounded-none">
        {/* Invoice Header */}
        <div className="bg-slate-900 px-10 py-12 text-white flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden print:bg-white print:text-slate-900 print:px-0 print:py-8">
          <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none print:hidden">
            <i className="fas fa-file-invoice-dollar text-[120px] -rotate-12"></i>
          </div>
          
          <div className="flex items-center gap-6 z-10">
            <div className="w-16 h-16 bg-orange-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-orange-900/50 print:bg-orange-600 print:shadow-none">
              <i className="fas fa-print text-2xl"></i>
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter uppercase leading-none mb-1">Shree Ganesh</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] print:text-slate-500">Flex & Advertising Hub</p>
            </div>
          </div>

          <div className="text-center md:text-right z-10">
            <div className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em] mb-2">Tax Invoice</div>
            <div className="text-4xl font-black tracking-tighter mb-1">{bill.id}</div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{bill.date} • {bill.time}</div>
          </div>
        </div>

        {/* Client & Status Section */}
        <div className="px-10 py-10 border-b border-slate-50 grid grid-cols-1 md:grid-cols-2 gap-10 print:px-0">
          <div className="space-y-4">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Billed To</div>
            <div>
              <div className="text-2xl font-black text-slate-900 mb-1">{bill.customerName}</div>
              <div className="text-sm font-bold text-slate-500 flex items-center gap-2">
                <i className="fas fa-phone-alt text-orange-500 text-[10px]"></i>
                {bill.customerPhone}
              </div>
            </div>
          </div>

          <div className="space-y-4 md:text-right">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Payment Status</div>
            <div>
              <div className={`inline-flex px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest border ${
                bill.status === 'Paid' 
                  ? 'bg-green-50 text-green-700 border-green-200' 
                  : 'bg-orange-50 text-orange-700 border-orange-200'
              }`}>
                {bill.status === 'Paid' ? 'Payment Completed' : 'Payment Pending'}
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Items Table */}
        <div className="px-10 py-8 print:px-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  <th className="pb-4">Job Description</th>
                  <th className="pb-4 text-center">Specs</th>
                  <th className="pb-4 text-center">Rate</th>
                  <th className="pb-4 text-center">Qty</th>
                  <th className="pb-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {bill.items.map((item, idx) => (
                  <tr key={item.id + idx}>
                    <td className="py-6">
                      <div className="font-black text-slate-800">{item.serviceName}</div>
                      <div className={`text-[9px] font-bold uppercase mt-1 ${item.status === 'Paid' ? 'text-green-500' : 'text-orange-500'}`}>
                         {item.status}
                      </div>
                    </td>
                    <td className="py-6 text-center">
                      <div className="text-[11px] font-bold text-slate-500">
                        {item.width > 0 ? `${item.width}x${item.height}` : 'Unit'}
                        {item.sqft > 0 && <span className="block text-[9px] text-slate-400">{item.sqft.toFixed(2)} ft²</span>}
                      </div>
                    </td>
                    <td className="py-6 text-center text-xs font-bold text-slate-600">₹{item.rate.toLocaleString('en-IN')}</td>
                    <td className="py-6 text-center text-xs font-bold text-slate-600">{item.quantity}</td>
                    <td className="py-6 text-right font-black text-slate-900">₹{item.amount.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals & Notes */}
        <div className="px-10 py-12 bg-slate-50 grid grid-cols-1 md:grid-cols-2 gap-10 print:bg-white print:px-0">
          <div className="space-y-4">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Notes & Instructions</div>
            <p className="text-sm text-slate-600 italic leading-relaxed">
              {bill.notes || 'No specific instructions provided for this invoice.'}
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-center text-slate-500 text-sm font-bold">
              <span>Subtotal</span>
              <span>₹{bill.totalAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center text-slate-500 text-sm font-bold">
              <span>Tax (GST 0%)</span>
              <span>₹0</span>
            </div>
            <div className="pt-6 border-t border-slate-200 flex justify-between items-center">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Total Amount</span>
              <span className="text-4xl font-black text-orange-600">₹{bill.totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-10 py-10 text-center border-t border-slate-50 print:px-0">
          <p className="text-xs font-bold text-slate-400 mb-6">Thank you for your business! Reach out for any questions.</p>
          <div className="flex flex-wrap justify-center gap-4 print:hidden">
            <button 
              onClick={printInvoice}
              className="px-8 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-black transition-all flex items-center gap-2"
            >
              <i className="fas fa-print"></i> Download PDF / Print
            </button>
            <button 
              onClick={() => window.location.href = '/'}
              className="px-8 py-3 bg-white border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all"
            >
              Back to Website
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-12 text-center text-slate-400 text-[10px] font-black uppercase tracking-[0.5em] print:hidden">
        Secure Digital Invoice • Shree Ganesh ERP
      </div>
    </div>
  );
};

export default PublicInvoiceView;
