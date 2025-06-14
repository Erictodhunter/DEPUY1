import React, { useState } from 'react';
import LoginPage from './components/Login/LoginPage';
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import SetupAdmin from './components/Setup/SetupAdmin';
import Operations from './components/Operations/Operations';
import RepPortal from './components/RepPortal/RepPortal';
import SalesManagement from './components/Sales/SalesManagement';
import AIInsights from './components/AIInsights/AIInsights';
import Analytics from './components/Analytics/Analytics';


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveTab('dashboard'); // Reset to dashboard on logout
  };

  const getBreadcrumbs = () => {
    switch (activeTab) {
      case 'dashboard': return ['Dashboard'];
      case 'setup': return ['Setup & Admin'];
      case 'operations': return ['Operations'];
      case 'rep-portal': return ['Rep Portal'];
      case 'sales': return ['Sales Management'];
      case 'ai-insights': return ['AI Insights'];
      case 'analytics': return ['Analytics'];
      default: return ['Dashboard'];
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'setup': return <SetupAdmin />;
      case 'operations': return <Operations />;
      case 'rep-portal': return <RepPortal />;
      case 'sales': return <SalesManagement />;
      case 'ai-insights': return <AIInsights />;
      case 'analytics': return <Analytics />;
      default: return <Dashboard />;
    }
  };

  if (!isLoggedIn) {
    return <LoginPage onBypassLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <Layout 
      activeTab={activeTab} 
      onTabChange={setActiveTab}
      breadcrumbs={getBreadcrumbs()}
      onLogout={handleLogout}
    >
      {renderContent()}
    </Layout>
  );
}

export default App;