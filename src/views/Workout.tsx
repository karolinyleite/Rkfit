import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, Footprints, Bike, Flame, Clock, Plus } from 'lucide-react';
import { useNutrition } from '../context/NutritionContext';

export const WorkoutView: React.FC = () => {
  const { addLog } = useNutrition();
  const [duration, setDuration] = useState<number>(30);
  const [selectedActivity, setSelectedActivity] = useState<string>('cardio');
  const [caloriesBurned, setCaloriesBurned] = useState<number>(300);

  const activities = [
    { id: 'cardio', label: 'Cardio', icon: Flame, baseBurn: 10 },
    { id: 'weights', label: 'Weights', icon: Dumbbell, baseBurn: 6 },
    { id: 'walking', label: 'Walking', icon: Footprints, baseBurn: 4 },
    { id: 'cycling', label: 'Cycling', icon: Bike, baseBurn: 8 },
  ];

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDuration = parseInt(e.target.value) || 0;
    setDuration(newDuration);
    calculateBurn(selectedActivity, newDuration);
  };

  const calculateBurn = (activityId: string, mins: number) => {
    const activity = activities.find(a => a.id === activityId);
    if (activity) {
      setCaloriesBurned(activity.baseBurn * mins);
    }
  };

  const handleActivitySelect = (id: string) => {
    setSelectedActivity(id);
    calculateBurn(id, duration);
  };

  const handleLogWorkout = () => {
    const activity = activities.find(a => a.id === selectedActivity);
    if (activity) {
      addLog({
        type: 'exercise',
        name: `${activity.label} Session`,
        calories: caloriesBurned,
      });
      // Reset or show success
      setDuration(30);
      setCaloriesBurned(activity.baseBurn * 30);
    }
  };

  return (
    <div className="p-6 pt-12 pb-32 space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-white mb-2">Log Activity</h1>
        <p className="text-slate-400">Track your sweat equity.</p>
      </header>

      {/* Activity Selector */}
      <div className="grid grid-cols-2 gap-4">
        {activities.map((activity) => {
          const Icon = activity.icon;
          const isSelected = selectedActivity === activity.id;
          
          return (
            <motion.button
              key={activity.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleActivitySelect(activity.id)}
              className={`relative p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center gap-3 h-32 ${
                isSelected 
                  ? 'bg-purple-600/20 border-purple-500 shadow-[0_0_20px_rgba(139,92,246,0.3)]' 
                  : 'bg-slate-800/50 border-white/5 hover:bg-slate-800'
              }`}
            >
              <div className={`p-3 rounded-full ${isSelected ? 'bg-purple-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                <Icon size={24} />
              </div>
              <span className={`font-medium ${isSelected ? 'text-purple-300' : 'text-slate-400'}`}>
                {activity.label}
              </span>
              
              {isSelected && (
                <motion.div 
                  layoutId="selected-ring"
                  className="absolute inset-0 border-2 border-purple-500 rounded-2xl"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Calculator */}
      <div className="bg-slate-800/50 backdrop-blur-md rounded-3xl p-6 border border-white/5">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3 text-slate-300">
            <Clock size={20} />
            <span className="font-medium">Duration</span>
          </div>
          <div className="flex items-baseline gap-1">
            <input 
              type="number" 
              value={duration}
              onChange={handleDurationChange}
              className="bg-transparent text-right text-4xl font-bold text-white w-24 focus:outline-none border-b border-slate-600 focus:border-purple-500 transition-colors"
            />
            <span className="text-slate-500 font-medium">min</span>
          </div>
        </div>

        <div className="h-px bg-slate-700 w-full mb-8" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-slate-300">
            <Flame size={20} className="text-orange-500" />
            <span className="font-medium">Est. Burn</span>
          </div>
          <div className="text-right">
            <span className="block text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-purple-500">
              {caloriesBurned}
            </span>
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Calories</span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleLogWorkout}
        className="w-full py-5 bg-purple-600 hover:bg-purple-500 rounded-2xl font-bold text-white shadow-[0_0_30px_rgba(139,92,246,0.4)] flex items-center justify-center gap-3 transition-colors"
      >
        <Plus size={24} />
        Log Workout
      </motion.button>
    </div>
  );
};
