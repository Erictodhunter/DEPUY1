import React, { useState } from 'react';
import SurgeonsTab from './tabs/SurgeonsTab';
import HospitalsTab from './tabs/HospitalsTab';
import ProceduresTab from './tabs/ProceduresTab';
import TeamsTab from './tabs/TeamsTab';
import RegionsTab from './tabs/RegionsTab';
import InventoryTab from './tabs/InventoryTab';
import UsersTab from './tabs/UsersTab';

const tabs = [
  { id: 'surgeons', label: 'Surgeons' },
  { id: 'hospitals', label: 'Hospitals & Systems' },
  { id: 'procedures', label: 'Procedures' },
  { id: 'teams', label: 'Rep Teams & Territories' },
  { id: 'regions', label: 'Office Regions' },
  { id: 'inventory', label: 'Manufacturers & Inventory' },
  { id: 'users', label: 'Users' }
];

export default function SetupAdmin() {
  const [activeTab, setActiveTab] = useState('surgeons');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'surgeons': return <SurgeonsTab />;
      case 'hospitals': return <HospitalsTab />; 
      case 'procedures': return <ProceduresTab />;
      case 'teams': return <TeamsTab />;
      case 'regions': return <RegionsTab />;
      case 'inventory': return <InventoryTab />;
      case 'users': return <UsersTab />;
      default: return <SurgeonsTab />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Setup & Administration</h1>
        <p className="text-gray-400 mt-1">Manage system configuration and data</p>
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