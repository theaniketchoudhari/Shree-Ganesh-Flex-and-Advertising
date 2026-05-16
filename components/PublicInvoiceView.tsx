import React, { useEffect } from 'react';
import { Bill } from '../types';

interface PublicInvoiceViewProps {
  bill: Bill;
}

const PublicInvoiceView: React.FC<PublicInvoiceViewProps> = ({ bill }) => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('print') === 'true') {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, []);

  const printInvoice = () => {
    window.print();
  };

  const balanceAmt = (bill.totalAmount || 0) - (bill.receivedAmount || 0);

  return (
    <div className="min-h-screen bg-slate-100 py-12 px-4 print:bg-white print:py-0 print:px-0">
      {/* Container for Invoice */}
      <div className="max-w-[800px] mx-auto bg-white shadow-2xl overflow-hidden print:shadow-none print:w-full font-serif text-[#4a0404]">
        
        {/* Header Section */}
        <div className="relative border-b-4 border-[#4a0404] p-6">
           <div className="flex justify-between items-start">
              <div className="flex gap-4">
                 <div className="w-20 h-20 bg-[#4a0404] text-white flex items-center justify-center text-5xl font-bold rounded-xl">
                    G
                 </div>
                 <div className="flex flex-col">
                    <h1 className="text-4xl font-black italic leading-none" style={{ fontFamily: 'serif' }}>श्री Ganesh Flex</h1>
                    <p className="text-[10px] font-bold mt-1">All Type Of painting Solution</p>
                    <div className="flex gap-1 mt-1">
                       {[1,2,3,4].map(i => <div key={i} className="w-2 h-2 rounded-full bg-[#4a0404] opacity-40"></div>)}
                    </div>
                 </div>
              </div>
              <div className="flex flex-col items-end">
                 <div className="bg-[#4a0404] text-white px-6 py-2 rounded-full flex items-center gap-3 mb-2">
                    <i className="fas fa-phone-alt text-sm"></i>
                    <span className="text-lg font-bold">8530858572 / 7447808572</span>
                 </div>
                 <ul className="text-[10px] font-bold text-right grid grid-cols-2 gap-x-4">
                    <li>• Urgent Flex Printing</li>
                    <li>• Hordings</li>
                    <li>• Way Bord Fitting</li>
                    <li>• Vinly Printing</li>
                    <li>• Visiting Card</li>
                    <li>• One Way Vision</li>
                    <li>• Industrial Printing</li>
                    <li>• Offset Printing</li>
                 </ul>
              </div>
           </div>

           <div className="mt-4 bg-[#4a0404] text-white text-center py-1.5 rounded-full text-[11px] font-bold flex items-center justify-center gap-2">
              <i className="fas fa-map-marker-alt"></i>
              Address - A/p Pabal, Opp. ST Bus Stand, Tal - Shirur, Dist - Pune - 412 220
           </div>
        </div>

        {/* Info Section */}
        <div className="p-8 space-y-4">
           <div className="flex justify-between border-b border-[#4a0404]/20 pb-2">
              <div className="flex gap-2">
                 <span className="font-bold">Bill No. :</span>
                 <span className="border-b border-dotted border-[#4a0404] min-w-[100px]">{bill.id}</span>
              </div>
              <div className="flex gap-2">
                 <span className="font-bold">Date :</span>
                 <span className="border-b border-dotted border-[#4a0404] min-w-[150px]">{bill.date}</span>
              </div>
           </div>
           <div className="flex gap-2 border-b border-[#4a0404]/20 pb-2">
              <span className="font-bold">Name :</span>
              <span className="flex-1 border-b border-dotted border-[#4a0404] font-bold">{bill.customerName}</span>
           </div>
           <div className="flex gap-2 border-b border-[#4a0404]/20 pb-2">
              <span className="font-bold">Address :</span>
              <span className="flex-1 border-b border-dotted border-[#4a0404]">{bill.customerAddress || '-'}</span>
           </div>
        </div>

        {/* Table Section */}
        <div className="px-8 pb-8">
           <table className="w-full border-2 border-[#4a0404] text-center border-collapse">
              <thead>
                 <tr className="border-b-2 border-[#4a0404] font-bold text-sm">
                    <th className="border-r-2 border-[#4a0404] py-2 w-12">Sr. No.</th>
                    <th className="border-r-2 border-[#4a0404] py-2">Particulars</th>
                    <th className="border-r-2 border-[#4a0404] py-2 w-16">QTY.</th>
                    <th className="border-r-2 border-[#4a0404] py-2 w-20">Total Sqft.</th>
                    <th className="border-r-2 border-[#4a0404] py-2 w-20">Sqft. Rate</th>
                    <th className="py-2 w-24">Amount</th>
                 </tr>
              </thead>
              <tbody>
                 {bill.items.map((item, index) => (
                    <tr key={item.id} className="text-sm">
                       <td className="border-r-2 border-[#4a0404] py-3">{index + 1}</td>
                       <td className="border-r-2 border-[#4a0404] py-3 px-4 text-left font-bold">{item.serviceName}</td>
                       <td className="border-r-2 border-[#4a0404] py-3">{item.quantity}</td>
                       <td className="border-r-2 border-[#4a0404] py-3">{item.sqft > 0 ? item.sqft.toFixed(2) : '-'}</td>
                       <td className="border-r-2 border-[#4a0404] py-3">{item.rate}</td>
                       <td className="py-3 font-bold">{item.amount.toLocaleString('en-IN')}</td>
                    </tr>
                 ))}
                 {/* Empty rows to maintain height */}
                 {Array.from({ length: Math.max(0, 8 - bill.items.length) }).map((_, i) => (
                    <tr key={`empty-${i}`} className="h-10">
                       <td className="border-r-2 border-[#4a0404]"></td>
                       <td className="border-r-2 border-[#4a0404]"></td>
                       <td className="border-r-2 border-[#4a0404]"></td>
                       <td className="border-r-2 border-[#4a0404]"></td>
                       <td className="border-r-2 border-[#4a0404]"></td>
                       <td></td>
                    </tr>
                 ))}
              </tbody>
              <tfoot className="border-t-2 border-[#4a0404] font-bold">
                 <tr>
                    <td colSpan={4} rowSpan={3} className="border-r-2 border-[#4a0404] p-4 text-left align-bottom">
                       <p className="text-xs">Flex printing will not be done unless</p>
                       <p className="text-sm font-black">100% advance is paid.</p>
                       <p className="text-[10px]">(१००% अॅडव्हान्स दिल्याशिवाय फ्लेक्स फिटिंग केला जाणार नाही.)</p>
                    </td>
                    <td className="border-r-2 border-[#4a0404] border-b-2 py-1 text-sm">Total</td>
                    <td className="border-b-2 py-1 text-sm font-black">₹{bill.totalAmount.toLocaleString('en-IN')}</td>
                 </tr>
                 <tr>
                    <td className="border-r-2 border-[#4a0404] border-b-2 py-1 text-sm">Advance</td>
                    <td className="border-b-2 py-1 text-sm font-black">₹{bill.receivedAmount.toLocaleString('en-IN')}</td>
                 </tr>
                 <tr>
                    <td className="border-r-2 border-[#4a0404] py-1 text-sm">Balance Amt.</td>
                    <td className="py-1 text-sm font-black">₹{balanceAmt.toLocaleString('en-IN')}</td>
                 </tr>
              </tfoot>
           </table>
        </div>

        {/* Signatory Section */}
        <div className="px-8 pb-12 flex justify-end">
           <div className="text-center">
              <div className="w-48 border-b border-[#4a0404]"></div>
              <p className="text-sm font-black mt-2">For For,</p>
              <p className="text-sm font-black">Shri Ganesh Flex</p>
           </div>
        </div>

        <style>{`
          @media print {
            @page {
              size: auto;
              margin: 10mm;
            }
            body {
              background: white;
            }
            .print\\:hidden {
              display: none !important;
            }
            /* A4 support */
            .max-w-\\[800px\\] {
              max-width: 100% !important;
              width: 100% !important;
              box-shadow: none !important;
              margin: 0 !important;
            }
            /* Thermal Printer Adjustments (approx 80mm) */
            @page thermal {
              size: 80mm auto;
              margin: 2mm;
            }
            .thermal-print {
              width: 80mm !important;
              font-size: 10px !important;
            }
          }
        `}</style>
      </div>

      {/* Floating Action Buttons (Hidden on Print) */}
      <div className="max-w-[800px] mx-auto mt-8 flex justify-center gap-4 print:hidden">
         <button 
           onClick={printInvoice}
           className="px-10 py-4 bg-[#4a0404] text-white font-black rounded-2xl shadow-xl hover:scale-105 transition-all flex items-center gap-3"
         >
           <i className="fas fa-print"></i>
           Print Invoice
         </button>
         <button 
           onClick={() => window.location.href = '/'}
           className="px-10 py-4 bg-white text-[#4a0404] border-2 border-[#4a0404] font-black rounded-2xl shadow-xl hover:scale-105 transition-all"
         >
           Back to Dashboard
         </button>
      </div>
    </div>
  );
};

export default PublicInvoiceView;
