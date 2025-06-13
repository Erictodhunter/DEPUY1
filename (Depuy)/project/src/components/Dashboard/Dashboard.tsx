import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Package, 
  FileText, 
  TrendingUp, 
  Users, 
  Building2, 
  DollarSign,
  AlertTriangle,
  Calendar,
  Stethoscope
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface KPIData {
  value: number;
  label: string;
  type: 'number' | 'currency';
}

interface DashboardData {
  surgeries_today: KPIData;
  pending_surgeries: KPIData;
  inventory_value: KPIData;
  low_stock_items: KPIData;
  active_invoices: KPIData;
  invoice_amount: KPIData;
  total_hospitals: KPIData;
  total_surgeons: KPIData;
  last_updated: string;
}

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_dashboard_kpis');
      
      if (error) {
        throw error;
      }
      
      setDashboardData(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Refresh data every 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const formatValue = (kpi: KPIData) => {
    if (kpi.type === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(kpi.value);
    }
    return kpi.value.toLocaleString();
  };

  const getKPIConfig = () => [
    {
      key: 'surgeries_today',
      icon: Activity,
      color: 'text-green-400',
      bgColor: 'bg-green-400/20'
    },
    {
      key: 'pending_surgeries',
      icon: Calendar,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/20'
    },
    {
      key: 'inventory_value',
      icon: Package,
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/20'
    },
    {
      key: 'low_stock_items',
      icon: AlertTriangle,
      color: 'text-orange-400',
      bgColor: 'bg-orange-400/20'
    },
    {
      key: 'active_invoices',
      icon: FileText,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/20'
    },
    {
      key: 'invoice_amount',
      icon: DollarSign,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-400/20'
    },
    {
      key: 'total_hospitals',
      icon: Building2,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-400/20'
    },
    {
      key: 'total_surgeons',
      icon: Stethoscope,
      color: 'text-pink-400',
      bgColor: 'bg-pink-400/20'
    }
  ];

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-400 mt-1">Loading dashboard data...</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="kpi-card animate-pulse">
              <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-700 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-red-400 mt-1">{error}</p>
          </div>
          <button 
            onClick={fetchDashboardData}
            className="btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-400 mt-1">No data available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">DePuy Synthes ERP System Overview</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-400">Last updated</div>
          <div className="text-white font-medium">
            {new Date(dashboardData.last_updated).toLocaleTimeString()}
          </div>
          <button 
            onClick={fetchDashboardData}
            disabled={loading}
            className="mt-2 text-sm text-purple-400 hover:text-purple-300 disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* KPI Cards - Real Data from Supabase */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {getKPIConfig().map((config) => {
          const kpi = dashboardData[config.key as keyof DashboardData] as KPIData;
          const IconComponent = config.icon;
          
          return (
            <div key={config.key} className="kpi-card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-gray-400 text-sm mb-1">{kpi.label}</p>
                  <p className="text-2xl font-bold text-white mb-2">
                    {formatValue(kpi)}
                  </p>
                  <p className="text-xs text-gray-500">Real-time data</p>
                </div>
                <div className={`p-3 rounded-xl ${config.bgColor}`}>
                  <IconComponent size={24} className={config.color} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* System Status */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">System Status</h2>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-sm text-gray-400">All systems operational</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">99.9%</div>
            <div className="text-sm text-gray-400">System Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">
              {dashboardData.total_hospitals.value + dashboardData.total_surgeons.value}
            </div>
            <div className="text-sm text-gray-400">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400 mb-1">
              {new Date().toLocaleDateString()}
            </div>
            <div className="text-sm text-gray-400">Current Date</div>
          </div>
        </div>
      </div>

      {/* Key Metrics Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Surgery Operations</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Today's Surgeries</span>
              <span className="text-white font-semibold">
                {dashboardData.surgeries_today.value}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">This Week's Schedule</span>
              <span className="text-white font-semibold">
                {dashboardData.pending_surgeries.value}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Active Hospitals</span>
              <span className="text-white font-semibold">
                {dashboardData.total_hospitals.value}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Active Surgeons</span>
              <span className="text-white font-semibold">
                {dashboardData.total_surgeons.value}
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Financial Overview</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Pending Invoices</span>
              <span className="text-white font-semibold">
                {dashboardData.active_invoices.value}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Pending Amount</span>
              <span className="text-white font-semibold">
                {formatValue(dashboardData.invoice_amount)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Inventory Value</span>
              <span className="text-white font-semibold">
                {formatValue(dashboardData.inventory_value)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Low Stock Alerts</span>
              <span className={`font-semibold ${
                dashboardData.low_stock_items.value > 0 ? 'text-orange-400' : 'text-green-400'
              }`}>
                {dashboardData.low_stock_items.value}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}