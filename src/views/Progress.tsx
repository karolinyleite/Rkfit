import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingDown, Target, Scale, Activity } from 'lucide-react';
import { useNutrition } from '../context/NutritionContext';

const data = [
  { name: 'Jan 1', weight: 82.5 },
  { name: 'Jan 8', weight: 81.8 },
  { name: 'Jan 15', weight: 81.2 },
  { name: 'Jan 22', weight: 80.5 },
  { name: 'Jan 29', weight: 79.8 },
  { name: 'Feb 5', weight: 79.2 },
  { name: 'Feb 12', weight: 78.5 },
];

export const ProgressView: React.FC = () => {
  const { userStats, updateWeight } = useNutrition();

  return (
    <div className="p-6 pt-12 pb-32 space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-white mb-2">Progress</h1>
        <p className="text-slate-400">Your journey so far.</p>
      </header>

      {/* Chart */}
      <div className="bg-slate-800/50 backdrop-blur-md rounded-3xl p-6 border border-white/5 h-80 relative">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <TrendingDown size={20} className="text-emerald-500" />
          Weight Trend
        </h2>
        <ResponsiveContainer width="100%" height="85%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} domain={['dataMin - 1', 'dataMax + 1']} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
              itemStyle={{ color: '#10b981' }}
            />
            <Line 
              type="monotone" 
              dataKey="weight" 
              stroke="#10b981" 
              strokeWidth={3} 
              dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }} 
              activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Log Weight Input */}
      <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Scale size={24} className="text-purple-400" />
          <span className="font-medium text-slate-300">Log Today's Weight</span>
        </div>
        <div className="flex items-center gap-2">
          <input 
            type="number" 
            defaultValue={userStats.weight}
            className="bg-transparent text-right text-2xl font-bold text-white w-20 focus:outline-none border-b border-slate-600 focus:border-purple-500 transition-colors"
            onBlur={(e) => updateWeight(parseFloat(e.target.value))}
          />
          <span className="text-slate-500 font-bold text-sm">kg</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800/30 rounded-2xl p-4 border border-white/5">
          <div className="flex items-center gap-2 mb-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
            <Target size={14} /> Goal Weight
          </div>
          <p className="text-2xl font-bold text-white">{userStats.goalWeight} <span className="text-sm text-slate-500">kg</span></p>
        </div>
        <div className="bg-slate-800/30 rounded-2xl p-4 border border-white/5">
          <div className="flex items-center gap-2 mb-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
            <Activity size={14} /> Total Lost
          </div>
          <p className="text-2xl font-bold text-emerald-400">-4.0 <span className="text-sm text-slate-500">kg</span></p>
        </div>
      </div>

      {/* Milestone Roadmap */}
      <div className="bg-gradient-to-br from-purple-900/40 to-slate-900 rounded-3xl p-6 border border-purple-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Target size={120} />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Next Milestone</h3>
        <p className="text-purple-200 text-sm mb-6">Only 2kg until you reach your "Wedding Ready" goal!</p>
        
        <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '75%' }}
            transition={{ duration: 1.5, delay: 0.5 }}
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-pink-500"
          />
        </div>
        <div className="flex justify-between text-xs font-bold text-slate-400 mt-2">
          <span>Start</span>
          <span className="text-white">75%</span>
          <span>Goal</span>
        </div>
      </div>
    </div>
  );
};
