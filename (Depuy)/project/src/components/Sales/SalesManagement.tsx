import React, { useState } from 'react';
import PipelineTab from './tabs/PipelineTab';
import DashboardTab from './tabs/DashboardTab';


const tabs = [
  { id: 'pipeline', label: 'Pipeline' },
  { id: 'dashboard', label: 'Dashboard' }
];

export default function SalesManagement() {
  const [activeTab, setActiveTab] = useState('pipeline');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'pipeline': return <PipelineTab />;
      case 'dashboard': return <DashboardTab />;
      default: return <PipelineTab />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Sales Management</h1>
        <p className="text-gray-400 mt-1">Track opportunities, performance, and sales analytics</p>
      </div>

      <div className="tab-nav">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="slide-in">
        {renderTabContent()}
      </div>
    </div>
  );
}