import React, { useState } from 'react';
import { Shield, Settings as SettingsIcon, Users, Database, ToggleLeft, ToggleRight, Save } from 'lucide-react';

export default function Settings() {
  const [acmIntegration, setAcmIntegration] = useState(true);
  const [ediIntegration, setEdiIntegration] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);

  const roles = [
    {
      id: 'admin',
      name: 'System Administrator',
      description: 'Full system access and user management',
      permissions: {
        viewDashboard: true,
        setupAdmin: true,
        operations: true,
        repPortal: true,
        salesManagement: true,
        analytics: true,
        settings: true,
        userManagement: true
      }
    },
    {
      id: 'regional-manager',
      name: 'Regional Manager',
      description: 'Regional oversight and team management',
      permissions: {
        viewDashboard: true,
        setupAdmin: false,
        operations: true,
        repPortal: true,
        salesManagement: true,
        analytics: true,
        settings: false,
        userManagement: false
      }
    },
    {
      id: 'sales-rep',
      name: 'Sales Representative',
      description: 'Field operations and customer interaction',
      permissions: {
        viewDashboard: true,
        setupAdmin: false,
        operations: false,
        repPortal: true,
        salesManagement: true,
        analytics: false,
        settings: false,
        userManagement: false
      }
    },
    {
      id: 'operations',
      name: 'Operations Staff',
      description: 'Surgery scheduling and inventory management',
      permissions: {
        viewDashboard: true,
        setupAdmin: false,
        operations: true,
        repPortal: false,
        salesManagement: false,
        analytics: false,
        settings: false,
        userManagement: false
      }
    }
  ];

  const systemSettings = [
    {
      category: 'Integration',
      settings: [
        {
          id: 'acm',
          label: 'ACM Integration',
          description: 'Enable integration with Asset and Case Management system',
          enabled: acmIntegration,
          toggle: () => setAcmIntegration(!acmIntegration)
        },
        {
          id: 'edi',
          label: 'EDI Integration',
          description: 'Enable Electronic Data Interchange for automated transactions',
          enabled: ediIntegration,
          toggle: () => setEdiIntegration(!ediIntegration)
        }
      ]
    },
    {
      category: 'Synchronization',
      settings: [
        {
          id: 'auto-sync',
          label: 'Auto Sync',
          description: 'Automatically synchronize data with external systems',
          enabled: autoSync,
          toggle: () => setAutoSync(!autoSync)
        }
      ]
    },
    {
      category: 'Notifications',
      settings: [
        {
          id: 'email',
          label: 'Email Notifications',
          description: 'Send email notifications for important events',
          enabled: emailNotifications,
          toggle: () => setEmailNotifications(!emailNotifications)
        }
      ]
    }
  ];

  const permissionLabels = {
    viewDashboard: 'View Dashboard',
    setupAdmin: 'Setup & Admin',
    operations: 'Operations',
    repPortal: 'Rep Portal',
    salesManagement: 'Sales Management',
    analytics: 'Analytics',
    settings: 'Settings',
    userManagement: 'User Management'
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 mt-1">System configuration and user permissions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Role & Permission Viewer */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <Shield size={24} className="text-purple-400" />
            <h2 className="text-xl font-semibold text-white">Roles & Permissions</h2>
          </div>

          <div className="space-y-4">
            {roles.map((role) => (
              <div key={role.id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-white font-semibold">{role.name}</h3>
                    <p className="text-gray-400 text-sm">{role.description}</p>
                  </div>
                  <button className="btn-secondary text-sm">Edit</button>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-300">Permissions:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(role.permissions).map(([permission, enabled]) => (
                      <div key={permission} className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${enabled ? 'bg-green-400' : 'bg-gray-600'}`}></div>
                        <span className={`text-sm ${enabled ? 'text-gray-300' : 'text-gray-500'}`}>
                          {permissionLabels[permission as keyof typeof permissionLabels]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Settings */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <SettingsIcon size={24} className="text-blue-400" />
            <h2 className="text-xl font-semibold text-white">System Settings</h2>
          </div>

          <div className="space-y-6">
            {systemSettings.map((category) => (
              <div key={category.category} className="card">
                <h3 className="text-white font-semibold mb-4">{category.category}</h3>
                
                <div className="space-y-4">
                  {category.settings.map((setting) => (
                    <div key={setting.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-white font-medium">{setting.label}</div>
                        <div className="text-gray-400 text-sm">{setting.description}</div>
                      </div>
                      <button
                        onClick={setting.toggle}
                        className={`ml-4 p-1 rounded-full transition-colors ${
                          setting.enabled ? 'text-green-400' : 'text-gray-600'
                        }`}
                      >
                        {setting.enabled ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Database Configuration */}
          <div className="card">
            <div className="flex items-center space-x-3 mb-4">
              <Database size={20} className="text-green-400" />
              <h3 className="text-white font-semibold">Database Configuration</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Connection String</label>
                <input 
                  type="text" 
                  className="input-field font-mono text-sm" 
                  value="postgresql://****:****@****:5432/depuy_synthes_erp"
                  readOnly
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Backup Frequency</label>
                  <select className="input-field">
                    <option>Daily</option>
                    <option>Weekly</option>
                    <option>Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Retention Period</label>
                  <select className="input-field">
                    <option>30 days</option>
                    <option>90 days</option>
                    <option>1 year</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* API Configuration */}
          <div className="card">
            <h3 className="text-white font-semibold mb-4">API Configuration</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">SAP Endpoint</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="https://sap.depuysynthes.com/api"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Rate Limit (requests/minute)</label>
                <input 
                  type="number" 
                  className="input-field" 
                  defaultValue="1000"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Timeout (seconds)</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    defaultValue="30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Retry Attempts</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    defaultValue="3"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button className="btn-primary w-full flex items-center justify-center space-x-2">
            <Save size={18} />
            <span>Save All Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
}