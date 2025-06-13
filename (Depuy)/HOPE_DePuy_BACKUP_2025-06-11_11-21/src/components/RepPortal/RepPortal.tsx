import React, { useState } from 'react';
import ScheduleTab from './tabs/ScheduleTab';
import ReportsTab from './tabs/ReportsTab';
import BookingTab from './tabs/BookingTab';

const tabs = [
  { id: 'schedule', label: 'My Schedule' },
  { id: 'reports', label: 'Reports' },
  { id: 'booking', label: 'Surgery Booking' }
];

export default function RepPortal() {
  const [activeTab, setActiveTab] = useState('schedule');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'schedule': return <ScheduleTab />;
      case 'reports': return <ReportsTab />;
      case 'booking': return <BookingTab />;
      default: return <ScheduleTab />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Rep Portal</h1>
        <p className="text-gray-400 mt-1">Field representative tools and resources</p>
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