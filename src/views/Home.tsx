import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Plus, ChevronRight, Activity, Utensils } from 'lucide-react';
import { useNutrition } from '../context/NutritionContext';
import { format } from 'date-fns';

export const HomeView: React.FC = () => {
  const { userStats, logs } = useNutrition();
  
  const calorieGoal = userStats.dailyCalorieGoal;
  const caloriesConsumed = userStats.caloriesConsumed;
  const caloriesBurned = userStats.caloriesBurned;
  const netCalories = caloriesConsumed - caloriesBurned;
  const remaining = calorieGoal - netCalories;
  const progress = Math.min(100, Math.max(0, (netCalories / calorieGoal) * 100));
  
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="p-6 space-y-8 pt-12 pb-32">
      {/* Header */}
      <header className="flex justify-between items-start">
        <div>
          <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">
            {format(new Date(), 'EEEE, MMM do')}
          </p>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Hello, Alex
          </h1>
        </div>
        <div className="flex items-center space-x-2 bg-slate-800/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.15)]">
          <Flame className="text-orange-500 fill-orange-500 animate-pulse" size={18} />
          <span className="text-orange-100 font-bold text-sm">{userStats.streak} Day Streak</span>
        </div>
      </header>

      {/* Main Calorie Ring */}
      <div className="relative flex justify-center items-center py-4">
        <div className="relative w-64 h-64">
          {/* Background Circle */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="128"
              cy="128"
              r={radius}
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              className="text-slate-800"
            />
            {/* Progress Circle */}
            <motion.circle
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              cx="128"
              cy="128"
              r={radius}
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={circumference}
              strokeLinecap="round"
              className="text-emerald-500 drop-shadow-[0_0_10px_rgba(16,185,129,0.6)]"
            />
          </svg>
          
          {/* Center Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-slate-400 text-sm font-medium mb-1">Remaining</span>
            <span className="text-5xl font-bold text-white tracking-tighter">
              {remaining}
            </span>
            <span className="text-emerald-400 text-xs font-bold mt-1 uppercase tracking-widest">Kcal</span>
          </div>

          {/* Orbiting Particles (Decoration) */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border border-white/5"
          />
           <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute inset-4 rounded-full border border-emerald-500/10 border-dashed"
          />
        </div>
      </div>

      {/* Macros */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Protein', current: userStats.macros.protein.current, total: userStats.macros.protein.goal, color: 'bg-blue-500' },
          { label: 'Carbs', current: userStats.macros.carbs.current, total: userStats.macros.carbs.goal, color: 'bg-emerald-500' },
          { label: 'Fats', current: userStats.macros.fats.current, total: userStats.macros.fats.goal, color: 'bg-purple-500' },
        ].map((macro) => (
          <div key={macro.label} className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-4 border border-white/5 flex flex-col items-center">
            <span className="text-slate-400 text-xs font-medium mb-2">{macro.label}</span>
            <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden mb-2">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(macro.current / macro.total) * 100}%` }}
                className={`h-full ${macro.color} shadow-[0_0_8px_rgba(255,255,255,0.3)]`}
              />
            </div>
            <span className="text-white text-xs font-bold">
              {macro.current} <span className="text-slate-500">/ {macro.total}g</span>
            </span>
          </div>
        ))}
      </div>

      {/* Daily Log Timeline */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-white">Daily Log</h2>
          <button className="text-emerald-400 text-xs font-bold uppercase tracking-wider flex items-center hover:text-emerald-300 transition-colors">
            View All <ChevronRight size={14} />
          </button>
        </div>

        <div className="space-y-3 relative">
          {/* Vertical Line */}
          <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-slate-800" />

          {logs.map((log, index) => (
            <motion.div 
              key={log.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative flex items-center space-x-4 pl-2"
            >
              <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                log.type === 'meal' ? 'bg-slate-900 border-emerald-500/50 text-emerald-400' : 'bg-slate-900 border-purple-500/50 text-purple-400'
              }`}>
                {log.type === 'meal' ? <Utensils size={16} /> : <Activity size={16} />}
              </div>
              
              <div className="flex-1 bg-slate-800/30 backdrop-blur-sm border border-white/5 rounded-xl p-3 hover:bg-slate-800/50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-white font-medium text-sm">{log.name}</h3>
                    <p className="text-slate-500 text-xs mt-0.5">{log.time}</p>
                  </div>
                  <span className={`text-sm font-bold ${log.type === 'meal' ? 'text-white' : 'text-purple-400'}`}>
                    {log.type === 'meal' ? '+' : '-'}{log.calories}
                  </span>
                </div>
                {log.prepMethod && (
                  <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {log.prepMethod}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
