import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Package, AlertTriangle, PieChart, Calendar, RefreshCw } from 'lucide-react';

// Interfaces for Analytics Data
interface AnalyticsMetrics {
  caseVolume: number;
  kitUtilization: number;
  reconciliationVariance: number;
  backorderRate: number;
}

interface CaseVolumeData {
  period: string;
  cases: number;
  date: string;
}

interface ManufacturerSalesData {
  manufacturer: string;
  sales: number;
  percentage: number;
  color: string;
}

interface KitUtilizationData {
  category: string;
  utilization: number;
  total: number;
  used: number;
}

interface ExpiringInventoryData {
  category: string;
  expiring: number;
  total: number;
  percentage: number;
}

interface BackorderData {
  currentRate: number;
  lastMonth: number;
  target: number;
  activeBackorders: number;
}

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for analytics data
  const [metrics, setMetrics] = useState<AnalyticsMetrics>({
    caseVolume: 724,
    kitUtilization: 87,
    reconciliationVariance: 12400,
    backorderRate: 3.2
  });

  const [caseVolumeData] = useState<CaseVolumeData[]>([
    { period: 'Jan', cases: 98, date: 'Jan 2024' },
    { period: 'Feb', cases: 112, date: 'Feb 2024' },
    { period: 'Mar', cases: 125, date: 'Mar 2024' },
    { period: 'Apr', cases: 108, date: 'Apr 2024' },
    { period: 'May', cases: 134, date: 'May 2024' },
    { period: 'Jun', cases: 147, date: 'Jun 2024' }
  ]);

  const [utilizationData] = useState<KitUtilizationData[]>([
    { category: 'Hip Kits', utilization: 92, total: 125, used: 115 },
    { category: 'Knee Kits', utilization: 85, total: 156, used: 133 },
    { category: 'Spine Kits', utilization: 78, total: 89, used: 69 },
    { category: 'Trauma Kits', utilization: 94, total: 67, used: 63 }
  ]);

  const [manufacturerData] = useState<ManufacturerSalesData[]>([
    { manufacturer: 'DePuy Synthes', percentage: 45, sales: 1080000, color: 'bg-purple-500' },
    { manufacturer: 'Zimmer Biomet', percentage: 28, sales: 672000, color: 'bg-blue-500' },
    { manufacturer: 'Stryker', percentage: 18, sales: 432000, color: 'bg-green-500' },
    { manufacturer: 'Smith & Nephew', percentage: 9, sales: 216000, color: 'bg-orange-500' }
  ]);

  const [expiringData] = useState<ExpiringInventoryData[]>([
    { category: 'Hip Implants', expiring: 12, total: 145, percentage: 8.3 },
    { category: 'Knee Implants', expiring: 8, total: 178, percentage: 4.5 },
    { category: 'Spine Hardware', expiring: 15, total: 234, percentage: 6.4 },
    { category: 'Trauma Plates', expiring: 6, total: 89, percentage: 6.7 }
  ]);

  const [backorderData] = useState<BackorderData>({
    currentRate: 3.2,
    lastMonth: 4.1,
    target: 2.8,
    activeBackorders: 23
  });

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  // Main render
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <div className="text-gray-600">Loading analytics data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-red-500 text-5xl">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-900">Analytics Unavailable</h3>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => {
              setError(null);
              handleRefresh();
            }}
            className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
          <p className="text-gray-400 mt-1">Comprehensive view of operations and performance</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-500 bg-opacity-20 mr-4">
              <Calendar className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">Total Cases</p>
              <p className="text-2xl font-bold text-white">{metrics.caseVolume.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-500 bg-opacity-20 mr-4">
              <Package className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">Kit Utilization</p>
              <p className="text-2xl font-bold text-white">{metrics.kitUtilization}%</p>
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-500 bg-opacity-20 mr-4">
              <AlertTriangle className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">Backorder Rate</p>
              <p className="text-2xl font-bold text-white">{metrics.backorderRate}%</p>
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-500 bg-opacity-20 mr-4">
              <TrendingUp className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">Variance</p>
              <p className="text-2xl font-bold text-white">${metrics.reconciliationVariance.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Case Volume Trend */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white flex items-center">
              <BarChart3 className="w-5 h-5 text-blue-400 mr-2" />
              Case Volume Trend
            </h3>
          </div>
          <div className="h-64 bg-gray-800 rounded-lg p-4">
            <div className="grid grid-cols-6 gap-2 h-full items-end">
              {caseVolumeData.map((data, index) => (
                <div key={index} className="flex flex-col items-center space-y-2">
                  <div className="text-xs text-gray-400">{data.cases}</div>
                  <div
                    className="bg-gradient-to-t from-blue-600 to-blue-400 rounded-t w-full transition-all duration-300 hover:from-blue-500 hover:to-blue-300"
                    style={{ height: `${(data.cases / Math.max(...caseVolumeData.map(d => d.cases))) * 80}%`, minHeight: '20px' }}
                    title={`${data.date}: ${data.cases} cases`}
                  ></div>
                  <span className="text-xs text-gray-400">{data.period}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Kit Utilization */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white flex items-center">
              <Package className="w-5 h-5 text-green-400 mr-2" />
              Kit Utilization
            </h3>
          </div>
          <div className="space-y-4">
            {utilizationData.map((data, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-white font-medium">{data.category}</span>
                  <div className="text-right">
                    <span className={`font-semibold ${
                      data.utilization >= 90 ? 'text-green-400' :
                      data.utilization >= 80 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {data.utilization}%
                    </span>
                    <div className="text-xs text-gray-400">
                      {data.used}/{data.total} used
                    </div>
                  </div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-300 ${
                      data.utilization >= 90 ? 'bg-green-500' :
                      data.utilization >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${data.utilization}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Manufacturer Sales Breakdown */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white flex items-center">
              <PieChart className="w-5 h-5 text-purple-400 mr-2" />
              Sales by Manufacturer
            </h3>
          </div>
          <div className="space-y-4">
            {manufacturerData.map((data, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-white font-medium">{data.manufacturer}</span>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-white">{data.percentage}%</span>
                    <div className="text-xs text-gray-400">${(data.sales / 1000).toFixed(0)}k</div>
                  </div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${data.color.replace('bg-', 'bg-')}`}
                    style={{ width: `${data.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-gray-700">
            <div className="flex rounded-full overflow-hidden h-4">
              {manufacturerData.map((data, index) => (
                <div
                  key={index}
                  className={data.color}
                  style={{ width: `${data.percentage}%` }}
                  title={`${data.manufacturer}: ${data.percentage}%`}
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Expiring Inventory */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white flex items-center">
              <AlertTriangle className="w-5 h-5 text-orange-400 mr-2" />
              Expiring Inventory
            </h3>
          </div>
          <div className="space-y-3">
            {expiringData.map((data, index) => (
              <div key={index} className="bg-red-500 bg-opacity-10 p-4 rounded-lg border border-red-500 border-opacity-30">
                <div className="flex justify-between items-center">
                  <span className="text-white font-medium">{data.category}</span>
                  <span className="text-red-400 font-semibold">{data.percentage}%</span>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {data.expiring} of {data.total} items expiring soon
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row - Backorder Analysis */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <TrendingDown className="w-5 h-5 text-blue-400 mr-2" />
            Backorder Analysis
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-gray-800 rounded-lg">
            <div className="text-3xl font-bold text-blue-400">{backorderData.currentRate}%</div>
            <div className="text-sm text-gray-400">Current Rate</div>
          </div>
          <div className="text-center p-4 bg-gray-800 rounded-lg">
            <div className="text-3xl font-bold text-gray-300">{backorderData.lastMonth}%</div>
            <div className="text-sm text-gray-400">Last Month</div>
          </div>
          <div className="text-center p-4 bg-gray-800 rounded-lg">
            <div className="text-3xl font-bold text-green-400">{backorderData.target}%</div>
            <div className="text-sm text-gray-400">Target</div>
          </div>
          <div className="text-center p-4 bg-gray-800 rounded-lg">
            <div className="text-3xl font-bold text-orange-400">{backorderData.activeBackorders}</div>
            <div className="text-sm text-gray-400">Active Backorders</div>
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-gray-700">
          <div className="flex items-center gap-2">
            {backorderData.currentRate < backorderData.lastMonth ? (
              <TrendingDown className="w-4 h-4 text-green-400" />
            ) : (
              <TrendingUp className="w-4 h-4 text-red-400" />
            )}
            <span className={`text-sm ${
              backorderData.currentRate < backorderData.lastMonth ? 'text-green-400' : 'text-red-400'
            }`}>
              {backorderData.currentRate < backorderData.lastMonth ? 'Improvement' : 'Increase'} from last month
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}