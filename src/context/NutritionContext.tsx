import React, { createContext, useContext, useState, useEffect } from 'react';
import { format } from 'date-fns';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

export type Macro = 'protein' | 'carbs' | 'fats';

export interface LogEntry {
  id: string;
  type: 'meal' | 'exercise';
  name: string;
  calories: number;
  macros?: {
    protein: number;
    carbs: number;
    fats: number;
  };
  time: string;
  prepMethod?: string; // For AI scan results
}

export interface UserStats {
  weight: number;
  goalWeight: number;
  dailyCalorieGoal: number;
  caloriesConsumed: number;
  caloriesBurned: number;
  macros: {
    protein: { current: number; goal: number };
    carbs: { current: number; goal: number };
    fats: { current: number; goal: number };
  };
  streak: number;
  junkFoodFreeDays: number;
}

interface NutritionContextType {
  userStats: UserStats;
  logs: LogEntry[];
  addLog: (entry: Omit<LogEntry, 'id' | 'time'>) => void;
  updateWeight: (weight: number) => void;
  partnerStats: {
    name: string;
    caloriesPercent: number;
    workoutPercent: number;
    junkFoodFreeDays: number;
    weeklyGoal: { current: number; total: number; label: string };
  };
}

const NutritionContext = createContext<NutritionContextType | undefined>(undefined);

export const useNutrition = () => {
  const context = useContext(NutritionContext);
  if (!context) {
    throw new Error('useNutrition must be used within a NutritionProvider');
  }
  return context;
};

export const NutritionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  
  const [userStats, setUserStats] = useState<UserStats>({
    weight: 78.5,
    goalWeight: 72.0,
    dailyCalorieGoal: 2200,
    caloriesConsumed: 0,
    caloriesBurned: 0,
    macros: {
      protein: { current: 0, goal: 180 },
      carbs: { current: 0, goal: 220 },
      fats: { current: 0, goal: 70 },
    },
    streak: 0,
    junkFoodFreeDays: 0,
  });

  const [logs, setLogs] = useState<LogEntry[]>([]);

  const [partnerStats] = useState({
    name: 'Sarah',
    caloriesPercent: 85,
    workoutPercent: 60,
    junkFoodFreeDays: 5,
    weeklyGoal: { current: 2, total: 4, label: 'Home-cooked meals' },
  });

  // Fetch initial data
  useEffect(() => {
    if (!user) return;

    fetch('/api/user/data')
      .then(res => res.json())
      .then(data => {
        if (data.stats) {
          // Calculate consumed/burned from logs (simplified for prototype)
          let consumed = 0;
          let burned = 0;
          let protein = 0;
          let carbs = 0;
          let fats = 0;

          data.logs.forEach((log: any) => {
            if (log.type === 'meal') {
              consumed += log.calories;
              protein += log.protein || 0;
              carbs += log.carbs || 0;
              fats += log.fats || 0;
            } else {
              burned += log.calories;
            }
          });

          setUserStats(prev => ({
            ...prev,
            weight: data.stats.weight,
            goalWeight: data.stats.goal_weight,
            dailyCalorieGoal: data.stats.daily_calorie_goal,
            streak: data.stats.streak,
            junkFoodFreeDays: data.stats.junk_food_free_days,
            caloriesConsumed: consumed,
            caloriesBurned: burned,
            macros: {
              protein: { ...prev.macros.protein, current: protein },
              carbs: { ...prev.macros.carbs, current: carbs },
              fats: { ...prev.macros.fats, current: fats },
            }
          }));
          
          // Map DB logs to UI logs
          setLogs(data.logs.map((log: any) => ({
            id: log.id,
            type: log.type,
            name: log.name,
            calories: log.calories,
            macros: { protein: log.protein, carbs: log.carbs, fats: log.fats },
            time: log.time,
            prepMethod: log.prep_method
          })));
        }
      });
  }, [user]);

  // Socket.io Connection
  useEffect(() => {
    if (!user) return;

    const newSocket = io();
    setSocket(newSocket);

    newSocket.emit('join_user', user.id);

    newSocket.on('log_added', (newLog: any) => {
      // Optimistically update if it's our own log, but here we just listen
      // In a real app, we might filter out our own if we already added it optimistically
      // For simplicity, we'll just re-fetch or append if ID doesn't exist
      setLogs(prev => {
        if (prev.find(l => l.id === newLog.id)) return prev;
        return [newLog, ...prev];
      });
      
      // Update stats based on new log
      setUserStats(prev => {
        const newStats = { ...prev };
        if (newLog.type === 'meal') {
          newStats.caloriesConsumed += newLog.calories;
          if (newLog.macros) {
            newStats.macros.protein.current += newLog.macros.protein || 0;
            newStats.macros.carbs.current += newLog.macros.carbs || 0;
            newStats.macros.fats.current += newLog.macros.fats || 0;
          }
        } else {
          newStats.caloriesBurned += newLog.calories;
        }
        return newStats;
      });
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const addLog = async (entry: Omit<LogEntry, 'id' | 'time'>) => {
    const newLog: LogEntry = {
      ...entry,
      id: Math.random().toString(36).substr(2, 9),
      time: format(new Date(), 'hh:mm a'),
    };

    // Optimistic update
    setLogs((prev) => [newLog, ...prev]);
    setUserStats((prev) => {
      const newStats = { ...prev };
      if (entry.type === 'meal') {
        newStats.caloriesConsumed += entry.calories;
        if (entry.macros) {
          newStats.macros.protein.current += entry.macros.protein;
          newStats.macros.carbs.current += entry.macros.carbs;
          newStats.macros.fats.current += entry.macros.fats;
        }
      } else {
        newStats.caloriesBurned += entry.calories;
      }
      return newStats;
    });

    // API Call
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLog),
      });
    } catch (error) {
      console.error('Failed to save log', error);
      // Revert optimistic update if needed (omitted for brevity)
    }
  };

  const updateWeight = async (weight: number) => {
    setUserStats((prev) => ({ ...prev, weight }));
    try {
      await fetch('/api/user/weight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weight }),
      });
    } catch (error) {
      console.error('Failed to update weight', error);
    }
  };

  return (
    <NutritionContext.Provider value={{ userStats, logs, addLog, updateWeight, partnerStats }}>
      {children}
    </NutritionContext.Provider>
  );
};
