import React, { useState } from 'react';
import SchedulerTab from './tabs/SchedulerTab';
import KitsTab from './tabs/KitsTab';

const tabs = [
  { id: 'scheduler', label: 'Surgery Scheduler' },
  { id: 'kits', label: 'Kits & Assets' }
];

export default function Operations() {
  const [activeTab, setActiveTab] = useState('scheduler');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'scheduler': return <SchedulerTab />;
      case 'kits': return <KitsTab />;
      default: return <SchedulerTab />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Operations</h1>
        <p className="text-gray-400 mt-1">Manage surgeries and inventory operations</p>
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