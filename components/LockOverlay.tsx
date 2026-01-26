
import React, { useState } from 'react';

interface LockOverlayProps {
  onActivate: (success: boolean) => void;
  pendingKey: string;
}

/**
 * SHREE GANESH ULTRA-SECURE ACTIVATION v7.0
 * 
 * DEVELOPER SECRET FORMULA (Aniket Choudhari):
 * 1. Get 5-char ID from customer.
 * 2. Reverse the string.
 * 3. Move the character at index 0 to index 2 (The middle).
 * 4. Add "-SG249" to the end.
 * 
 * EXAMPLE:
 * ID: A1B2C 
 * -> Reverse: C2B1A 
 * -> Shift 'C' to middle: 2B C 1A 
 * -> Key: 2BC1A-SG249
 */

const LockOverlay: React.FC<LockOverlayProps> = ({ onActivate, pendingKey }) => {
  const [keyInput, setKeyInput] = useState('');
  const [error, setError] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  // The New Complex Scramble Logic
  const getRequiredKey = (id: string) => {
    // 1. Reverse
    const reversed = id.split('').reverse();
    // 2. Move index 0 to index 2
    const firstChar = reversed.shift(); // Remove first
    if (firstChar) {
      reversed.splice(2, 0, firstChar); // Insert at 3rd position
    }
    const scrambled = reversed.join('');
    // 3. Add Suffix
    return `${scrambled}-SG249`.toUpperCase();
  };

  const handleUnlock = () => {
    const expected = getRequiredKey(pendingKey);
    if (keyInput.trim().toUpperCase() === expected) {
      onActivate(true);
      alert("Verification Successful! Your license has been extended by 30 days.");
    } else {
      setError("Invalid License Key. Verification Failed.");
      setTimeout(() => setError(''), 4000);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(pendingKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRequestKey = () => {
    setIsProcessing(true);
    const developerNumber = '9960967852';
    
    const message = `*LICENSE RENEWAL REQUEST*%0A%0AHello Aniket, I am using the Shree Ganesh Flex Software. My trial has ended. I have paid ₹249.%0A%0A*My System ID:* ${pendingKey}%0A%0APlease verify my payment and send the Activation Key.`;

    setTimeout(() => {
      window.open(`https://wa.me/91${developerNumber}?text=${message}`, '_blank');
      setIsProcessing(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-slate-950 z-[100] flex items-center justify-center p-6 text-center animate-fade-in">
      {/* Premium Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-orange-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-red-600/20 rounded-full blur-[120px]"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5"></div>
      </div>

      <div className="max-w-md w-full bg-white rounded-[60px] p-10 shadow-2xl animate-slide-up border border-slate-200 relative">
        <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-orange-600 via-red-500 to-orange-600"></div>
        
        <div className="w-16 h-16 bg-slate-900 text-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl -rotate-3">
          <i className="fas fa-lock text-2xl"></i>
        </div>
        
        <h2 className="text-2xl font-black text-slate-900 mb-1 tracking-tight">System Locked</h2>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mb-8">Premium Activation Required</p>
        
        <div className="space-y-4 mb-8">
          {/* Payment Info Section */}
          <div className="bg-slate-900 text-white rounded-[30px] p-6 shadow-inner relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <i className="fas fa-bolt text-4xl group-hover:scale-110 transition-transform"></i>
            </div>
            <p className="text-[9px] font-black text-orange-400 uppercase tracking-widest mb-1">Pay ₹249 via PhonePe / GPay / Paytm</p>
            <div className="text-2xl font-black tracking-widest text-white mb-1">9960967852</div>
            <p className="text-[10px] font-bold text-slate-400">Owner: Aniket Choudhari</p>
          </div>

          {/* ID Section */}
          <div className="w-full bg-slate-50 border-2 border-slate-100 rounded-[30px] p-5 text-center relative group">
             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Your Unique System ID</p>
             <div className="text-xl font-black text-slate-800 tracking-[0.2em]">{pendingKey}</div>
             <button 
                onClick={copyToClipboard}
                className="mt-2 text-[9px] font-black text-orange-500 hover:text-orange-600 uppercase flex items-center gap-2 mx-auto"
             >
                <i className={`fas ${copied ? 'fa-check-circle text-green-500' : 'fa-copy'}`}></i>
                {copied ? 'Copied' : 'Copy ID'}
             </button>
          </div>
        </div>

        {!showKeyInput ? (
          <div className="space-y-3">
            <button 
              onClick={handleRequestKey}
              disabled={isProcessing}
              className={`flex items-center justify-center w-full py-5 rounded-[28px] font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 ${
                isProcessing 
                ? 'bg-slate-100 text-slate-300' 
                : 'bg-green-500 hover:bg-green-600 text-white shadow-green-100'
              }`}
            >
              {isProcessing ? (
                <i className="fas fa-sync animate-spin"></i>
              ) : (
                <>
                  <i className="fab fa-whatsapp text-xl mr-2"></i>
                  Send Payment Screenshot
                </>
              )}
            </button>
            <button 
              onClick={() => setShowKeyInput(true)}
              className="w-full py-2 text-slate-400 hover:text-slate-900 font-black text-[8px] uppercase tracking-[0.3em] transition-all"
            >
              I have received my key
            </button>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
            <div className="relative">
              <input 
                type="text" 
                placeholder="ENTER ACTIVATION KEY"
                className={`w-full border-2 rounded-[28px] px-6 py-5 outline-none font-black text-center text-lg uppercase tracking-widest transition-all ${
                  error ? 'border-red-500 bg-red-50 text-red-600' : 'border-slate-100 focus:border-slate-900 bg-slate-50 text-slate-800'
                }`}
                value={keyInput}
                onChange={e => setKeyInput(e.target.value)}
              />
              {error && (
                <p className="text-[9px] font-black text-red-500 uppercase mt-2">{error}</p>
              )}
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setShowKeyInput(false)}
                className="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-[9px] uppercase tracking-widest"
              >
                Back
              </button>
              <button 
                onClick={handleUnlock}
                className="flex-[2] py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-lg shadow-orange-100"
              >
                Activate System
              </button>
            </div>
          </div>
        )}

        <div className="mt-10 pt-6 border-t border-slate-50">
          <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest">
            Secure Payment Gateway • Verified License
          </p>
        </div>
      </div>
    </div>
  );
};

export default LockOverlay;
