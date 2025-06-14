import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface Opportunity {
  id: number;
  title: string;
  description?: string;
  hospital_id: number;
  surgeon_id?: number;
  estimated_value?: number;
  probability_percentage?: number;
  expected_close_date?: string;
  stage?: string;
  status: string;
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
  const [activeStage, setActiveStage] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
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

  const stages = [
    { key: 'all', label: 'All Opportunities', color: 'bg-gray-100' },
    { key: 'lead', label: 'Lead', color: 'bg-blue-100' },
    { key: 'qualified', label: 'Qualified', color: 'bg-yellow-100' },
    { key: 'proposal', label: 'Proposal', color: 'bg-orange-100' },
    { key: 'negotiation', label: 'Negotiation', color: 'bg-purple-100' },
    { key: 'closed_won', label: 'Closed Won', color: 'bg-green-100' },
    { key: 'closed_lost', label: 'Closed Lost', color: 'bg-red-100' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load opportunities with basic related data
      const { data: oppsData, error: oppsError } = await supabase
        .from('opportunities')
        .select(`
          *,
          hospital:hospitals(id, name),
          surgeon:surgeons(id, first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (oppsError) throw oppsError;

      // Load hospitals
      const { data: hospitalsData, error: hospitalsError } = await supabase
        .from('hospitals')
        .select('id, name')
        .order('name');

      if (hospitalsError) throw hospitalsError;

      // Load surgeons
      const { data: surgeonsData, error: surgeonsError } = await supabase
        .from('surgeons')
        .select('id, first_name, last_name')
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
    let filtered = opportunities;
    
    if (activeStage !== 'all') {
      filtered = filtered.filter(opp => opp.stage === activeStage);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(opp => 
        opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.hospital?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (opp.surgeon && `${opp.surgeon.first_name} ${opp.surgeon.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    return filtered;
  };

  const handleSaveOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Title is required');
      return;
    }

    try {
      const opportunityData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        hospital_id: formData.hospital_id && formData.hospital_id !== '' && formData.hospital_id !== 'null' ? parseInt(formData.hospital_id) : null,
        surgeon_id: formData.surgeon_id && formData.surgeon_id !== '' && formData.surgeon_id !== 'null' ? parseInt(formData.surgeon_id) : null,
        estimated_value: formData.estimated_value > 0 ? formData.estimated_value : null,
        probability_percentage: formData.probability_percentage > 0 ? formData.probability_percentage : null,
        expected_close_date: formData.expected_close_date || null,
        stage: formData.stage || 'lead',
        status: formData.status || 'active',
        next_action: formData.next_action.trim() || null,
        notes: formData.notes.trim() || null
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
      status: opportunity.status || 'active',
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
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getMetrics = () => {
    const filtered = getFilteredOpportunities();
    const totalValue = filtered.reduce((sum, opp) => sum + (opp.estimated_value || 0), 0);
    const avgValue = filtered.length > 0 ? totalValue / filtered.length : 0;
    const weightedValue = filtered.reduce((sum, opp) => 
      sum + ((opp.estimated_value || 0) * (opp.probability_percentage || 0) / 100), 0
    );

    return {
      count: filtered.length,
      totalValue,
      avgValue,
      weightedValue
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading pipeline...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-red-500 mb-4">
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="text-lg font-semibold">Pipeline Unavailable</h3>
        </div>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Retry
        </button>
      </div>
    );
  }

  const metrics = getMetrics();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sales Pipeline</h2>
          <p className="text-gray-600">Manage opportunities and track progress</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Opportunity
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-blue-600">{metrics.count}</div>
          <div className="text-sm text-gray-600">Total Opportunities</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">{formatCurrency(metrics.totalValue)}</div>
          <div className="text-sm text-gray-600">Total Value</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-purple-600">{formatCurrency(metrics.weightedValue)}</div>
          <div className="text-sm text-gray-600">Weighted Value</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-orange-600">{formatCurrency(metrics.avgValue)}</div>
          <div className="text-sm text-gray-600">Average Deal Size</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-64">
          <input
            type="text"
            placeholder="Search opportunities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {stages.map(stage => (
            <button
              key={stage.key}
              onClick={() => setActiveStage(stage.key)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                activeStage === stage.key
                  ? 'bg-blue-600 text-white'
                  : `${stage.color} text-gray-700 hover:bg-blue-100`
              }`}
            >
              {stage.label}
            </button>
          ))}
        </div>
      </div>

      {/* Opportunities List */}
      <div className="bg-white rounded-lg border">
        {getFilteredOpportunities().length === 0 ? (
          <div className="p-8 text-center">
            <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No opportunities found</h3>
            <p className="text-gray-500 mb-4">Get started by creating your first opportunity</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Opportunity
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {getFilteredOpportunities().map(opportunity => (
              <div key={opportunity.id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{opportunity.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        stages.find(s => s.key === opportunity.stage)?.color || 'bg-gray-100'
                      } text-gray-700`}>
                        {stages.find(s => s.key === opportunity.stage)?.label || opportunity.stage}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Hospital:</span> {opportunity.hospital?.name || 'Not assigned'}
                      </div>
                      <div>
                        <span className="font-medium">Surgeon:</span> {
                          opportunity.surgeon 
                            ? `${opportunity.surgeon.first_name} ${opportunity.surgeon.last_name}`
                            : 'Not assigned'
                        }
                      </div>
                      <div>
                        <span className="font-medium">Value:</span> {
                          opportunity.estimated_value ? formatCurrency(opportunity.estimated_value) : 'Not set'
                        }
                      </div>
                    </div>
                    
                    {opportunity.description && (
                      <p className="mt-2 text-sm text-gray-600">{opportunity.description}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleEditOpportunity(opportunity)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteOpportunity(opportunity.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">
                  {editingOpportunity ? 'Edit Opportunity' : 'Add New Opportunity'}
                </h3>
                <button
                  onClick={handleCloseForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSaveOpportunity} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter opportunity title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description <span className="text-gray-400">(optional)</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe the opportunity (optional)"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hospital <span className="text-gray-400">(optional)</span>
                    </label>
                    <select
                      value={formData.hospital_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, hospital_id: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Hospital</option>
                      <option value="null">No Hospital</option>
                      {hospitals.map(hospital => (
                        <option key={hospital.id} value={hospital.id}>
                          {hospital.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Surgeon <span className="text-gray-400">(optional)</span>
                    </label>
                    <select
                      value={formData.surgeon_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, surgeon_id: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Surgeon</option>
                      <option value="null">No Surgeon</option>
                      {surgeons.map(surgeon => (
                        <option key={surgeon.id} value={surgeon.id}>
                          {surgeon.first_name} {surgeon.last_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estimated Value ($) <span className="text-gray-400">(optional)</span>
                    </label>
                    <input
                      type="number"
                      value={formData.estimated_value}
                      onChange={(e) => setFormData(prev => ({ ...prev, estimated_value: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Probability (%) <span className="text-gray-400">(optional)</span>
                    </label>
                    <input
                      type="number"
                      value={formData.probability_percentage}
                      onChange={(e) => setFormData(prev => ({ ...prev, probability_percentage: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                      max="100"
                      placeholder="0-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stage
                    </label>
                    <select
                      value={formData.stage}
                      onChange={(e) => setFormData(prev => ({ ...prev, stage: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {stages.filter(s => s.key !== 'all').map(stage => (
                        <option key={stage.key} value={stage.key}>
                          {stage.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expected Close Date <span className="text-gray-400">(optional)</span>
                    </label>
                    <input
                      type="date"
                      value={formData.expected_close_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, expected_close_date: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Next Action <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.next_action}
                    onChange={(e) => setFormData(prev => ({ ...prev, next_action: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Schedule follow-up call"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes <span className="text-gray-400">(optional)</span>
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Additional notes about this opportunity"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingOpportunity ? 'Update' : 'Create'} Opportunity
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}