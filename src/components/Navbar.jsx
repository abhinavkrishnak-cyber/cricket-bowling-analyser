import React from 'react';
import { Trophy, Activity, History, Home, TrendingUp } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'analyze', label: 'Analyze Action', icon: Activity },
    { id: 'history', label: 'Session History', icon: History }
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/5 py-4 px-6 md:px-12 flex justify-between items-center">
      {/* Brand Logo */}
      <div 
        className="flex items-center gap-2.5 cursor-pointer"
        onClick={() => setActiveTab('home')}
      >
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/25">
          <Trophy className="w-5.5 h-5.5 text-white" />
          <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-amber-400 rounded-full border border-slate-900 animate-pulse" />
        </div>
        <div>
          <h1 className="font-extrabold text-lg leading-tight tracking-wide text-white flex items-center gap-1.5">
            STRIKE<span className="text-emerald-400">AI</span>
          </h1>
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest leading-none">
            Bowling Coach
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex items-center gap-1 md:gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all duration-300 ${
                isActive 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-inner' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Beta Tag */}
      <div className="hidden lg:flex items-center gap-2">
        <span className="px-2 py-0.5 text-[10px] font-black tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
          v1.0 ACTIVE
        </span>
      </div>
    </header>
  );
}
