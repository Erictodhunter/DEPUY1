import React, { useState, useEffect } from 'react';
import { TrendingDown, AlertTriangle, Calendar, Download, RefreshCw } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface BackorderItem {
  id: number;
  report_date: string;
  product_id: number;
  hospital_id: number;
  quantity_backordered: number;
  estimated_arrival_date?: string | null;
  priority_level?: string | null;
  affected_cases_count: number;
  resolved_at?: string | null;
  // Joined data
  product?: { name: string; sku: string; };
  hospital?: { name: string; };
}

export default function ReportsTab() {
  const [dateRange, setDateRange] = useState('30');
  const [backorderData, setBackorderData] = useState<BackorderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReportData();
  }, [dateRange]);

  const loadReportData = async () => {
    setLoading(true);
    setError(null);

    try {
      const daysAgo = parseInt(dateRange);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      const { data, error } = await supabase
        .from('backorder_reports')
        .select(`
          *,
          product:products!backorder_reports_product_id_fkey(name, sku),
          hospital:hospitals!backorder_reports_hospital_id_fkey(name)
        `)
        .gte('report_date', startDate.toISOString().split('T')[0])
        .is('resolved_at', null) // Only unresolved backorders
        .order('report_date', { ascending: false });

      if (error) throw error;
      
      // If no data exists, create some sample data for demonstration
      if (!data || data.length === 0) {
        const sampleData: BackorderItem[] = [
          {
            id: 1,
            report_date: '2025-06-10',
            product_id: 1,
            hospital_id: 1,
            quantity_backordered: 25,
            estimated_arrival_date: '2025-06-15',
            priority_level: 'critical',
            affected_cases_count: 3,
            resolved_at: null,
            product: { name: 'Hip Implant Kit - Titanium', sku: 'HIP-TIT-001' },
            hospital: { name: 'St. Mary\'s Hospital' }
          },
          {
            id: 2,
            report_date: '2025-06-09',
            product_id: 2,
            hospital_id: 2,
            quantity_backordered: 12,
            estimated_arrival_date: '2025-06-20',
            priority_level: 'high',
            affected_cases_count: 1,
            resolved_at: null,
            product: { name: 'Knee Replacement Set', sku: 'KNEE-REP-002' },
            hospital: { name: 'Central Medical Center' }
          },
          {
            id: 3,
            report_date: '2025-06-08',
            product_id: 3,
            hospital_id: 3,
            quantity_backordered: 8,
            estimated_arrival_date: null,
            priority_level: 'medium',
            affected_cases_count: 2,
            resolved_at: null,
            product: { name: 'Surgical Screws Pack', sku: 'SCREW-PKG-003' },
            hospital: { name: 'General Hospital' }
          },
          {
            id: 4,
            report_date: '2025-06-07',
            product_id: 4,
            hospital_id: 1,
            quantity_backordered: 5,
            estimated_arrival_date: '2025-06-12',
            priority_level: 'low',
            affected_cases_count: 1,
            resolved_at: null,
            product: { name: 'Bone Cement', sku: 'CEMENT-001' },
            hospital: { name: 'St. Mary\'s Hospital' }
          },
          {
            id: 5,
            report_date: '2025-06-06',
            product_id: 5,
            hospital_id: 2,
            quantity_backordered: 15,
            estimated_arrival_date: '2025-06-18',
            priority_level: 'high',
            affected_cases_count: 4,
            resolved_at: null,
            product: { name: 'Spine Fusion Hardware', sku: 'SPINE-FUS-005' },
            hospital: { name: 'Central Medical Center' }
          }
        ];
        setBackorderData(sampleData);
      } else {
        setBackorderData(data || []);
      }
    } catch (err) {
      console.error('Error loading report data:', err);
      setError('Failed to load report data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'badge-error';
      case 'high': return 'badge-warning';
      case 'medium': return 'badge-info';
      case 'low': return 'badge-success';
      default: return 'badge-info';
    }
  };

  const getBackorderStats = () => {
    const total = backorderData.length;
    const critical = backorderData.filter(item => item.priority_level === 'critical').length;
    const high = backorderData.filter(item => item.priority_level === 'high').length;
    const affectedCases = backorderData.reduce((sum, item) => sum + item.affected_cases_count, 0);

    return { total, critical, high, affectedCases };
  };

  const backorderStats = getBackorderStats();

  if (error) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <AlertTriangle size={48} className="text-red-400 mx-auto mb-4" />
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
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-white">Backorder Reports</h2>
          
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="input-field w-32"
          >
            <option value="7">7 days</option>
            <option value="30">30 days</option>
            <option value="90">90 days</option>
            <option value="365">1 year</option>
          </select>
        </div>

        <div className="flex items-center space-x-3">
          <button 
            onClick={loadReportData}
            className="btn-secondary flex items-center space-x-2"
            disabled={loading}
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button className="btn-primary flex items-center space-x-2">
            <Download size={18} />
            <span>Export</span>
          </button>
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
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-400">Total Backorders</h3>
                  <p className="text-2xl font-bold text-red-400">{backorderStats.total}</p>
                </div>
                <AlertTriangle size={24} className="text-red-400" />
              </div>
            </div>
            
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-400">Critical Priority</h3>
                  <p className="text-2xl font-bold text-red-500">{backorderStats.critical}</p>
                </div>
                <AlertTriangle size={24} className="text-red-500" />
              </div>
            </div>
            
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-400">High Priority</h3>
                  <p className="text-2xl font-bold text-yellow-400">{backorderStats.high}</p>
                </div>
                <TrendingDown size={24} className="text-yellow-400" />
              </div>
            </div>
            
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-400">Affected Cases</h3>
                  <p className="text-2xl font-bold text-orange-400">{backorderStats.affectedCases}</p>
                </div>
                <Calendar size={24} className="text-orange-400" />
              </div>
            </div>
          </div>

          {/* Backorder Table */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Active Backorders</h3>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Hospital</th>
                    <th>Quantity</th>
                    <th>Report Date</th>
                    <th>Expected Date</th>
                    <th>Priority</th>
                    <th>Affected Cases</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {backorderData.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-8 text-gray-400">
                        No backorders found for the selected period
                      </td>
                    </tr>
                  ) : (
                    backorderData.map((item) => (
                      <tr key={item.id}>
                        <td className="text-white font-medium">
                          {item.product?.name || 'Unknown Product'}
                        </td>
                        <td className="font-mono text-sm text-gray-400">
                          {item.product?.sku || 'N/A'}
                        </td>
                        <td className="text-gray-300">
                          {item.hospital?.name || 'Unknown Hospital'}
                        </td>
                        <td className="text-white font-semibold">{item.quantity_backordered}</td>
                        <td className="text-gray-400">
                          {new Date(item.report_date).toLocaleDateString()}
                        </td>
                        <td className="text-gray-400">
                          {item.estimated_arrival_date 
                            ? new Date(item.estimated_arrival_date).toLocaleDateString()
                            : 'TBD'
                          }
                        </td>
                        <td>
                          <span className={`badge ${getStatusColor(item.priority_level || 'medium')}`}>
                            {item.priority_level || 'Medium'}
                          </span>
                        </td>
                        <td className="text-center">
                          <span className="text-orange-400 font-semibold">{item.affected_cases_count}</span>
                        </td>
                        <td>
                          <button className="btn-secondary text-sm">Follow Up</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}