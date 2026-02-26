import React from 'react';
import { motion } from 'framer-motion';
import { Users, Trophy, Flame, Utensils, Heart } from 'lucide-react';
import { useNutrition } from '../context/NutritionContext';

export const PartnerView: React.FC = () => {
  const { userStats, partnerStats } = useNutrition();

  const userCaloriePercent = Math.min(100, (userStats.caloriesConsumed / userStats.dailyCalorieGoal) * 100);
  const partnerCaloriePercent = partnerStats.caloriesPercent;

  return (
    <div className="p-6 pt-12 pb-32 space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Duo Mode</h1>
          <p className="text-slate-400 text-sm">You vs {partnerStats.name}</p>
        </div>
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-2 rounded-full shadow-[0_0_15px_rgba(236,72,153,0.4)]">
          <Heart className="text-white fill-white animate-pulse" size={20} />
        </div>
      </header>

      {/* Comparison Rings */}
      <div className="relative flex justify-center items-center py-8">
        <div className="relative w-72 h-72 flex items-center justify-center">
          {/* User Ring (Outer) */}
          <svg className="absolute inset-0 w-full h-full transform -rotate-90">
            <circle cx="144" cy="144" r="130" stroke="#1e293b" strokeWidth="12" fill="transparent" />
            <motion.circle
              initial={{ strokeDasharray: "0 1000" }}
              animate={{ strokeDasharray: `${userCaloriePercent * 8.16} 1000` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              cx="144" cy="144" r="130"
              stroke="#10b981" strokeWidth="12" fill="transparent" strokeLinecap="round"
              className="drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
            />
          </svg>
          
          {/* Partner Ring (Inner) */}
          <svg className="absolute inset-0 w-full h-full transform -rotate-90 scale-75">
            <circle cx="144" cy="144" r="130" stroke="#1e293b" strokeWidth="16" fill="transparent" />
            <motion.circle
              initial={{ strokeDasharray: "0 1000" }}
              animate={{ strokeDasharray: `${partnerCaloriePercent * 8.16} 1000` }}
              transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
              cx="144" cy="144" r="130"
              stroke="#8b5cf6" strokeWidth="16" fill="transparent" strokeLinecap="round"
              className="drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]"
            />
          </svg>

          {/* Center Avatar */}
          <div className="relative z-10">
            <div className="w-20 h-20 rounded-full bg-slate-800 border-4 border-slate-900 overflow-hidden shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" 
                alt="Partner" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-purple-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-slate-900 shadow-sm">
              {partnerStats.name}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">You</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-500" />
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">{partnerStats.name}</span>
        </div>
      </div>

      {/* Shared Goals */}
      <div className="bg-slate-800/40 backdrop-blur-md rounded-3xl p-6 border border-white/5">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-bold flex items-center gap-2">
            <Trophy className="text-yellow-500" size={18} />
            Weekly Challenge
          </h3>
          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Ends in 2d</span>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-300">{partnerStats.weeklyGoal.label}</span>
              <span className="text-white font-bold">{partnerStats.weeklyGoal.current}/{partnerStats.weeklyGoal.total}</span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(partnerStats.weeklyGoal.current / partnerStats.weeklyGoal.total) * 100}%` }}
                className="h-full bg-gradient-to-r from-yellow-400 to-orange-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-2xl border border-white/5">
            <div className="flex items-center gap-3">
              <div className="bg-red-500/20 p-2 rounded-lg text-red-400">
                <Utensils size={20} />
              </div>
              <div>
                <p className="text-white font-bold text-sm">Junk Food Free</p>
                <p className="text-slate-400 text-xs">Shared Streak</p>
              </div>
            </div>
            <div className="text-right">
              <span className="block text-2xl font-bold text-white">{partnerStats.junkFoodFreeDays}</span>
              <span className="text-slate-500 text-[10px] uppercase font-bold">Days</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
