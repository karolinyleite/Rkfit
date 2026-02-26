import React from 'react';
import { Home, Scan, Dumbbell, TrendingUp, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'scanner', icon: Scan, label: 'Scan' },
    { id: 'workout', icon: Dumbbell, label: 'Workout' },
    { id: 'progress', icon: TrendingUp, label: 'Progress' },
    { id: 'partner', icon: Users, label: 'Partner' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-emerald-500/30">
      <div className="max-w-md mx-auto min-h-screen relative flex flex-col bg-slate-950 shadow-2xl overflow-hidden">
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto pb-24 scrollbar-hide">
          {children}
        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl border-t border-white/5" />
          <div className="relative flex justify-around items-center h-20 px-2">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="relative flex flex-col items-center justify-center w-16 h-16 group"
                >
                  {isActive && (
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-emerald-500/20 to-transparent rounded-xl"
                    />
                  )}
                  
                  <Icon 
                    size={24} 
                    className={cn(
                      "transition-all duration-300 mb-1",
                      isActive ? "text-emerald-400 scale-110 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" : "text-slate-400 group-hover:text-slate-200"
                    )} 
                  />
                  <span className={cn(
                    "text-[10px] font-medium transition-colors duration-300",
                    isActive ? "text-emerald-400" : "text-slate-500"
                  )}>
                    {tab.label}
                  </span>
                  
                  {isActive && (
                    <div
                      className="absolute bottom-1 w-1 h-1 bg-emerald-400 rounded-full"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
};
