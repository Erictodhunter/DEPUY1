import React, { useState, useEffect } from 'react';
import { Plus, DollarSign, Calendar, User, Building2, TrendingUp, RefreshCw, AlertCircle, Edit, Eye } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface Opportunity {
  id: number;
  title: string;
  hospital_id: number;
  surgeon_id: number;
  estimated_value: number;
  stage: string;
  probability: number;
  expected_close_date: string;
  rep_id: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  hospital?: { name: string; };
  surgeon?: { first_name: string; last_name: string; };
  rep?: { first_name: string; last_name: string; };
}

export default function PipelineTab() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewOpportunity, setShowNewOpportunity] = useState(false);
  
  // Track table availability to prevent repeated failed requests
  const [tableAvailable, setTableAvailable] = useState<boolean | null>(null);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  const pipelineStages = [
    { id: 'lead', title: 'Lead', color: 'bg-gray-600' },
    { id: 'qualified', title: 'Qualified', color: 'bg-blue-600' },
    { id: 'proposal', title: 'Proposal', color: 'bg-yellow-600' },
    { id: 'negotiation', title: 'Negotiation', color: 'bg-orange-600' },
    { id: 'closed-won', title: 'Closed Won', color: 'bg-green-600' },
    { id: 'closed-lost', title: 'Closed Lost', color: 'bg-red-600' }
  ];

  useEffect(() => {
    loadOpportunities();
  }, []);

  // Reset cache function for testing (can be called from console)
  const resetTableCache = () => {
    localStorage.removeItem('sales_opportunities_table_available');
    setTableAvailable(null);
    setInitialCheckDone(false);
    console.log('Pipeline table cache cleared');
  };

  // Expose reset function globally for testing
  useEffect(() => {
    (window as any).resetPipelineCache = resetTableCache;
    return () => {
      delete (window as any).resetPipelineCache;
    };
  }, []);

  const loadOpportunities = async () => {
    // Prevent multiple simultaneous checks
    if (loading && !initialCheckDone) return;
    
    // Check localStorage for cached availability
    const cacheKey = 'sales_opportunities_table_available';
    const cachedAvailability = localStorage.getItem(cacheKey);
    
    // If we already know the table doesn't exist, don't try again
    if (tableAvailable === false || cachedAvailability === 'false') {
      setOpportunities([]);
      setLoading(false);
      setError('Sales opportunities database table is not configured yet.');
      setInitialCheckDone(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // If we haven't checked availability yet or cache says it's available
      if (tableAvailable === null && cachedAvailability !== 'true') {
        console.log('Checking sales opportunities table availability...');
        
        // Use a try-catch to suppress 404 errors in console
        let testResult;
        try {
          testResult = await supabase
            .from('sales_opportunities')
            .select('id')
            .limit(1);
        } catch (fetchError) {
          // Completely suppress network errors
          testResult = { error: { message: 'Table not found' } };
        }
        
        if (testResult.error) {
          // Table doesn't exist - cache this result
          console.warn('Sales opportunities table not available - will not retry');
          setTableAvailable(false);
          localStorage.setItem(cacheKey, 'false');
          setOpportunities([]);
          setError('Sales opportunities database table is not configured yet.');
          setInitialCheckDone(true);
          return;
        }
        
        // Table exists - cache this result
        console.log('Sales opportunities table is available');
        setTableAvailable(true);
        localStorage.setItem(cacheKey, 'true');
      }

      // Now make the full query with relationships
      let finalResult;
      try {
        finalResult = await supabase
          .from('sales_opportunities')
          .select(`
            *,
            hospital:hospitals!sales_opportunities_hospital_id_fkey(name),
            surgeon:surgeons!sales_opportunities_surgeon_id_fkey(first_name, last_name),
            rep:sales_reps!sales_opportunities_rep_id_fkey(first_name, last_name)
          `)
          .order('created_at', { ascending: false });
      } catch (fetchError) {
        finalResult = { error: { message: 'Relationship query failed' } };
      }

      if (finalResult.error) {
        // If relationship query fails, try without relationships
        console.warn('Relationship query failed, trying basic query');
        
        try {
          const basicResult = await supabase
            .from('sales_opportunities')
            .select('*')
            .order('created_at', { ascending: false });
            
          if (basicResult.error) {
            throw basicResult.error;
          }
          
          setOpportunities(basicResult.data || []);
        } catch (basicError) {
          throw basicError;
        }
      } else {
        // Set the actual data (which may be empty)
        setOpportunities(finalResult.data || []);
      }
      
      setInitialCheckDone(true);
    } catch (err) {
      console.error('Error loading opportunities:', err);
      setTableAvailable(false);
      localStorage.setItem(cacheKey, 'false');
      setError('Pipeline temporarily unavailable. Sales opportunities table may not be configured yet.');
      setOpportunities([]);
      setInitialCheckDone(true);
    } finally {
      setLoading(false);
    }
  };

  const getOpportunitiesByStage = (stageId: string) => {
    return opportunities.filter(opp => opp.stage === stageId);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 75) return 'text-green-400';
    if (probability >= 50) return 'text-yellow-400';
    if (probability >= 25) return 'text-orange-400';
    return 'text-red-400';
  };

  const getMetrics = () => {
    const totalPipeline = opportunities.reduce((sum, opp) => sum + opp.estimated_value, 0);
    const weightedPipeline = opportunities.reduce((sum, opp) => sum + (opp.estimated_value * opp.probability / 100), 0);
    const avgDealSize = opportunities.length > 0 ? totalPipeline / opportunities.length : 0;
    const closedWon = opportunities.filter(opp => opp.stage === 'closed-won');
    const totalClosed = opportunities.filter(opp => opp.stage === 'closed-won' || opp.stage === 'closed-lost');
    const winRate = totalClosed.length > 0 ? (closedWon.length / totalClosed.length) * 100 : 0;

    return { totalPipeline, weightedPipeline, avgDealSize, winRate };
  };

  const metrics = getMetrics();

  if (error) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
          <div className="text-red-400 mb-4">{error}</div>
          <button onClick={loadOpportunities} className="btn-primary">
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
        <div className="grid grid-cols-4 gap-4 flex-1 mr-6">
          <div className="card bg-gradient-to-br from-purple-900/20 to-purple-800/10 border-purple-500/30">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-purple-300">Total Pipeline</h3>
                <p className="text-2xl font-bold text-purple-400">{formatCurrency(metrics.totalPipeline)}</p>
                <p className="text-xs text-gray-400 mt-1">{opportunities.length} opportunities</p>
              </div>
              <DollarSign size={24} className="text-purple-400" />
            </div>
          </div>
          
          <div className="card bg-gradient-to-br from-blue-900/20 to-blue-800/10 border-blue-500/30">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-blue-300">Weighted Pipeline</h3>
                <p className="text-2xl font-bold text-blue-400">{formatCurrency(metrics.weightedPipeline)}</p>
                <p className="text-xs text-gray-400 mt-1">Probability adjusted</p>
              </div>
              <TrendingUp size={24} className="text-blue-400" />
            </div>
          </div>
          
          <div className="card bg-gradient-to-br from-green-900/20 to-green-800/10 border-green-500/30">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-green-300">Avg Deal Size</h3>
                <p className="text-2xl font-bold text-green-400">{formatCurrency(metrics.avgDealSize)}</p>
                <p className="text-xs text-gray-400 mt-1">Per opportunity</p>
              </div>
              <DollarSign size={24} className="text-green-400" />
            </div>
          </div>
          
          <div className="card bg-gradient-to-br from-orange-900/20 to-orange-800/10 border-orange-500/30">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-orange-300">Win Rate</h3>
                <p className="text-2xl font-bold text-orange-400">{metrics.winRate.toFixed(1)}%</p>
                <p className="text-xs text-gray-400 mt-1">Closed opportunities</p>
              </div>
              <TrendingUp size={24} className="text-orange-400" />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button 
            onClick={loadOpportunities}
            className="btn-secondary flex items-center space-x-2"
            disabled={loading}
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button 
            onClick={() => setShowNewOpportunity(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>New Opportunity</span>
          </button>
        </div>
      </div>

      {loading && (
        <div className="card">
          <div className="text-center py-8">
            <div className="text-gray-400">Loading pipeline data...</div>
          </div>
        </div>
      )}

      {!loading && (
        <>
          {/* Kanban Board */}
          <div className="grid grid-cols-6 gap-4 h-[600px]">
            {pipelineStages.map((stage) => {
              const stageOpportunities = getOpportunitiesByStage(stage.id);
              const stageValue = stageOpportunities.reduce((sum, opp) => sum + opp.estimated_value, 0);
              
              return (
                <div key={stage.id} className="flex flex-col">
                  <div className={`${stage.color} text-white p-4 rounded-t-xl shadow-lg`}>
                    <h3 className="font-bold text-lg">{stage.title}</h3>
                    <div className="text-sm opacity-90 mt-1">
                      {stageOpportunities.length} deals • {formatCurrency(stageValue)}
                    </div>
                  </div>
                  
                  <div className="bg-gray-800 rounded-b-xl p-3 flex-1 overflow-y-auto space-y-3 border-x border-b border-gray-600">
                    {stageOpportunities.map((opportunity) => (
                      <div
                        key={opportunity.id}
                        className="bg-gray-900 p-4 rounded-xl cursor-pointer hover:bg-gray-750 transition-all duration-200 border border-gray-700 hover:border-purple-500 hover:shadow-lg group"
                      >
                        <h4 className="text-white font-semibold text-sm mb-3 leading-tight group-hover:text-purple-300 transition-colors">
                          {opportunity.title}
                        </h4>
                        
                        <div className="space-y-2 text-xs text-gray-400">
                          <div className="flex items-center space-x-2">
                            <Building2 size={12} />
                            <span className="truncate">{opportunity.hospital?.name || 'Unknown Hospital'}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <User size={12} />
                            <span className="truncate">
                              Dr. {opportunity.surgeon?.first_name} {opportunity.surgeon?.last_name}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar size={12} />
                            <span>{new Date(opportunity.expected_close_date).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700">
                          <span className="text-green-400 font-bold text-sm">
                            {formatCurrency(opportunity.estimated_value)}
                          </span>
                          <span className={`text-xs font-semibold ${getProbabilityColor(opportunity.probability)}`}>
                            {opportunity.probability}%
                          </span>
                        </div>

                        {opportunity.notes && (
                          <div className="mt-2 p-2 bg-gray-800 rounded text-xs text-gray-300 line-clamp-2">
                            {opportunity.notes}
                          </div>
                        )}

                        {/* Action buttons on hover */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-3 flex space-x-2">
                          <button className="btn-secondary text-xs py-1 px-2">
                            <Edit size={12} className="mr-1" />
                            Edit
                          </button>
                          <button className="btn-primary text-xs py-1 px-2">
                            <Eye size={12} className="mr-1" />
                            View
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    {stageOpportunities.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <div className="text-sm">No opportunities</div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* New Opportunity Modal - Coming Soon */}
      {showNewOpportunity && (
        <div className="modal-overlay" onClick={() => setShowNewOpportunity(false)}>
          <div className="modal max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="text-center py-8">
              <Plus size={48} className="text-purple-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">New Opportunity</h2>
              <div className="flex items-center justify-center space-x-2 mb-4">
                <span className="px-3 py-1 bg-orange-500/20 border border-orange-500/30 rounded-full text-orange-300 text-sm font-medium">
                  Coming Soon
                </span>
              </div>
              <p className="text-gray-400 mb-6">
                Opportunity creation form will be available in the next update
              </p>
              <button 
                onClick={() => setShowNewOpportunity(false)}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}