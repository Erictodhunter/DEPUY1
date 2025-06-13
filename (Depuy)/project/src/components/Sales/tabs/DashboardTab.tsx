import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { TrendingUp, DollarSign, Users, Calendar, Target, Activity, RefreshCw, Download, Filter, Building2, User, Award, Zap } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface DashboardData {
  totalOpportunities: number;
  totalValue: number;
  weightedValue: number;
  avgDealSize: number;
  winRate: number;
  conversionRate: number;
  activePipeline: number;
  closedThisMonth: number;
  monthlyTrends: Array<{
    month: string;
    opportunities: number;
    value: number;
    closed: number;
  }>;
  stageDistribution: Array<{
    stage: string;
    count: number;
    value: number;
    fill: string;
  }>;
  hospitalPerformance: Array<{
    hospital: string;
    opportunities: number;
    value: number;
    winRate: number;
  }>;
  surgeonPerformance: Array<{
    surgeon: string;
    opportunities: number;
    value: number;
    avgDealSize: number;
  }>;
  recentActivity: Array<{
    id: number;
    title: string;
    type: string;
    date: string;
    value?: number;
    hospital?: string;
  }>;
}

export default function DashboardTab() {
  const [data, setData] = useState<DashboardData>({
    totalOpportunities: 0,
    totalValue: 0,
    weightedValue: 0,
    avgDealSize: 0,
    winRate: 0,
    conversionRate: 0,
    activePipeline: 0,
    closedThisMonth: 0,
    monthlyTrends: [],
    stageDistribution: [],
    hospitalPerformance: [],
    surgeonPerformance: [],
    recentActivity: []
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('3months');

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316'];

  useEffect(() => {
    loadDashboardData();
  }, [timeRange]);

  const getDateRange = () => {
    const now = new Date();
    const ranges = {
      '1month': new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()),
      '3months': new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()),
      '6months': new Date(now.getFullYear(), now.getMonth() - 6, now.getDate()),
      '1year': new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
    };
    return ranges[timeRange as keyof typeof ranges];
  };

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const startDate = getDateRange();
      
      // Load opportunities with relationships
      const { data: opportunities, error: oppsError } = await supabase
        .from('opportunities')
        .select(`
          *,
          hospital:hospitals(id, name),
          surgeon:surgeons(id, first_name, last_name)
        `)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (oppsError) throw oppsError;

      // Calculate metrics
      const opps = opportunities || [];
      const totalOpportunities = opps.length;
      const totalValue = opps.reduce((sum, opp) => sum + (opp.estimated_value || 0), 0);
      const weightedValue = opps.reduce((sum, opp) => sum + ((opp.estimated_value || 0) * (opp.probability_percentage || 0) / 100), 0);
      const avgDealSize = totalOpportunities > 0 ? totalValue / totalOpportunities : 0;
      
      const closedWon = opps.filter(opp => opp.stage === 'closed_won');
      const closedLost = opps.filter(opp => opp.stage === 'closed_lost');
      const totalClosed = closedWon.length + closedLost.length;
      const winRate = totalClosed > 0 ? (closedWon.length / totalClosed) * 100 : 0;
      const conversionRate = totalOpportunities > 0 ? (closedWon.length / totalOpportunities) * 100 : 0;
      
      const activePipeline = opps.filter(opp => !['closed_won', 'closed_lost'].includes(opp.stage || '')).length;
      
      // Closed this month
      const thisMonth = new Date();
      thisMonth.setDate(1);
      const closedThisMonth = opps.filter(opp => 
        (opp.stage === 'closed_won' || opp.stage === 'closed_lost') &&
        new Date(opp.updated_at) >= thisMonth
      ).length;

      // Monthly trends
      const monthlyGroups: Record<string, any> = {};
      opps.forEach(opp => {
        const month = new Date(opp.created_at).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        if (!monthlyGroups[month]) {
          monthlyGroups[month] = { opportunities: 0, value: 0, closed: 0 };
        }
        monthlyGroups[month].opportunities++;
        monthlyGroups[month].value += opp.estimated_value || 0;
        if (opp.stage === 'closed_won') monthlyGroups[month].closed++;
      });

      const monthlyTrends = Object.entries(monthlyGroups).map(([month, data]) => ({
        month,
        ...data
      }));

      // Stage distribution
      const stageGroups: Record<string, any> = {};
      const stageColors = {
        'lead': '#3B82F6',
        'qualified': '#10B981', 
        'proposal': '#F59E0B',
        'negotiation': '#EF4444',
        'closed_won': '#22C55E',
        'closed_lost': '#EF4444'
      };

      opps.forEach(opp => {
        const stage = opp.stage || 'lead';
        if (!stageGroups[stage]) {
          stageGroups[stage] = { count: 0, value: 0 };
        }
        stageGroups[stage].count++;
        stageGroups[stage].value += opp.estimated_value || 0;
      });

      const stageDistribution = Object.entries(stageGroups).map(([stage, data]) => ({
        stage: stage.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        count: data.count,
        value: data.value,
        fill: stageColors[stage as keyof typeof stageColors] || '#6B7280'
      }));

      // Hospital performance
      const hospitalGroups: Record<string, any> = {};
      opps.forEach(opp => {
        const hospitalName = opp.hospital?.name || 'Unknown';
        if (!hospitalGroups[hospitalName]) {
          hospitalGroups[hospitalName] = { opportunities: 0, value: 0, won: 0, closed: 0 };
        }
        hospitalGroups[hospitalName].opportunities++;
        hospitalGroups[hospitalName].value += opp.estimated_value || 0;
        if (opp.stage === 'closed_won') hospitalGroups[hospitalName].won++;
        if (opp.stage === 'closed_won' || opp.stage === 'closed_lost') hospitalGroups[hospitalName].closed++;
      });

      const hospitalPerformance = Object.entries(hospitalGroups)
        .map(([hospital, data]) => ({
          hospital,
          opportunities: data.opportunities,
          value: data.value,
          winRate: data.closed > 0 ? (data.won / data.closed) * 100 : 0
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);

      // Surgeon performance
      const surgeonGroups: Record<string, any> = {};
      opps.forEach(opp => {
        if (opp.surgeon) {
          const surgeonName = `Dr. ${opp.surgeon.first_name} ${opp.surgeon.last_name}`;
          if (!surgeonGroups[surgeonName]) {
            surgeonGroups[surgeonName] = { opportunities: 0, value: 0 };
          }
          surgeonGroups[surgeonName].opportunities++;
          surgeonGroups[surgeonName].value += opp.estimated_value || 0;
        }
      });

      const surgeonPerformance = Object.entries(surgeonGroups)
        .map(([surgeon, data]) => ({
          surgeon,
          opportunities: data.opportunities,
          value: data.value,
          avgDealSize: data.opportunities > 0 ? data.value / data.opportunities : 0
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8);

      // Recent activity (last 10 opportunities)
      const recentActivity = opps.slice(0, 10).map(opp => ({
        id: opp.id,
        title: opp.title,
        type: opp.stage || 'lead',
        date: opp.created_at,
        value: opp.estimated_value,
        hospital: opp.hospital?.name
      }));

      setData({
        totalOpportunities,
        totalValue,
        weightedValue,
        avgDealSize,
        winRate,
        conversionRate,
        activePipeline,
        closedThisMonth,
        monthlyTrends,
        stageDistribution,
        hospitalPerformance,
        surgeonPerformance,
        recentActivity
      });

    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const exportData = () => {
    const exportData = {
      export_date: new Date().toISOString(),
      time_range: timeRange,
      metrics: {
        totalOpportunities: data.totalOpportunities,
        totalValue: data.totalValue,
        weightedValue: data.weightedValue,
        winRate: data.winRate
      },
      charts: {
        monthlyTrends: data.monthlyTrends,
        stageDistribution: data.stageDistribution,
        hospitalPerformance: data.hospitalPerformance
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-dashboard-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-600">Loading dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <div className="text-red-500 mb-4">{error}</div>
            <button
              onClick={loadDashboardData}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Sales Dashboard</h2>
            <p className="text-gray-600">Comprehensive sales performance and analytics</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="1month">Last Month</option>
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="1year">Last Year</option>
            </select>
            <button
              onClick={exportData}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button
              onClick={loadDashboardData}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">{data.totalOpportunities}</div>
                <div className="text-sm text-blue-800">Total Opportunities</div>
              </div>
              <Target className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(data.totalValue)}</div>
                <div className="text-sm text-green-800">Total Value</div>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-600">{formatCurrency(data.weightedValue)}</div>
                <div className="text-sm text-purple-800">Weighted Value</div>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-600">{formatCurrency(data.avgDealSize)}</div>
                <div className="text-sm text-orange-800">Avg Deal Size</div>
              </div>
              <Award className="w-8 h-8 text-orange-500" />
            </div>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-yellow-600">{data.winRate.toFixed(1)}%</div>
                <div className="text-sm text-yellow-800">Win Rate</div>
              </div>
              <Zap className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-indigo-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-indigo-600">{data.conversionRate.toFixed(1)}%</div>
                <div className="text-sm text-indigo-800">Conversion Rate</div>
              </div>
              <Activity className="w-8 h-8 text-indigo-500" />
            </div>
          </div>
          
          <div className="bg-pink-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-pink-600">{data.activePipeline}</div>
                <div className="text-sm text-pink-800">Active Pipeline</div>
              </div>
              <Users className="w-8 h-8 text-pink-500" />
            </div>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-600">{data.closedThisMonth}</div>
                <div className="text-sm text-red-800">Closed This Month</div>
              </div>
              <Calendar className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip formatter={(value, name) => [
                name === 'value' ? formatCurrency(Number(value)) : value,
                name === 'value' ? 'Value' : name === 'opportunities' ? 'Opportunities' : 'Closed'
              ]} />
              <Legend />
              <Bar yAxisId="left" dataKey="opportunities" fill="#3B82F6" name="Opportunities" />
              <Line yAxisId="right" type="monotone" dataKey="closed" stroke="#10B981" strokeWidth={3} name="Closed" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Stage Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pipeline by Stage</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.stageDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ stage, count }) => `${stage}: ${count}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {data.stageDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [value, 'Opportunities']} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Hospital Performance */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Hospitals by Value</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.hospitalPerformance} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="hospital" type="category" width={120} />
              <Tooltip formatter={(value, name) => [
                name === 'value' ? formatCurrency(Number(value)) : 
                name === 'winRate' ? `${Number(value).toFixed(1)}%` : value,
                name === 'value' ? 'Value' : name === 'opportunities' ? 'Opportunities' : 'Win Rate'
              ]} />
              <Legend />
              <Bar dataKey="value" fill="#10B981" name="Value" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Surgeon Performance */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Surgeon Performance</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Surgeon</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-900">Opportunities</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-900">Total Value</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-900">Avg Deal Size</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.surgeonPerformance.map((surgeon, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-900">{surgeon.surgeon}</td>
                    <td className="px-4 py-2 text-sm text-gray-900 text-right">{surgeon.opportunities}</td>
                    <td className="px-4 py-2 text-sm text-gray-900 text-right">{formatCurrency(surgeon.value)}</td>
                    <td className="px-4 py-2 text-sm text-gray-900 text-right">{formatCurrency(surgeon.avgDealSize)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {data.recentActivity.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No recent activity found</p>
            </div>
          ) : (
            data.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    activity.type === 'closed_won' ? 'bg-green-500' :
                    activity.type === 'closed_lost' ? 'bg-red-500' :
                    activity.type === 'negotiation' ? 'bg-orange-500' :
                    activity.type === 'proposal' ? 'bg-purple-500' :
                    activity.type === 'qualified' ? 'bg-indigo-500' :
                    'bg-blue-500'
                  }`}></div>
                  <div>
                    <div className="font-medium text-gray-900">{activity.title}</div>
                    <div className="text-sm text-gray-600">
                      {activity.hospital && `${activity.hospital} • `}
                      {formatDate(activity.date)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">
                    {activity.value ? formatCurrency(activity.value) : '—'}
                  </div>
                  <div className="text-sm text-gray-600 capitalize">
                    {activity.type.replace('_', ' ')}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}