import React from 'react';
import { 
  LayoutDashboard, 
  Wrench, 
  Truck, 
  UserCheck, 
  TrendingUp, 
  BarChart3,
  Brain
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'setup', label: 'Setup & Admin', icon: Wrench },
  { id: 'operations', label: 'Operations', icon: Truck },
  { id: 'rep-portal', label: 'Rep Portal', icon: UserCheck },
  { id: 'sales', label: 'Sales Management', icon: TrendingUp },
  { id: 'ai-insights', label: 'AI Insights', icon: Brain },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  return (
    <div className="sidebar">
      <div className="flex items-center p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">DS</span>
          </div>
          <span className="text-lg font-semibold text-purple-400">DePuy Synthes</span>
        </div>
      </div>
      
      <nav className="flex-1 p-2">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`nav-item w-full text-left ${activeTab === item.id ? 'active' : ''}`}
            >
              <IconComponent size={20} className="flex-shrink-0" />
              <span className="ml-3">{item.label}</span>
            </button>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-gray-700">
        <div className="text-xs text-gray-500 text-center">
          DePuy Synthes ERP v2.1
        </div>
      </div>
    </div>
  );
}