import React, { useState, useEffect } from 'react';
import { Download, Calendar, Filter, TrendingUp, BarChart3, FileText, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface ReportData {
  totalSales: number;
  growth: number;
  deals: number;
  avgDealSize: number;
  topProducts?: Array<{
    name: string;
    sales: number;
    percentage: number;
  }>;
  stageBreakdown?: Array<{
    stage: string;
    count: number;
    value: number;
  }>;
}

export default function ReportsTab() {
  const [selectedReport, setSelectedReport] = useState('sales-summary');
  const [dateRange, setDateRange] = useState('month');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<Record<string, ReportData>>({});
  
  // Track table availability to prevent repeated failed requests
  const [tablesAvailable, setTablesAvailable] = useState<Record<string, boolean>>({});
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  const reportTypes = [
    { 
      id: 'sales-summary', 
      label: 'Sales Summary', 
      description: 'Overview of sales performance and trends',
      icon: BarChart3,
      color: 'text-green-400'
    },
    { 
      id: 'pipeline', 
      label: 'Pipeline Report', 
      description: 'Detailed analysis of sales opportunities',
      icon: TrendingUp,
      color: 'text-blue-400'
    },
    { 
      id: 'performance', 
      label: 'Rep Performance', 
      description: 'Individual representative performance metrics',
      icon: FileText,
      color: 'text-purple-400'
    },
    { 
      id: 'territory', 
      label: 'Territory Analysis', 
      description: 'Regional and territory-based insights',
      icon: Filter,
      color: 'text-orange-400'
    },
    { 
      id: 'forecast', 
      label: 'Sales Forecast', 
      description: 'Predictive analysis and projections',
      icon: Calendar,
      color: 'text-yellow-400'
    }
  ];

  useEffect(() => {
    loadReportData();
  }, [dateRange, selectedRegion]);

  const loadReportData = async () => {
    // Prevent multiple simultaneous checks
    if (loading && !initialCheckDone) return;
    
    setLoading(true);
    setError(null);

    try {
      // Check which tables are available before making requests
      const tablesToCheck = ['sales_opportunities', 'sales_transactions'];
      const availableTables: Record<string, boolean> = { ...tablesAvailable };
      
      // Check localStorage cache first
      const cacheKey = 'reports_tables_available';
      const cachedData = localStorage.getItem(cacheKey);
      
      if (cachedData && Object.keys(availableTables).length === 0) {
        try {
          const parsed = JSON.parse(cachedData);
          Object.assign(availableTables, parsed);
          console.log('Using cached report table availability data');
        } catch (e) {
          console.warn('Failed to parse cached report table data');
        }
      }
      
      // Only check tables we haven't checked before or that were previously unavailable
      const tablesToTest = tablesToCheck.filter(table => availableTables[table] !== true && availableTables[table] !== false);
      
      if (tablesToTest.length > 0) {
        console.log('Checking availability of report tables:', tablesToTest);
        
        // Check each table individually with proper error handling
        for (const table of tablesToTest) {
          try {
            const result = await supabase.from(table).select('id').limit(1);
            availableTables[table] = !result.error;
            if (!result.error) {
              console.log(`✓ Report table ${table} is available`);
            } else {
              console.warn(`✗ Report table ${table} is not available`);
            }
          } catch (fetchError) {
            // Network error or other issue - mark as unavailable
            availableTables[table] = false;
            console.warn(`✗ Report table ${table} is not available (network error)`);
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

      // Calculate real metrics from database data
      const totalSales = sales.reduce((sum, sale) => sum + (sale.amount || 0), 0);
      const dealsCount = opportunities.length;
      const avgDealSize = dealsCount > 0 ? totalSales / dealsCount : 0;
      const closedWon = opportunities.filter(opp => opp.stage === 'closed-won').length;
      const totalClosed = opportunities.filter(opp => 
        opp.stage === 'closed-won' || opp.stage === 'closed-lost'
      ).length;

      const baseData: ReportData = {
        totalSales,
        growth: 0, // Would be calculated from historical data
        deals: dealsCount,
        avgDealSize
      };

      // Calculate stage breakdown for pipeline report
      const stages = ['lead', 'qualified', 'proposal', 'negotiation', 'closed-won'];
      const stageBreakdown = stages.map(stage => {
        const stageOpps = opportunities.filter(opp => opp.stage === stage);
        return {
          stage: stage.charAt(0).toUpperCase() + stage.slice(1).replace('-', ' '),
          count: stageOpps.length,
          value: stageOpps.reduce((sum, opp) => sum + (opp.estimated_value || 0), 0)
        };
      });

      // Calculate product line breakdown (placeholder since we don't have product data yet)
      const topProducts = sales.length > 0 ? [] : [];

      setReportData({
        'sales-summary': { 
          ...baseData, 
          topProducts: topProducts.length > 0 ? topProducts : []
        },
        'pipeline': { 
          ...baseData, 
          stageBreakdown: stageBreakdown.filter(stage => stage.count > 0)
        },
        'performance': baseData,
        'territory': baseData,
        'forecast': baseData
      });

      // Show status message
      const unavailableTables = tablesToCheck.filter(table => availableTables[table] === false);
      if (unavailableTables.length > 0) {
        console.warn(`Reports running with limited functionality. Missing tables: ${unavailableTables.join(', ')}`);
      } else {
        console.log('Reports loaded successfully with all tables available');
      }

      setInitialCheckDone(true);
    } catch (err) {
      console.error('Error loading report data:', err);
      setError('Reports temporarily unavailable. Some database tables may not be configured yet.');
      
      // Set empty data on error
      const emptyData: ReportData = {
        totalSales: 0,
        growth: 0,
        deals: 0,
        avgDealSize: 0
      };
      
      setReportData({
        'sales-summary': { ...emptyData, topProducts: [] },
        'pipeline': { ...emptyData, stageBreakdown: [] },
        'performance': emptyData,
        'territory': emptyData,
        'forecast': emptyData
      });
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

  const getCurrentReportData = (): ReportData => {
    return reportData[selectedReport] || {
      totalSales: 0,
      growth: 0,
      deals: 0,
      avgDealSize: 0
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const exportReport = (format: string) => {
    alert(`Exporting ${selectedReport} report as ${format}. This feature is coming soon!`);
  };

  if (error) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
          <div className="text-red-400 mb-4">{error}</div>
          <button onClick={loadReportData} className="btn-primary">
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
          <h3 className="text-2xl font-bold text-white">Sales Reports</h3>
          <p className="text-gray-400 mt-1">Comprehensive analytics and business intelligence</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="input-field w-48"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
            <option value="custom">Custom Range</option>
          </select>
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="input-field w-48"
          >
            <option value="all">All Regions</option>
            <option value="northeast">Northeast</option>
            <option value="central">Central</option>
            <option value="southwest">Southwest</option>
            <option value="pacific">Pacific</option>
          </select>
          <button 
            onClick={loadReportData}
            className="btn-secondary flex items-center space-x-2"
            disabled={loading}
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => exportReport('csv')}
              className="btn-secondary flex items-center space-x-2"
            >
              <Download size={18} />
              <span>CSV</span>
            </button>
            <button 
              onClick={() => exportReport('pdf')}
              className="btn-primary flex items-center space-x-2"
            >
              <Download size={18} />
              <span>PDF</span>
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="card">
          <div className="text-center py-8">
            <div className="text-gray-400">Loading report data...</div>
          </div>
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Report Type Selector */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold flex items-center space-x-2">
              <FileText size={20} />
              <span>Report Types</span>
            </h4>
            {reportTypes.map((report) => {
              const IconComponent = report.icon;
              return (
                <button
                  key={report.id}
                  onClick={() => setSelectedReport(report.id)}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-200 border ${
                    selectedReport === report.id 
                      ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-purple-500 text-white shadow-lg' 
                      : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700/50 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <IconComponent size={20} className={selectedReport === report.id ? report.color : 'text-gray-400'} />
                    <div className="font-semibold">{report.label}</div>
                  </div>
                  <div className="text-sm opacity-80">{report.description}</div>
                </button>
              );
            })}
          </div>

          {/* Report Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Key Metrics for Current Report */}
            <div className="grid grid-cols-4 gap-6">
              <div className="card bg-gradient-to-br from-green-900/20 to-green-800/10 border-green-500/30">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-1">
                    {formatCurrency(getCurrentReportData().totalSales)}
                  </div>
                  <div className="text-sm text-green-300 font-medium">Total Sales</div>
                  <div className="text-green-400 text-sm mt-1">+{getCurrentReportData().growth}%</div>
                </div>
              </div>
              <div className="card bg-gradient-to-br from-blue-900/20 to-blue-800/10 border-blue-500/30">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-1">{getCurrentReportData().deals}</div>
                  <div className="text-sm text-blue-300 font-medium">Total Deals</div>
                  <div className="text-blue-400 text-sm mt-1">Active pipeline</div>
                </div>
              </div>
              <div className="card bg-gradient-to-br from-purple-900/20 to-purple-800/10 border-purple-500/30">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-1">
                    {formatCurrency(getCurrentReportData().avgDealSize)}
                  </div>
                  <div className="text-sm text-purple-300 font-medium">Avg Deal Size</div>
                  <div className="text-purple-400 text-sm mt-1">Per opportunity</div>
                </div>
              </div>
              <div className="card bg-gradient-to-br from-orange-900/20 to-orange-800/10 border-orange-500/30">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-400 mb-1">
                    {getCurrentReportData().deals > 0 ? '0%' : '0%'}
                  </div>
                  <div className="text-sm text-orange-300 font-medium">Win Rate</div>
                  <div className="text-orange-400 text-sm mt-1">Success ratio</div>
                </div>
              </div>
            </div>

            {/* Report-Specific Content */}
            {selectedReport === 'sales-summary' && (
              <div className="card">
                <div className="flex items-center space-x-3 mb-6">
                  <BarChart3 size={24} className="text-green-400" />
                  <h4 className="text-xl font-semibold text-white">Sales by Product Line</h4>
                </div>
                {getCurrentReportData().topProducts && getCurrentReportData().topProducts!.length > 0 ? (
                  <div className="space-y-6">
                    {getCurrentReportData().topProducts!.map((product, index) => (
                      <div key={index} className="group">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-white font-semibold text-lg">{product.name}</span>
                          <span className="text-green-400 font-bold text-lg">{formatCurrency(product.sales)}</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                          <div 
                            className="h-4 rounded-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-1000 ease-out"
                            style={{ width: `${product.percentage}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm text-gray-400">{product.percentage}% of total sales</span>
                          <span className="text-xs text-green-400">+12% vs last period</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <BarChart3 size={64} className="mx-auto mb-4 text-gray-600" />
                    <div className="text-lg font-medium text-white mb-2">No Product Data Available</div>
                    <p className="text-gray-400 max-w-md mx-auto">
                      Product line breakdown will appear once sales transactions include product information.
                    </p>
                  </div>
                )}
              </div>
            )}

            {selectedReport === 'pipeline' && (
              <div className="card">
                <div className="flex items-center space-x-3 mb-6">
                  <TrendingUp size={24} className="text-blue-400" />
                  <h4 className="text-xl font-semibold text-white">Pipeline Stage Analysis</h4>
                </div>
                {getCurrentReportData().stageBreakdown && getCurrentReportData().stageBreakdown!.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {getCurrentReportData().stageBreakdown!.map((stage, index) => (
                      <div key={index} className="card bg-gray-800/50 border-gray-600">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-400 mb-2">{stage.count}</div>
                          <div className="text-sm text-white font-medium mb-1">{stage.stage}</div>
                          <div className="text-xs text-gray-400">{formatCurrency(stage.value)}</div>
                          <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
                            <div 
                              className="h-2 rounded-full bg-blue-500"
                              style={{ width: `${stage.count > 0 ? Math.max((stage.count / Math.max(...getCurrentReportData().stageBreakdown!.map(s => s.count))) * 100, 10) : 0}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <TrendingUp size={64} className="mx-auto mb-4 text-gray-600" />
                    <div className="text-lg font-medium text-white mb-2">No Pipeline Data Available</div>
                    <p className="text-gray-400 max-w-md mx-auto">
                      Pipeline analysis will appear once opportunities are created and staged.
                    </p>
                  </div>
                )}
              </div>
            )}

            {(selectedReport === 'performance' || selectedReport === 'territory' || selectedReport === 'forecast') && (
              <div className="card">
                <div className="text-center py-12">
                  <FileText size={64} className="text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {reportTypes.find(r => r.id === selectedReport)?.label} Report
                  </h3>
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <span className="px-4 py-2 bg-orange-500/20 border border-orange-500/30 rounded-full text-orange-300 text-sm font-medium">
                      Coming Soon
                    </span>
                  </div>
                  <p className="text-gray-400 max-w-md mx-auto">
                    Advanced {reportTypes.find(r => r.id === selectedReport)?.label.toLowerCase()} analytics and detailed insights will be available in the next update.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}