import React from 'react';
import { Shield, ShieldAlert, Cpu } from 'lucide-react';

export default function Footer({ setActiveTab }) {
  return (
    <footer className="w-full mt-24 border-t border-white/5 bg-slate-950/40 py-12 px-6 md:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Brand */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center font-black text-white text-xs">
              S
            </div>
            <span className="font-extrabold text-white tracking-wide">
              STRIKE<span className="text-emerald-400">AI</span> COACH
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
            Real-time biometric video analysis using client-side deep neural networks. Built for professional bowlers, academy coaches, and cricket enthusiasts.
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-col gap-2">
          <h4 className="text-xs uppercase font-extrabold text-slate-200 tracking-wider">
            Quick Actions
          </h4>
          <div className="flex flex-col gap-2.5 mt-1">
            <button 
              onClick={() => setActiveTab('home')} 
              className="text-left text-xs text-slate-400 hover:text-emerald-400 transition"
            >
              Home Page
            </button>
            <button 
              onClick={() => setActiveTab('analyze')} 
              className="text-left text-xs text-slate-400 hover:text-emerald-400 transition"
            >
              Analyze Bowling Action
            </button>
            <button 
              onClick={() => setActiveTab('history')} 
              className="text-left text-xs text-slate-400 hover:text-emerald-400 transition"
            >
              Historical Sessions
            </button>
          </div>
        </div>

        {/* Technology */}
        <div className="flex flex-col gap-2">
          <h4 className="text-xs uppercase font-extrabold text-slate-200 tracking-wider">
            Technology Suite
          </h4>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold text-slate-300 bg-white/5 rounded-md border border-white/5">
              <Cpu className="w-3 h-3 text-emerald-400" />
              MediaPipe Pose
            </span>
            <span className="px-2.5 py-1 text-[10px] font-semibold text-slate-300 bg-white/5 rounded-md border border-white/5">
              React 19 & Tailwind v4
            </span>
            <span className="px-2.5 py-1 text-[10px] font-semibold text-slate-300 bg-white/5 rounded-md border border-white/5">
              Framer Motion
            </span>
            <span className="px-2.5 py-1 text-[10px] font-semibold text-slate-300 bg-white/5 rounded-md border border-white/5">
              Recharts API
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 flex items-center gap-1">
            <Shield className="w-3.5 h-3.5" /> Data is stored locally in your browser and local server storage.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-[11px] text-slate-500">
          © {new Date().getFullYear()} StrikeAI Cricket Coach. All rights reserved.
        </p>
        <div className="flex gap-4">
          <a href="#" className="text-[11px] text-slate-500 hover:text-slate-300 transition">Privacy Policy</a>
          <a href="#" className="text-[11px] text-slate-500 hover:text-slate-300 transition">Terms of Service</a>
          <a href="#" className="text-[11px] text-slate-500 hover:text-slate-300 transition">Coaching Licenses</a>
        </div>
      </div>
    </footer>
  );
}
