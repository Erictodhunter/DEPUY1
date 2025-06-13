import React, { useState, useEffect } from 'react';
import { Plus, DollarSign, Calendar, User, Building2, TrendingUp, RefreshCw, AlertCircle, Edit, Eye, X, Save, Phone, Mail, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface Opportunity {
  id: number;
  title: string;
  description?: string;
  hospital_id: number;
  surgeon_id?: number;
  sales_rep_id?: number;
  estimated_value?: number;
  probability_percentage?: number;
  expected_close_date?: string;
  stage?: string;
  status: string;
  last_contact_date?: string;
  next_action?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  hospital?: { id: number; name: string; };
  surgeon?: { id: number; first_name: string; last_name: string; };
}

interface FormData {
  title: string;
  description: string;
  hospital_id: string;
  surgeon_id: string;
  estimated_value: number;
  probability_percentage: number;
  expected_close_date: string;
  stage: string;
  status: string;
  next_action: string;
  notes: string;
}

export default function PipelineTab() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [surgeons, setSurgeons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [activeStage, setActiveStage] = useState('all');
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    hospital_id: '',
    surgeon_id: '',
    estimated_value: 0,
    probability_percentage: 0,
    expected_close_date: '',
    stage: 'lead',
    status: 'active',
    next_action: '',
    notes: ''
  });

  const pipelineStages = [
    { id: 'all', title: 'All Opportunities', color: 'bg-gray-600' },
    { id: 'lead', title: 'Lead', color: 'bg-blue-600' },
    { id: 'qualified', title: 'Qualified', color: 'bg-indigo-600' },
    { id: 'proposal', title: 'Proposal', color: 'bg-purple-600' },
    { id: 'negotiation', title: 'Negotiation', color: 'bg-orange-600' },
    { id: 'closed_won', title: 'Closed Won', color: 'bg-green-600' },
    { id: 'closed_lost', title: 'Closed Lost', color: 'bg-red-600' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load opportunities with hospital and surgeon info
      const { data: oppsData, error: oppsError } = await supabase
        .from('opportunities')
        .select(`
          *,
          hospital:hospitals(id, name),
          surgeon:surgeons(id, first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (oppsError) throw oppsError;

      // Load hospitals for form dropdown
      const { data: hospitalsData, error: hospitalsError } = await supabase
        .from('hospitals')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      if (hospitalsError) throw hospitalsError;

      // Load surgeons for form dropdown
      const { data: surgeonsData, error: surgeonsError } = await supabase
        .from('surgeons')
        .select('id, first_name, last_name')
        .eq('is_active', true)
        .order('last_name');

      if (surgeonsError) throw surgeonsError;

      setOpportunities(oppsData || []);
      setHospitals(hospitalsData || []);
      setSurgeons(surgeonsData || []);
      
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load pipeline data');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredOpportunities = () => {
    if (activeStage === 'all') return opportunities;
    return opportunities.filter(opp => opp.stage === activeStage);
  };

  const handleSaveOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Title is required');
      return;
    }

    try {
      const opportunityData = {
        title: formData.title,
        description: formData.description || null,
        hospital_id: parseInt(formData.hospital_id) || null,
        surgeon_id: formData.surgeon_id ? parseInt(formData.surgeon_id) : null,
        estimated_value: formData.estimated_value || null,
        probability_percentage: formData.probability_percentage || null,
        expected_close_date: formData.expected_close_date || null,
        stage: formData.stage || 'lead',
        status: formData.status || 'active',
        next_action: formData.next_action || null,
        notes: formData.notes || null
      };

      if (editingOpportunity) {
        // Update existing opportunity
        const { error } = await supabase
          .from('opportunities')
          .update(opportunityData)
          .eq('id', editingOpportunity.id);
          
        if (error) throw error;
      } else {
        // Create new opportunity
        const { error } = await supabase
          .from('opportunities')
          .insert(opportunityData);
          
        if (error) throw error;
      }

      // Reload data and close form
      await loadData();
      handleCloseForm();
      
    } catch (err) {
      console.error('Error saving opportunity:', err);
      alert('Failed to save opportunity');
    }
  };

  const handleEditOpportunity = (opportunity: Opportunity) => {
    setEditingOpportunity(opportunity);
    setFormData({
      title: opportunity.title,
      description: opportunity.description || '',
      hospital_id: opportunity.hospital_id?.toString() || '',
      surgeon_id: opportunity.surgeon_id?.toString() || '',
      estimated_value: opportunity.estimated_value || 0,
      probability_percentage: opportunity.probability_percentage || 0,
      expected_close_date: opportunity.expected_close_date || '',
      stage: opportunity.stage || 'lead',
      status: opportunity.status,
      next_action: opportunity.next_action || '',
      notes: opportunity.notes || ''
    });
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingOpportunity(null);
    setFormData({
      title: '',
      description: '',
      hospital_id: '',
      surgeon_id: '',
      estimated_value: 0,
      probability_percentage: 0,
      expected_close_date: '',
      stage: 'lead',
      status: 'active',
      next_action: '',
      notes: ''
    });
  };

  const handleDeleteOpportunity = async (id: number) => {
    if (!confirm('Are you sure you want to delete this opportunity?')) return;
    
    try {
      const { error } = await supabase
        .from('opportunities')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      await loadData();
    } catch (err) {
      console.error('Error deleting opportunity:', err);
      alert('Failed to delete opportunity');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getMetrics = () => {
    const filtered = getFilteredOpportunities();
    const totalPipeline = filtered.reduce((sum, opp) => sum + (opp.estimated_value || 0), 0);
    const weightedPipeline = filtered.reduce((sum, opp) => sum + ((opp.estimated_value || 0) * (opp.probability_percentage || 0) / 100), 0);
    const avgDealSize = filtered.length > 0 ? totalPipeline / filtered.length : 0;
    const closedWon = filtered.filter(opp => opp.stage === 'closed_won');
    const totalClosed = filtered.filter(opp => opp.stage === 'closed_won' || opp.stage === 'closed_lost');
    const winRate = totalClosed.length > 0 ? (closedWon.length / totalClosed.length) * 100 : 0;

    return { totalPipeline, weightedPipeline, avgDealSize, winRate, count: filtered.length };
  };

  const metrics = getMetrics();

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Loading pipeline...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Pipeline Unavailable</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Metrics */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Sales Pipeline</h2>
            <p className="text-gray-600">Manage your sales opportunities and track progress</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Opportunity</span>
          </button>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{metrics.count}</div>
            <div className="text-sm text-blue-800">Opportunities</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{formatCurrency(metrics.totalPipeline)}</div>
            <div className="text-sm text-green-800">Pipeline Value</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(metrics.weightedPipeline)}</div>
            <div className="text-sm text-purple-800">Weighted Value</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(metrics.avgDealSize)}</div>
            <div className="text-sm text-orange-800">Avg Deal Size</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{metrics.winRate.toFixed(1)}%</div>
            <div className="text-sm text-yellow-800">Win Rate</div>
          </div>
        </div>

        {/* Stage Filter Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {pipelineStages.map((stage) => {
            const stageCount = stage.id === 'all' 
              ? opportunities.length 
              : opportunities.filter(opp => opp.stage === stage.id).length;
            
            return (
              <button
                key={stage.id}
                onClick={() => setActiveStage(stage.id)}
                className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeStage === stage.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <span>{stage.title}</span>
                  <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">
                    {stageCount}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Opportunities List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {activeStage === 'all' ? 'All Opportunities' : pipelineStages.find(s => s.id === activeStage)?.title}
          </h3>
          
          {getFilteredOpportunities().length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No opportunities found</h3>
              <p className="text-gray-500 mb-4">Get started by creating your first opportunity</p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Create Opportunity
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {getFilteredOpportunities().map((opportunity) => (
                <div key={opportunity.id} className="border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  <div 
                    className="p-4 cursor-pointer"
                    onClick={() => setExpandedCard(expandedCard === opportunity.id ? null : opportunity.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-medium text-gray-900">{opportunity.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            opportunity.stage === 'closed_won' ? 'bg-green-100 text-green-800' :
                            opportunity.stage === 'closed_lost' ? 'bg-red-100 text-red-800' :
                            opportunity.stage === 'negotiation' ? 'bg-orange-100 text-orange-800' :
                            opportunity.stage === 'proposal' ? 'bg-purple-100 text-purple-800' :
                            opportunity.stage === 'qualified' ? 'bg-indigo-100 text-indigo-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {pipelineStages.find(s => s.id === opportunity.stage)?.title || 'Lead'}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Building2 className="w-4 h-4 mr-1" />
                            {opportunity.hospital?.name || 'No hospital'}
                          </span>
                          {opportunity.estimated_value && (
                            <span className="flex items-center">
                              <DollarSign className="w-4 h-4 mr-1" />
                              {formatCurrency(opportunity.estimated_value)}
                            </span>
                          )}
                          {opportunity.probability_percentage && (
                            <span className="flex items-center">
                              <TrendingUp className="w-4 h-4 mr-1" />
                              {opportunity.probability_percentage}%
                            </span>
                          )}
                          {opportunity.expected_close_date && (
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {formatDate(opportunity.expected_close_date)}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditOpportunity(opportunity);
                          }}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {expandedCard === opportunity.id ? 
                          <ChevronUp className="w-4 h-4 text-gray-400" /> : 
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        }
                      </div>
                    </div>
                  </div>
                  
                  {expandedCard === opportunity.id && (
                    <div className="border-t border-gray-200 p-4 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">Details</h5>
                          <div className="space-y-1 text-sm">
                            {opportunity.description && (
                              <p className="text-gray-600">{opportunity.description}</p>
                            )}
                            {opportunity.surgeon && (
                              <p><span className="font-medium">Surgeon:</span> Dr. {opportunity.surgeon.first_name} {opportunity.surgeon.last_name}</p>
                            )}
                            <p><span className="font-medium">Status:</span> {opportunity.status}</p>
                            <p><span className="font-medium">Created:</span> {formatDate(opportunity.created_at)}</p>
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">Next Steps</h5>
                          <div className="space-y-1 text-sm">
                            {opportunity.next_action && (
                              <p className="text-gray-600">{opportunity.next_action}</p>
                            )}
                            {opportunity.notes && (
                              <p className="text-gray-600 mt-2"><span className="font-medium">Notes:</span> {opportunity.notes}</p>
                            )}
                          </div>
                          
                          <div className="flex space-x-2 mt-4">
                            <button
                              onClick={() => handleEditOpportunity(opportunity)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteOpportunity(opportunity.id)}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {editingOpportunity ? 'Edit Opportunity' : 'Create New Opportunity'}
              </h3>
              <button
                onClick={handleCloseForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSaveOpportunity} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter opportunity title"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe the opportunity"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hospital
                  </label>
                  <select
                    value={formData.hospital_id}
                    onChange={(e) => setFormData({...formData, hospital_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select hospital</option>
                    {hospitals.map(hospital => (
                      <option key={hospital.id} value={hospital.id}>
                        {hospital.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Surgeon
                  </label>
                  <select
                    value={formData.surgeon_id}
                    onChange={(e) => setFormData({...formData, surgeon_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select surgeon</option>
                    {surgeons.map(surgeon => (
                      <option key={surgeon.id} value={surgeon.id}>
                        Dr. {surgeon.first_name} {surgeon.last_name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Value ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.estimated_value}
                    onChange={(e) => setFormData({...formData, estimated_value: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Probability (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.probability_percentage}
                    onChange={(e) => setFormData({...formData, probability_percentage: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stage
                  </label>
                  <select
                    value={formData.stage}
                    onChange={(e) => setFormData({...formData, stage: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="lead">Lead</option>
                    <option value="qualified">Qualified</option>
                    <option value="proposal">Proposal</option>
                    <option value="negotiation">Negotiation</option>
                    <option value="closed_won">Closed Won</option>
                    <option value="closed_lost">Closed Lost</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expected Close Date
                  </label>
                  <input
                    type="date"
                    value={formData.expected_close_date}
                    onChange={(e) => setFormData({...formData, expected_close_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Next Action
                  </label>
                  <input
                    type="text"
                    value={formData.next_action}
                    onChange={(e) => setFormData({...formData, next_action: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="What's the next step?"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Additional notes"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Opportunity</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}