import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Target, Award, Calendar, RefreshCw, AlertCircle, Users, Building2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface SalesMetrics {
  totalSales: number;
  targetAchievement: number;
  activeOpportunities: number;
  winRate: number;
  monthlyGrowth: number;
}

interface RegionData {
  region: string;
  sales: number;
  percentage: number;
  color: string;
}

interface SurgeonData {
  surgeon: string;
  sales: number;
  cases: number;
}

interface RepData {
  rank: number;
  rep: string;
  sales: number;
  target: number;
  achievement: number;
}

interface WeeklyData {
  week: string;
  sales: number;
}

export default function DashboardTab() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<SalesMetrics>({
    totalSales: 0,
    targetAchievement: 0,
    activeOpportunities: 0,
    winRate: 0,
    monthlyGrowth: 0
  });
  const [salesByRegion, setSalesByRegion] = useState<RegionData[]>([]);
  const [salesBySurgeon, setSalesBySurgeon] = useState<SurgeonData[]>([]);
  const [leaderboard, setLeaderboard] = useState<RepData[]>([]);
  const [weeklyTrend, setWeeklyTrend] = useState<WeeklyData[]>([]);

  // Track table availability to prevent repeated failed requests
  const [tablesAvailable, setTablesAvailable] = useState<Record<string, boolean>>({});
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [selectedPeriod]);

  const loadDashboardData = async () => {
    // Prevent multiple simultaneous checks
    if (loading && !initialCheckDone) return;
    
    setLoading(true);
    setError(null);

    try {
      // Check which tables are available before making requests
      const tablesToCheck = ['sales_opportunities', 'sales_transactions', 'regions', 'surgeons', 'sales_reps'];
      const availableTables: Record<string, boolean> = { ...tablesAvailable };
      
      // Check localStorage cache first
      const cacheKey = 'dashboard_tables_available';
      const cachedData = localStorage.getItem(cacheKey);
      
      if (cachedData && Object.keys(availableTables).length === 0) {
        try {
          const parsed = JSON.parse(cachedData);
          Object.assign(availableTables, parsed);
          console.log('Using cached table availability data');
        } catch (e) {
          console.warn('Failed to parse cached table data');
        }
      }
      
      // Only check tables we haven't checked before or that were previously unavailable
      const tablesToTest = tablesToCheck.filter(table => availableTables[table] !== true && availableTables[table] !== false);
      
      if (tablesToTest.length > 0) {
        console.log('Checking availability of new tables:', tablesToTest);
        
        // Check each table individually with proper error handling
        for (const table of tablesToTest) {
          try {
            const result = await supabase.from(table).select('id').limit(1);
            availableTables[table] = !result.error;
            if (!result.error) {
              console.log(`✓ Table ${table} is available`);
            } else {
              console.warn(`✗ Table ${table} is not available`);
            }
          } catch (fetchError) {
            // Network error or other issue - mark as unavailable
            availableTables[table] = false;
            console.warn(`✗ Table ${table} is not available (network error)`);
          }
        }
        
        // Cache the results
        localStorage.setItem(cacheKey, JSON.stringify(availableTables));
        setTablesAvailable(availableTables);
      }

      // Only make requests to available tables
      const opportunities = availableTables['sales_opportunities'] ? 
        await fetchTableData('sales_opportunities', 'created_at') : [];
      const sales = availableTables['sales_transactions'] ? 
        await fetchTableData('sales_transactions', 'transaction_date') : [];
      const regions = availableTables['regions'] ? 
        await fetchTableDataWithFilter('regions', 'is_active', true) : [];
      const surgeons = availableTables['surgeons'] ? 
        await fetchTableData('surgeons') : [];
      const reps = availableTables['sales_reps'] ? 
        await fetchTableData('sales_reps') : [];

      // Calculate main metrics
      const totalSales = sales.reduce((sum, sale) => sum + (sale.amount || 0), 0);
      const closedWon = opportunities.filter(opp => opp.stage === 'closed-won').length;
      const totalClosed = opportunities.filter(opp => 
        opp.stage === 'closed-won' || opp.stage === 'closed-lost'
      ).length;
      const winRate = totalClosed > 0 ? (closedWon / totalClosed) * 100 : 0;
      const activeOpps = opportunities.filter(opp => 
        !['closed-won', 'closed-lost'].includes(opp.stage)
      ).length;

      setMetrics({
        totalSales,
        targetAchievement: 85, // This would come from targets table
        activeOpportunities: activeOpps,
        winRate,
        monthlyGrowth: 12.5 // This would be calculated from historical data
      });

      // Calculate regional sales data
      if (regions.length > 0) {
        const regionColors = ['bg-purple-500', 'bg-blue-500', 'bg-green-500', 'bg-orange-500'];
        const regionSales = regions.map((region, index) => {
          // In a real implementation, you'd calculate actual sales by region
          // For now, we'll show empty data since we don't have region-specific sales data
          return {
            region: region.name,
            sales: 0,
            percentage: 0,
            color: regionColors[index % regionColors.length]
          };
        });
        setSalesByRegion(regionSales);
      } else {
        setSalesByRegion([]);
      }

      // Calculate surgeon sales data
      if (surgeons.length > 0) {
        const surgeonSales = surgeons.slice(0, 5).map(surgeon => {
          // In a real implementation, you'd calculate actual sales by surgeon
          return {
            surgeon: `Dr. ${surgeon.first_name} ${surgeon.last_name}`,
            sales: 0,
            cases: 0
          };
        });
        setSalesBySurgeon(surgeonSales);
      } else {
        setSalesBySurgeon([]);
      }

      // Calculate rep leaderboard
      if (reps.length > 0) {
        const repLeaderboard = reps.slice(0, 5).map((rep, index) => {
          // In a real implementation, you'd calculate actual sales by rep
          return {
            rank: index + 1,
            rep: `${rep.first_name} ${rep.last_name}`,
            sales: 0,
            target: rep.target_annual || 300000,
            achievement: 0
          };
        });
        setLeaderboard(repLeaderboard);
      } else {
        setLeaderboard([]);
      }

      // Generate weekly trend data (placeholder for now)
      const weeks = [];
      for (let i = 6; i >= 1; i--) {
        weeks.push({
          week: `Week ${7-i}`,
          sales: 0 // Would be calculated from actual transaction data
        });
      }
      setWeeklyTrend(weeks);

      // Show status message
      const unavailableTables = tablesToCheck.filter(table => availableTables[table] === false);
      if (unavailableTables.length > 0) {
        console.warn(`Dashboard running with limited functionality. Missing tables: ${unavailableTables.join(', ')}`);
      } else {
        console.log('Dashboard loaded successfully with all tables available');
      }

      setInitialCheckDone(true);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Dashboard temporarily unavailable. Some database tables may not be configured yet.');
      
      // Set empty data on error instead of sample data
      setMetrics({
        totalSales: 0,
        targetAchievement: 0,
        activeOpportunities: 0,
        winRate: 0,
        monthlyGrowth: 0
      });
      setSalesByRegion([]);
      setSalesBySurgeon([]);
      setLeaderboard([]);
      setWeeklyTrend([]);
      setInitialCheckDone(true);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to fetch table data safely
  const fetchTableData = async (tableName: string, orderBy?: string) => {
    try {
      let query = supabase.from(tableName).select('*');
      if (orderBy) {
        query = query.order(orderBy, { ascending: false });
      }
      const result = await query;
      return result.data || [];
    } catch (error) {
      console.warn(`Failed to fetch data from ${tableName}:`, error);
      return [];
    }
  };

  // Helper function to fetch table data with filter
  const fetchTableDataWithFilter = async (tableName: string, filterColumn: string, filterValue: any) => {
    try {
      const result = await supabase
        .from(tableName)
        .select('*')
        .eq(filterColumn, filterValue);
      return result.data || [];
    } catch (error) {
      console.warn(`Failed to fetch filtered data from ${tableName}:`, error);
      return [];
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-yellow-500 text-white';
      case 2: return 'bg-gray-400 text-white';
      case 3: return 'bg-orange-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  if (error) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
          <div className="text-red-400 mb-4">{error}</div>
          <button onClick={loadDashboardData} className="btn-primary">
            <RefreshCw size={18} className="mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-white">Sales Dashboard</h3>
          <p className="text-gray-400 mt-1">Real-time performance insights and analytics</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="input-field w-48"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button 
            onClick={loadDashboardData}
            className="btn-secondary flex items-center space-x-2"
            disabled={loading}
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button className="btn-primary">Export Report</button>
        </div>
      </div>

      {loading && (
        <div className="card">
          <div className="text-center py-8">
            <div className="text-gray-400">Loading dashboard data...</div>
          </div>
        </div>
      )}

      {!loading && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card bg-gradient-to-br from-green-900/20 to-green-800/10 border-green-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-300 text-sm font-medium mb-1">Total Sales</p>
                  <p className="text-3xl font-bold text-white mb-2">{formatCurrency(metrics.totalSales)}</p>
                  <div className="flex items-center space-x-1">
                    <TrendingUp size={14} className="text-green-400" />
                    <span className="text-sm text-green-400">+{metrics.monthlyGrowth}%</span>
                    <span className="text-sm text-gray-400">vs last {selectedPeriod}</span>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-green-500/20">
                  <DollarSign size={32} className="text-green-400" />
                </div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-blue-900/20 to-blue-800/10 border-blue-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-300 text-sm font-medium mb-1">Target Achievement</p>
                  <p className="text-3xl font-bold text-white mb-2">{metrics.targetAchievement}%</p>
                  <div className="flex items-center space-x-1">
                    <TrendingUp size={14} className="text-blue-400" />
                    <span className="text-sm text-blue-400">+5%</span>
                    <span className="text-sm text-gray-400">vs last {selectedPeriod}</span>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-blue-500/20">
                  <Target size={32} className="text-blue-400" />
                </div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-purple-900/20 to-purple-800/10 border-purple-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-300 text-sm font-medium mb-1">Active Opportunities</p>
                  <p className="text-3xl font-bold text-white mb-2">{metrics.activeOpportunities}</p>
                  <div className="flex items-center space-x-1">
                    <TrendingUp size={14} className="text-purple-400" />
                    <span className="text-sm text-purple-400">+3</span>
                    <span className="text-sm text-gray-400">vs last {selectedPeriod}</span>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-purple-500/20">
                  <TrendingUp size={32} className="text-purple-400" />
                </div>
              </div>
            </div>

            <div className="card bg-gradient-to-br from-orange-900/20 to-orange-800/10 border-orange-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-300 text-sm font-medium mb-1">Win Rate</p>
                  <p className="text-3xl font-bold text-white mb-2">{metrics.winRate.toFixed(1)}%</p>
                  <div className="flex items-center space-x-1">
                    <TrendingUp size={14} className="text-orange-400" />
                    <span className="text-sm text-orange-400">+12%</span>
                    <span className="text-sm text-gray-400">vs last {selectedPeriod}</span>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-orange-500/20">
                  <Award size={32} className="text-orange-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Sales by Region */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <Building2 size={24} className="text-purple-400" />
                  <h4 className="text-lg font-semibold text-white">Sales by Region</h4>
                </div>
                <span className="text-sm text-gray-400">Last 30 days</span>
              </div>
              {salesByRegion.length > 0 ? (
                <div className="space-y-4">
                  {salesByRegion.map((region, index) => (
                    <div key={index} className="group">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white font-medium">{region.region}</span>
                        <span className="text-gray-300 font-semibold">{formatCurrency(region.sales)}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                        <div 
                          className={`h-3 rounded-full ${region.color} transition-all duration-1000 ease-out`}
                          style={{ width: `${region.percentage}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm text-gray-400">{region.percentage}% of total sales</span>
                        <span className="text-xs text-green-400">No sales data yet</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Building2 size={48} className="mx-auto mb-4 text-gray-600" />
                  <div className="text-sm">No regional data available</div>
                  <div className="text-xs text-gray-600 mt-1">Regions will appear once configured</div>
                </div>
              )}
            </div>

            {/* Weekly Trend Chart */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <TrendingUp size={24} className="text-blue-400" />
                  <h4 className="text-lg font-semibold text-white">Weekly Sales Trend</h4>
                </div>
                <span className="text-sm text-gray-400">Last 6 weeks</span>
              </div>
              {weeklyTrend.length > 0 ? (
                <div className="h-64 bg-gray-800/50 rounded-xl flex items-end justify-between p-6 border border-gray-700">
                  {weeklyTrend.map((week, index) => {
                    const maxSales = Math.max(...weeklyTrend.map(w => w.sales), 1);
                    const height = weeklyTrend.every(w => w.sales === 0) ? 10 : (week.sales / maxSales) * 100;
                    
                    return (
                      <div key={index} className="flex flex-col items-center space-y-3 group cursor-pointer">
                        <div className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 px-2 py-1 rounded">
                          {formatCurrency(week.sales)}
                        </div>
                        <div 
                          className="w-10 bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-lg transition-all duration-700 ease-out hover:shadow-lg hover:shadow-purple-500/50"
                          style={{ height: `${height}%`, minHeight: '4px' }}
                        ></div>
                        <div className="text-xs text-gray-400 transform -rotate-45 origin-center">
                          {week.week}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <TrendingUp size={48} className="mx-auto mb-4 text-gray-600" />
                  <div className="text-sm">No trend data available</div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Surgeons */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <Users size={24} className="text-green-400" />
                  <h4 className="text-lg font-semibold text-white">Top Surgeons by Sales</h4>
                </div>
                <span className="text-sm text-gray-400">This month</span>
              </div>
              {salesBySurgeon.length > 0 ? (
                <div className="space-y-3">
                  {salesBySurgeon.map((surgeon, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-green-500/50 transition-colors group">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-800 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">{index + 1}</span>
                        </div>
                        <div>
                          <div className="text-white font-semibold group-hover:text-green-300 transition-colors">
                            {surgeon.surgeon}
                          </div>
                          <div className="text-gray-400 text-sm">{surgeon.cases} cases completed</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-400 font-bold text-lg">{formatCurrency(surgeon.sales)}</div>
                        <div className="text-xs text-gray-400">sales generated</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users size={48} className="mx-auto mb-4 text-gray-600" />
                  <div className="text-sm">No surgeon data available</div>
                  <div className="text-xs text-gray-600 mt-1">Surgeon sales will appear once tracked</div>
                </div>
              )}
            </div>

            {/* Rep Leaderboard */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <Award size={24} className="text-yellow-400" />
                  <h4 className="text-lg font-semibold text-white">Rep Leaderboard</h4>
                </div>
                <span className="text-sm text-gray-400">This quarter</span>
              </div>
              {leaderboard.length > 0 ? (
                <div className="space-y-3">
                  {leaderboard.map((rep) => (
                    <div key={rep.rank} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-yellow-500/50 transition-colors group">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 ${getRankBadgeColor(rep.rank)} rounded-full flex items-center justify-center shadow-lg`}>
                          <span className="text-sm font-bold">{rep.rank}</span>
                        </div>
                        <div>
                          <div className="text-white font-semibold group-hover:text-yellow-300 transition-colors">
                            {rep.rep}
                          </div>
                          <div className="text-gray-400 text-sm">
                            {formatCurrency(rep.sales)} / {formatCurrency(rep.target)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold text-lg ${rep.achievement >= 100 ? 'text-green-400' : rep.achievement >= 90 ? 'text-yellow-400' : 'text-orange-400'}`}>
                          {rep.achievement}%
                        </div>
                        <div className="text-gray-400 text-xs">achievement</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Award size={48} className="mx-auto mb-4 text-gray-600" />
                  <div className="text-sm">No rep data available</div>
                  <div className="text-xs text-gray-600 mt-1">Rep leaderboard will appear once configured</div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}