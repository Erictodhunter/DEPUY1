import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  breadcrumbs: string[];
  onLogout: () => void;
}

export default function Layout({ children, activeTab, onTabChange, breadcrumbs, onLogout }: LayoutProps) {
  return (
    <div className="min-h-screen bg-black">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={onTabChange}
      />
      <Topbar 
        breadcrumbs={breadcrumbs}
        onLogout={onLogout}
      />
      <main className="main-content">
        <div className="fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}