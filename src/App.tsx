import React, { useState } from 'react';
import { NutritionProvider } from './context/NutritionContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { HomeView } from './views/Home';
import { ScannerView } from './views/Scanner';
import { WorkoutView } from './views/Workout';
import { ProgressView } from './views/Progress';
import { PartnerView } from './views/Partner';
import { LoginView } from './views/Login';
import { RegisterView } from './views/Register';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const AppContent = () => {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [showRegister, setShowRegister] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-500" size={48} />
      </div>
    );
  }

  if (!user) {
    if (showRegister) {
      return <RegisterView onSwitch={() => setShowRegister(false)} />;
    }
    return <LoginView onSwitch={() => setShowRegister(true)} />;
  }

  const renderView = () => {
    switch (activeTab) {
      case 'home':
        return <HomeView />;
      case 'scanner':
        return <ScannerView />;
      case 'workout':
        return <WorkoutView />;
      case 'progress':
        return <ProgressView />;
      case 'partner':
        return <PartnerView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <NutritionProvider>
      <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="h-full"
        >
          {renderView()}
        </motion.div>
      </Layout>
    </NutritionProvider>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}
