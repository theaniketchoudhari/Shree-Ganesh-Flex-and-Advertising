import React from 'react';
import { signInWithGoogle } from '../services/firebase';

const Login: React.FC = () => {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-[#0F172A] font-sans">
      <div className="max-w-md w-full p-10 bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl text-center space-y-8">
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 bg-orange-600 rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-orange-900/50">
            <i className="fas fa-print text-3xl text-white"></i>
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tighter">SHREE GANESH ERP</h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">Centralized Business Intelligence</p>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-slate-400 text-sm">Sign in to access your dashboard, invoices, and analytics from any device securely.</p>
          <button 
            onClick={signInWithGoogle}
            className="w-full bg-white hover:bg-slate-100 text-[#0F172A] font-black uppercase tracking-widest py-5 rounded-2xl flex items-center justify-center gap-4 transition-all group active:scale-95"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
            Sign in with Google
          </button>
        </div>

        <div className="pt-4 border-t border-slate-800">
          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">Secure Cloud Layer v8.0</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
