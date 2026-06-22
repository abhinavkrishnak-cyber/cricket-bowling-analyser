import React from 'react';
import { motion } from 'framer-motion';
import { 
  History, Calendar, Trophy, ChevronRight, 
  Trash2, TrendingUp, BarChart2, Star 
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export default function HistoryPage({ historyData, onViewSession, onDeleteSession }) {
  // Sort history data to show newest first for the list
  const sortedSessions = [...historyData].sort((a, b) => new Date(b.date) - new Date(a.date));

  // Format historical progression for chart (showing chronological order)
  const chartData = [...historyData]
    .reverse()
    .map((sess, idx) => ({
      name: `Sess ${idx + 1}`,
      score: sess.overallScore,
      speed: sess.metrics.speed,
      date: new Date(sess.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }));

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-6 md:px-12 py-10 flex flex-col gap-8">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <History className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-white">Performance History</h2>
            <p className="text-xs text-slate-400">Track your progress and load historical coaching reports.</p>
          </div>
        </div>

        <div className="px-4 py-2 bg-slate-900/60 border border-white/5 rounded-xl text-center">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Sessions</span>
          <h4 className="text-lg font-black text-white">{historyData.length} Analyzed</h4>
        </div>
      </div>

      {historyData.length === 0 ? (
        <div className="w-full py-20 flex flex-col items-center justify-center text-center rounded-2xl glass-card border border-white/5 gap-4">
          <History className="w-12 h-12 text-slate-600 animate-pulse" />
          <div>
            <h4 className="text-md font-bold text-white">No session history detected</h4>
            <p className="text-xs text-slate-500 max-w-sm mt-1 leading-relaxed">
              Run your first video analysis to compile diagnostic metrics and start tracking your bowling progression.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* PROGRESS CHART */}
          <div className="lg:col-span-8 rounded-2xl glass-card border border-white/5 p-6 flex flex-col gap-4">
            <h4 className="font-extrabold text-white text-sm uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Historical Score Progression
            </h4>

            <div className="h-64 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: 9 }} />
                  <YAxis stroke="#64748b" domain={[0, 100]} style={{ fontSize: 9 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.08)', borderRadius: 8 }}
                    labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                    itemStyle={{ color: '#10b981' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#10b981" 
                    strokeWidth={2.5}
                    fillOpacity={1} 
                    fill="url(#colorScore)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* SIDE PANEL: PERFORMANCE HIGHLIGHT */}
          <div className="lg:col-span-4 rounded-2xl glass-card border border-white/5 p-6 flex flex-col gap-5 text-xs">
            <h4 className="font-extrabold text-white text-sm uppercase tracking-wider flex items-center gap-2">
              <Star className="w-4 h-4 text-emerald-400" />
              Peak Performance
            </h4>

            {(() => {
              const bestSession = [...historyData].sort((a, b) => b.overallScore - a.overallScore)[0];
              return (
                <div className="flex flex-col gap-4">
                  <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex flex-col gap-2">
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Best Overall Session</span>
                    <h5 className="text-md font-extrabold text-white">{bestSession.bowlerName}</h5>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-slate-400">Score Rating:</span>
                      <span className="text-emerald-400 font-black text-sm">{bestSession.overallScore}/100</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Recorded Speed:</span>
                      <span className="text-white font-bold">{bestSession.metrics.speed} km/h</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/20 border border-white/5 flex flex-col gap-2">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Average Session Score</span>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Comp. Average:</span>
                      <span className="text-white font-extrabold">
                        {Math.round(historyData.reduce((acc, s) => acc + s.overallScore, 0) / historyData.length)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* SESSION GRID LIST */}
          <div className="lg:col-span-12 flex flex-col gap-4">
            <h4 className="font-extrabold text-white text-sm uppercase tracking-wider mt-4">
              Historical Sessions Log
            </h4>

            <div className="flex flex-col gap-3">
              {sortedSessions.map((session) => {
                const isFast = session.bowlingType === 'fast';
                return (
                  <motion.div
                    key={session.id}
                    whileHover={{ scale: 1.005 }}
                    className="p-4 rounded-xl glass-card border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-emerald-500/15 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-lg border ${
                        isFast 
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                          : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                      }`}>
                        <BarChart2 className="w-5 h-5" />
                      </div>
                      
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <h5 className="font-extrabold text-white text-sm">{session.bowlerName}</h5>
                          <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                            isFast ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'
                          }`}>
                            {isFast ? 'Fast' : 'Spin'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{formatDate(session.date)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                      <div className="flex gap-6 items-center">
                        <div className="text-right flex flex-col gap-0.5">
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Overall Score</span>
                          <span className="text-sm font-black text-white">{session.overallScore}%</span>
                        </div>

                        <div className="text-right flex flex-col gap-0.5">
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Recorded Pace</span>
                          <span className="text-sm font-bold text-slate-300">{session.metrics.speed} km/h</span>
                        </div>

                        <div className="text-right flex flex-col gap-0.5">
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Injury Risk</span>
                          <span className={`text-[10px] font-extrabold ${
                            session.injuryRisk === 'high' ? 'text-rose-400' : session.injuryRisk === 'medium' ? 'text-amber-400' : 'text-emerald-400'
                          }`}>
                            {session.injuryRisk.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2.5">
                        <button
                          onClick={() => onViewSession(session)}
                          className="px-3.5 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[11px] font-bold rounded-lg border border-emerald-500/20 hover:border-emerald-500/40 transition flex items-center gap-1 cursor-pointer"
                        >
                          View Session
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onDeleteSession(session.id)}
                          className="p-2 bg-white/2.5 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 rounded-lg border border-white/5 hover:border-rose-500/20 transition cursor-pointer"
                          title="Delete Session"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                  </motion.div>
                );
              })}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
