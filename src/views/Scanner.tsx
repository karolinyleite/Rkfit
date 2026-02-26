import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Zap, X, Check, Search, ScanLine, Loader2 } from 'lucide-react';
import { useNutrition } from '../context/NutritionContext';
import { cn } from '../lib/utils';

export const ScannerView: React.FC = () => {
  const { addLog } = useNutrition();
  const [isScanning, setIsScanning] = useState(false);
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'analyzing' | 'result'>('idle');
  const [scanMessage, setScanMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'plate' | 'label' | 'manual'>('plate');
  const timeouts = React.useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    return () => {
      timeouts.current.forEach(clearTimeout);
    };
  }, []);

  const handleScan = () => {
    setScanState('scanning');
    setIsScanning(true);

    // Simulate AI Process
    timeouts.current.push(setTimeout(() => {
      setScanState('analyzing');
      setScanMessage('Initializing Vision AI...');
    }, 1500));

    timeouts.current.push(setTimeout(() => {
      setScanMessage('Analyzing ingredients and portion sizes...');
    }, 3000));

    timeouts.current.push(setTimeout(() => {
      setScanMessage('Detecting preparation method...');
    }, 4500));

    timeouts.current.push(setTimeout(() => {
      setScanState('result');
      setIsScanning(false);
    }, 6000));
  };

  const handleAdd = () => {
    addLog({
      type: 'meal',
      name: 'Grilled Salmon & Asparagus',
      calories: 420,
      macros: { protein: 35, carbs: 8, fats: 22 },
      prepMethod: 'Air Fried: -80 kcal saved!',
    });
    // Reset or navigate away (in a real app)
    setScanState('idle');
  };

  return (
    <div className="relative h-screen bg-black text-white overflow-hidden">
      {/* Camera Viewfinder (Simulated) */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1467003909585-2f8a7270028d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
          alt="Camera Feed" 
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90" />
        
        {/* Grid Overlay */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" 
             style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
        />
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-center">
        <button className="p-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10">
          <X size={20} />
        </button>
        <div className="px-4 py-1 bg-black/60 backdrop-blur-md rounded-full border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          AI Vision Active
        </div>
        <button className="p-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10">
          <Zap size={20} className={isScanning ? "text-yellow-400 fill-yellow-400" : "text-white"} />
        </button>
      </div>

      {/* Scanning Overlay */}
      {(scanState === 'scanning' || scanState === 'analyzing') && (
        <motion.div 
          key="scanning-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none"
        >
          {/* Laser Line */}
          <motion.div 
            animate={{ top: ['10%', '90%', '10%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-0.5 bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.8)]"
          />
          
          {/* Focus Brackets */}
          <div className="relative w-64 h-64 border-2 border-white/20 rounded-3xl">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-500 rounded-tl-xl -mt-1 -ml-1" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-500 rounded-tr-xl -mt-1 -mr-1" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-500 rounded-bl-xl -mb-1 -ml-1" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-500 rounded-br-xl -mb-1 -mr-1" />
            
            {/* Scanning Text */}
            {scanState === 'analyzing' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm rounded-3xl p-4 text-center">
                <Loader2 className="animate-spin text-emerald-500 mb-3" size={32} />
                <p className="text-emerald-400 font-mono text-xs uppercase tracking-widest animate-pulse">
                  {scanMessage}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Result Card */}
      {scanState === 'result' && (
        <motion.div 
          key="result-card"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="absolute bottom-0 left-0 right-0 z-30 bg-slate-900 rounded-t-3xl p-6 pb-24 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-t border-white/10"
        >
          <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto mb-6" />
          
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Grilled Salmon</h2>
              <p className="text-slate-400 text-sm">with Asparagus & Lemon</p>
            </div>
            <div className="text-right">
              <span className="block text-3xl font-bold text-emerald-400">420</span>
              <span className="text-slate-500 text-xs uppercase tracking-wider font-bold">Kcal</span>
            </div>
          </div>

          {/* Smart Badge */}
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 mb-6 flex items-center gap-3">
            <div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-400">
              <Zap size={18} />
            </div>
            <div>
              <p className="text-emerald-400 font-bold text-sm">Cooked in Air Fryer</p>
              <p className="text-emerald-300/70 text-xs">-80 kcal saved vs. pan frying!</p>
            </div>
          </div>

          {/* Macros */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="bg-slate-800 rounded-xl p-3 text-center border border-white/5">
              <span className="block text-slate-400 text-xs mb-1">Protein</span>
              <span className="block text-white font-bold text-lg">35g</span>
            </div>
            <div className="bg-slate-800 rounded-xl p-3 text-center border border-white/5">
              <span className="block text-slate-400 text-xs mb-1">Carbs</span>
              <span className="block text-white font-bold text-lg">8g</span>
            </div>
            <div className="bg-slate-800 rounded-xl p-3 text-center border border-white/5">
              <span className="block text-slate-400 text-xs mb-1">Fats</span>
              <span className="block text-white font-bold text-lg">22g</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={() => setScanState('idle')}
              className="flex-1 py-4 rounded-xl font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              Retake
            </button>
            <button 
              onClick={handleAdd}
              className="flex-1 py-4 rounded-xl font-bold text-black bg-emerald-400 hover:bg-emerald-300 shadow-[0_0_20px_rgba(52,211,153,0.4)] transition-all flex items-center justify-center gap-2"
            >
              <Check size={20} />
              Add to Diary
            </button>
          </div>
        </motion.div>
      )}

      {/* Bottom Controls (Only visible when idle) */}
      {scanState === 'idle' && (
        <motion.div 
          key="bottom-controls"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-0 left-0 right-0 z-20 pb-24 pt-12 bg-gradient-to-t from-black via-black/80 to-transparent"
        >
          {/* Tabs */}
          <div className="flex justify-center gap-6 mb-8">
            {['plate', 'label', 'manual'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={cn(
                  "text-sm font-medium uppercase tracking-wider transition-colors",
                  activeTab === tab ? "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" : "text-white/40"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Shutter Button */}
          <div className="flex justify-center items-center gap-8">
            <button className="p-4 rounded-full bg-white/10 backdrop-blur-md text-white/60 hover:bg-white/20 transition-colors">
              <Search size={24} />
            </button>
            
            <button 
              onClick={handleScan}
              className="relative w-20 h-20 rounded-full border-4 border-white flex items-center justify-center group"
            >
              <div className="absolute inset-0 rounded-full border-2 border-emerald-500 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
              <div className="w-16 h-16 bg-white rounded-full group-hover:scale-90 transition-transform duration-200" />
            </button>

            <button className="p-4 rounded-full bg-white/10 backdrop-blur-md text-white/60 hover:bg-white/20 transition-colors">
              <ScanLine size={24} />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
