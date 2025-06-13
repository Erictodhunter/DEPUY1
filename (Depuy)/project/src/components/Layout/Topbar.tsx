import React, { useState } from 'react';
import { User, ChevronRight, LogOut } from 'lucide-react';

interface TopbarProps {
  breadcrumbs: string[];
  onLogout: () => void;
}

export default function Topbar({ breadcrumbs, onLogout }: TopbarProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    setShowUserMenu(false);
    onLogout();
  };

  return (
    <div className="topbar">
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center space-x-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-400">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                {index > 0 && <ChevronRight size={16} />}
                <span className={index === breadcrumbs.length - 1 ? 'text-purple-400' : ''}>
                  {crumb}
                </span>
              </React.Fragment>
            ))}
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
              <span className="text-sm text-gray-300">John Doe</span>
            </button>
            
            {showUserMenu && (
              <div className="absolute right-0 top-12 w-48 bg-gray-800 rounded-lg border border-gray-700 shadow-xl z-50">
                <div className="p-2">
                  <button 
                    onClick={handleLogout}
                    className="flex items-center space-x-2 w-full p-2 rounded-lg hover:bg-gray-700 text-left text-red-400"
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}