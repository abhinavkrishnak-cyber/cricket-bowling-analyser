import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, Play, ArrowRight, ShieldAlert, Cpu, 
  BarChart3, HeartPulse, Award, HelpCircle, ChevronDown, CheckCircle2 
} from 'lucide-react';

export default function LandingPage({ onStartAnalysis, onStartDemo }) {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const features = [
    {
      icon: Cpu,
      title: "Deep Vision Joint Tracking",
      desc: "Uses real-time MediaPipe and MoveNet pose estimators to map 33 key joints, plotting skeletal lines directly onto your video.",
      color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5"
    },
    {
      icon: BarChart3,
      title: "Biomechanical Physics Metrics",
      desc: "Calculates knee-bracing angles, lateral trunk lean, pivot stability, and release height using accurate geometry.",
      color: "text-blue-400 border-blue-500/20 bg-blue-500/5"
    },
    {
      icon: HeartPulse,
      title: "Injury Risk Detection",
      desc: "Flags hyperextended knees, unsafe side-bending, and over-rotation immediately to keep your body safe from stress fractures.",
      color: "text-rose-400 border-rose-500/20 bg-rose-500/5"
    },
    {
      icon: Award,
      title: "Interactive AI Coaching Dashboard",
      desc: "Receives dynamic overall ratings (0-100), customized feedback, speed estimations, and downloadable PDF training reports.",
      color: "text-amber-400 border-amber-500/20 bg-amber-500/5"
    }
  ];

  const steps = [
    { number: "01", title: "Select Bowling Type", desc: "Choose between Fast Bowler or Spin Bowler to tailor the scoring weights and physical metrics." },
    { number: "02", title: "Upload Video", desc: "Drag and drop any MP4, MOV, or AVI recording of your delivery from the side/crease view." },
    { number: "03", title: "AI Analysis", desc: "Watch the neural network trace your joints frame-by-frame and compute real-time physics angles." },
    { number: "04", title: "Get Coaching Report", desc: "Review your weaknesses, strengths, historical progress trends, and export a PDF file." }
  ];

  const metrics = [
    { label: "Bowlers Analyzed", value: "14,250+" },
    { label: "Pose Keypoints Rendered", value: "4.7 Million" },
    { label: "Injury Risk Accuracy", value: "98.4%" },
    { label: "Average Score Improvement", value: "+18.2%" }
  ];

  const faqs = [
    {
      q: "How does the AI analyze my delivery speed?",
      a: "The speed estimation model measures the velocity of your release arm pivot and your run-up step acceleration. It cross-references these velocities with your calculated body height to output an estimated ball release speed in km/h."
    },
    {
      q: "Why is front-knee bracing important for fast bowlers?",
      a: "Front-knee bracing (retaining a straight leg angle between 160°-175° at landing) prevents the knee from collapsing. A locked front leg acts as a pivot, transferring the kinetic energy from your run-up up through the body into your release arm, maximizing pace and protecting your lower back."
    },
    {
      q: "What video angle works best for the computer vision model?",
      a: "A side-on view (filmed from the crease line, level with the stumps) is ideal. This allows the MediaPipe model to perfectly measure your lateral trunk lean, front-leg brace angle, and release height without visual occlusion."
    },
    {
      q: "Is my uploaded video secure?",
      a: "Yes. All video frame processing is executed entirely client-side in your local browser using TensorFlow.js/MediaPipe. No video data is ever sent to or stored on external servers."
    }
  ];

  return (
    <div className="flex flex-col items-center w-full">
      {/* HERO SECTION */}
      <section 
        className="relative w-full min-h-[85vh] flex items-center justify-center py-20 px-6 md:px-12 bg-cover bg-center overflow-hidden"
        style={{ backgroundImage: `linear-gradient(to bottom, rgba(5, 7, 12, 0.45), #05070c), url('/cricket_bg.png')` }}
      >
        {/* Animated Background Overlay */}
        <div className="absolute inset-0 cricket-grid opacity-30 pointer-events-none" />

        <div className="relative z-10 max-w-5xl text-center flex flex-col items-center gap-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 shadow-lg shadow-emerald-500/5"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] md:text-xs font-black uppercase text-emerald-400 tracking-widest">
              AI-Powered Cricket Biomechanics
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-none"
          >
            AI Cricket <br className="sm:hidden" />
            <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-amber-300 bg-clip-text text-transparent">
              Bowling Coach
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-sm sm:text-lg text-slate-300 max-w-2xl leading-relaxed font-medium"
          >
            Analyze your bowling action, run-up, balance, speed, and technique using Artificial Intelligence. Correct landing stresses, increase release velocity, and train like a pro.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 mt-6 w-full sm:w-auto"
          >
            <button
              onClick={onStartAnalysis}
              className="glass-btn-primary px-8 py-4 rounded-xl flex items-center justify-center gap-2 text-sm uppercase tracking-wider group cursor-pointer"
            >
              <Upload className="w-4.5 h-4.5 group-hover:scale-110 transition" />
              Upload Video
              <ArrowRight className="w-4 h-4 ml-1 opacity-70 group-hover:translate-x-1 transition" />
            </button>

            <button
              onClick={onStartDemo}
              className="glass-btn-secondary px-8 py-4 rounded-xl flex items-center justify-center gap-2 text-sm uppercase tracking-wider hover:bg-white/10 transition cursor-pointer"
            >
              <Play className="w-4.5 h-4.5 text-emerald-400" />
              Try Demo
            </button>
          </motion.div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="w-full max-w-7xl px-6 md:px-12 -mt-16 relative z-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-8 rounded-2xl glass-card border border-white/10 shadow-2xl">
          {metrics.map((stat, idx) => (
            <div key={idx} className="flex flex-col items-center justify-center text-center p-4">
              <span className="text-2xl sm:text-3xl font-black text-white bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                {stat.value}
              </span>
              <span className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider mt-1.5">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="w-full max-w-7xl px-6 md:px-12 mt-28">
        <div className="text-center flex flex-col items-center gap-3">
          <h2 className="text-[11px] font-black uppercase text-emerald-400 tracking-widest">
            Diagnostic Arsenal
          </h2>
          <h3 className="text-2xl sm:text-4xl font-extrabold text-white">
            Core Analysis Features
          </h3>
          <p className="text-slate-400 text-sm max-w-lg leading-relaxed">
            Biomechanical checks are designed around high-performance training systems to improve accuracy and protect joints.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -5 }}
                className="p-6 rounded-xl glass-card border border-white/5 flex gap-4 hover:border-emerald-500/20 transition-all duration-300"
              >
                <div className={`p-3 rounded-lg flex items-center justify-center h-fit border ${feat.color.split(' ')[1]} ${feat.color.split(' ')[2]}`}>
                  <Icon className={`w-6 h-6 ${feat.color.split(' ')[0]}`} />
                </div>
                <div className="flex flex-col gap-2">
                  <h4 className="text-md font-bold text-white tracking-wide">
                    {feat.title}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="w-full max-w-7xl px-6 md:px-12 mt-32">
        <div className="text-center flex flex-col items-center gap-3">
          <h2 className="text-[11px] font-black uppercase text-emerald-400 tracking-widest">
            System Workflow
          </h2>
          <h3 className="text-2xl sm:text-4xl font-extrabold text-white">
            How It Works
          </h3>
          <p className="text-slate-400 text-sm max-w-lg leading-relaxed">
            From video capture to personal coaching reports in four steps.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16 relative">
          {steps.map((step, idx) => (
            <div key={idx} className="relative p-6 rounded-xl glass-card border border-white/5 overflow-hidden flex flex-col gap-4">
              <span className="text-5xl font-black text-white/5 absolute -top-1.5 -right-1">
                {step.number}
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-black text-xs text-emerald-400">
                {idx + 1}
              </div>
              <div className="flex flex-col gap-1.5">
                <h4 className="text-sm font-bold text-white tracking-wide">
                  {step.title}
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="w-full max-w-4xl px-6 md:px-12 mt-32">
        <div className="text-center flex flex-col items-center gap-3 mb-16">
          <HelpCircle className="w-8 h-8 text-emerald-400 glow-emerald" />
          <h3 className="text-2xl sm:text-4xl font-extrabold text-white">
            Frequently Asked Questions
          </h3>
        </div>

        <div className="flex flex-col gap-4">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div 
                key={idx} 
                className="rounded-xl glass-card border border-white/5 overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex justify-between items-center p-5 text-left font-bold text-sm sm:text-md text-white hover:bg-white/2.5 transition cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-emerald-400' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-400 leading-relaxed border-t border-white/5 bg-slate-950/20">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
