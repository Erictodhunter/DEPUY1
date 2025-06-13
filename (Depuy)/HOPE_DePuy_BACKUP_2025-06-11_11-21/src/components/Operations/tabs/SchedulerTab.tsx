import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Plus, Filter, Search, Clock, MapPin, User, Package, X } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface SurgeryCase {
  id: number;
  case_number: string;
  surgeon_id: number;
  hospital_id: number;
  procedure_id: number;
  patient_identifier?: string;
  scheduled_at: string;
  actual_start_time?: string;
  actual_end_time?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  operating_room?: string;
  estimated_cost?: number;
  actual_cost?: number;
  notes?: string;
  surgeon?: { first_name: string; last_name: string; };
  hospital?: { name: string; };
  procedure?: { name: string; };
}

interface NewCaseForm {
  case_number: string;
  surgeon_id: string;
  hospital_id: string;
  procedure_id: string;
  patient_identifier: string;
  scheduled_at: string;
  operating_room: string;
  estimated_cost: string;
  notes: string;
}

export default function SchedulerTab() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('week');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [showCaseDetail, setShowCaseDetail] = useState(false);
  const [showNewCaseForm, setShowNewCaseForm] = useState(false);
  const [selectedCase, setSelectedCase] = useState<SurgeryCase | null>(null);
  const [cases, setCases] = useState<SurgeryCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form data and options
  const [surgeons, setSurgeons] = useState<any[]>([]);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [procedures, setProcedures] = useState<any[]>([]);
  const [newCase, setNewCase] = useState<NewCaseForm>({
    case_number: '',
    surgeon_id: '',
    hospital_id: '',
    procedure_id: '',
    patient_identifier: '',
    scheduled_at: '',
    operating_room: '',
    estimated_cost: '',
    notes: ''
  });

  // Load initial data
  useEffect(() => {
    loadCases();
    loadFormOptions();
  }, [currentDate, selectedRegion]);

  const loadCases = async () => {
    try {
      setLoading(true);
      
      // Calculate date range based on view mode
      const startDate = new Date(currentDate);
      const endDate = new Date(currentDate);
      
      switch (viewMode) {
        case 'month':
          startDate.setDate(1);
          endDate.setMonth(endDate.getMonth() + 1);
          endDate.setDate(0);
          break;
        case 'week':
          const day = startDate.getDay();
          startDate.setDate(startDate.getDate() - day);
          endDate.setDate(startDate.getDate() + 6);
          break;
        case 'day':
          endDate.setDate(startDate.getDate());
          break;
      }

      // Try using the RPC function first (most reliable)
      const regionFilter = selectedRegion !== 'all' ? parseInt(selectedRegion) : null;
      
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_surgery_cases_with_details', {
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          region_filter: regionFilter
        });

      if (!rpcError && rpcData) {
        // Format the data to match our interface
        const formattedCases = rpcData.map((item: any) => ({
          ...item,
          surgeon: item.surgeon_first_name && item.surgeon_last_name ? {
            first_name: item.surgeon_first_name,
            last_name: item.surgeon_last_name
          } : undefined,
          hospital: item.hospital_name ? { name: item.hospital_name } : undefined,
          procedure: item.procedure_name ? { name: item.procedure_name } : undefined
        }));
        
        setCases(formattedCases);
        setError(null);
        return;
      }

      // If RPC fails, try the view
      if (rpcError) {
        console.warn('RPC function failed, trying view:', rpcError.message);
        
        let viewQuery = supabase
          .from('surgery_cases_with_details')
          .select('*')
          .gte('scheduled_at', startDate.toISOString())
          .lte('scheduled_at', endDate.toISOString())
          .order('scheduled_at', { ascending: true });

        if (selectedRegion !== 'all') {
          viewQuery = viewQuery.eq('region_id', selectedRegion);
        }

        const { data: viewData, error: viewError } = await viewQuery;

        if (!viewError && viewData) {
          // Format the view data
          const formattedCases = viewData.map((item: any) => ({
            ...item,
            surgeon: item.surgeon_first_name && item.surgeon_last_name ? {
              first_name: item.surgeon_first_name,
              last_name: item.surgeon_last_name
            } : undefined,
            hospital: item.hospital_name ? { name: item.hospital_name } : undefined,
            procedure: item.procedure_name ? { name: item.procedure_name } : undefined
          }));
          
          setCases(formattedCases);
          setError(null);
          return;
        }
      }

      // Final fallback: simple query without joins
      console.warn('Both RPC and view failed, using simple query');
      
      let simpleQuery = supabase
        .from('surgery_cases')
        .select('*')
        .gte('scheduled_at', startDate.toISOString())
        .lte('scheduled_at', endDate.toISOString())
        .order('scheduled_at', { ascending: true });

      if (selectedRegion !== 'all') {
        simpleQuery = simpleQuery.eq('region_id', selectedRegion);
      }

      const { data: simpleData, error: simpleError } = await simpleQuery;

      if (simpleError) {
        setError(`Failed to load cases: ${simpleError.message}`);
        return;
      }

      // Load related data separately if needed
      setCases(simpleData || []);
      setError(null);
      
    } catch (err: any) {
      console.error('Error in loadCases:', err);
      setError(`Error loading cases: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadFormOptions = async () => {
    try {
      // Load surgeons, hospitals, and procedures for the form
      const [surgeonsRes, hospitalsRes, proceduresRes] = await Promise.all([
        supabase.from('surgeons').select('id, first_name, last_name').order('last_name'),
        supabase.from('hospitals').select('id, name').order('name'),
        supabase.from('procedures').select('id, name').order('name')
      ]);

      if (surgeonsRes.data) setSurgeons(surgeonsRes.data);
      if (hospitalsRes.data) setHospitals(hospitalsRes.data);
      if (proceduresRes.data) setProcedures(proceduresRes.data);
    } catch (err: any) {
      console.error('Error loading form options:', err);
    }
  };

  const handleScheduleSurgery = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Generate case number if not provided
      const caseNumber = newCase.case_number || `CASE-${Date.now()}`;
      
      const { data, error: insertError } = await supabase
        .from('surgery_cases')
        .insert([{
          case_number: caseNumber,
          surgeon_id: parseInt(newCase.surgeon_id),
          hospital_id: parseInt(newCase.hospital_id),
          procedure_id: parseInt(newCase.procedure_id),
          patient_identifier: newCase.patient_identifier || null,
          scheduled_at: new Date(newCase.scheduled_at).toISOString(),
          operating_room: newCase.operating_room || null,
          estimated_cost: newCase.estimated_cost ? parseFloat(newCase.estimated_cost) : null,
          notes: newCase.notes || null,
          status: 'scheduled'
        }])
        .select();

      if (insertError) {
        setError(`Failed to schedule surgery: ${insertError.message}`);
        return;
      }

      // Reset form and close modal
      setNewCase({
        case_number: '',
        surgeon_id: '',
        hospital_id: '',
        procedure_id: '',
        patient_identifier: '',
        scheduled_at: '',
        operating_room: '',
        estimated_cost: '',
        notes: ''
      });
      setShowNewCaseForm(false);
      
      // Reload cases
      loadCases();
      
    } catch (err: any) {
      setError(`Error scheduling surgery: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'badge-info';
      case 'in_progress': return 'badge-warning';
      case 'completed': return 'badge-success';
      case 'cancelled': return 'badge-error';
      default: return 'badge-info';
    }
  };

  const handleCaseClick = (caseItem: SurgeryCase) => {
    setSelectedCase(caseItem);
    setShowCaseDetail(true);
  };

  const getTodaysCases = () => {
    const today = new Date().toDateString();
    return cases.filter(c => new Date(c.scheduled_at).toDateString() === today);
  };

  const getCasesForDate = (date: Date) => {
    const dateStr = date.toDateString();
    return cases.filter(c => new Date(c.scheduled_at).toDateString() === dateStr);
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-400 mb-4">{error}</div>
        <button onClick={loadCases} className="btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => {
                const newDate = new Date(currentDate);
                newDate.setMonth(newDate.getMonth() - 1);
                setCurrentDate(newDate);
              }}
              className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white"
            >
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-xl font-semibold text-white min-w-[200px] text-center">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <button 
              onClick={() => {
                const newDate = new Date(currentDate);
                newDate.setMonth(newDate.getMonth() + 1);
                setCurrentDate(newDate);
              }}
              className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {['month', 'week', 'day'].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode as any)}
                className={`px-3 py-1 rounded-lg text-sm capitalize ${
                  viewMode === mode ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="input-field w-48"
          >
            <option value="all">All Regions</option>
            <option value="1">Northeast</option>
            <option value="2">Central</option>
            <option value="3">Southwest</option>
          </select>
          <button 
            onClick={() => setShowNewCaseForm(true)}
            className="btn-primary flex items-center space-x-2"
            disabled={loading}
          >
            <Plus size={18} />
            <span>Schedule Surgery</span>
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="text-gray-400">Loading cases...</div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center text-gray-400 font-medium py-2 text-sm">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar Grid - Optimized for lots of data */}
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 35 }, (_, i) => {
                  const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i - 6);
                  const isToday = date.toDateString() === new Date().toDateString();
                  const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                  const casesForDate = getCasesForDate(date);
                  
                  return (
                    <div
                      key={i}
                      className={`relative p-1 rounded text-center cursor-pointer transition-colors min-h-[80px] ${
                        isToday ? 'bg-purple-600 text-white' :
                        isCurrentMonth ? 'hover:bg-gray-700 text-gray-300 bg-gray-900' :
                        'text-gray-600 bg-gray-850'
                      }`}
                    >
                      <div className="text-xs font-medium mb-1">{date.getDate()}</div>
                      {casesForDate.length > 0 && (
                        <div className="space-y-1">
                          {casesForDate.slice(0, 3).map((caseItem, idx) => (
                            <div
                              key={idx}
                              onClick={() => handleCaseClick(caseItem)}
                              className="text-xs bg-blue-600 text-white px-1 py-0.5 rounded truncate hover:bg-blue-500"
                              title={`${formatDateTime(caseItem.scheduled_at).time} - ${caseItem.procedure?.name || 'Procedure'}`}
                            >
                              {formatDateTime(caseItem.scheduled_at).time}
                            </div>
                          ))}
                          {casesForDate.length > 3 && (
                            <div className="text-xs text-gray-400">
                              +{casesForDate.length - 3} more
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Today's Schedule</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {getTodaysCases().length === 0 ? (
              <div className="text-gray-400 text-center py-4">No cases scheduled for today</div>
            ) : (
              getTodaysCases().map((caseItem) => (
                <div 
                  key={caseItem.id} 
                  className="card hover:bg-gray-800 cursor-pointer transition-colors"
                  onClick={() => handleCaseClick(caseItem)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                      <Clock size={16} className="text-gray-400" />
                      <span className="text-white font-medium text-sm">
                        {formatDateTime(caseItem.scheduled_at).time}
                      </span>
                    </div>
                    <span className={`badge ${getStatusColor(caseItem.status)} text-xs`}>
                      {caseItem.status}
                    </span>
                  </div>
                  
                  <h4 className="text-white font-semibold text-sm mb-1">
                    {caseItem.procedure?.name || 'Unknown Procedure'}
                  </h4>
                  
                  <div className="space-y-1 text-xs text-gray-400">
                    <div className="flex items-center space-x-1">
                      <User size={12} />
                      <span>
                        {caseItem.surgeon ? 
                          `Dr. ${caseItem.surgeon.first_name} ${caseItem.surgeon.last_name}` : 
                          'Unknown Surgeon'
                        }
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin size={12} />
                      <span>{caseItem.hospital?.name || 'Unknown Hospital'}</span>
                    </div>
                    {caseItem.operating_room && (
                      <div className="flex items-center space-x-1">
                        <Package size={12} />
                        <span>OR {caseItem.operating_room}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* New Case Form Modal */}
      {showNewCaseForm && (
        <div className="modal-overlay" onClick={() => setShowNewCaseForm(false)}>
          <div className="modal max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">Schedule New Surgery</h2>
              <button
                onClick={() => setShowNewCaseForm(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleScheduleSurgery} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Case Number (optional)
                  </label>
                  <input
                    type="text"
                    value={newCase.case_number}
                    onChange={(e) => setNewCase({...newCase, case_number: e.target.value})}
                    className="input-field"
                    placeholder="Auto-generated if empty"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Patient ID
                  </label>
                  <input
                    type="text"
                    value={newCase.patient_identifier}
                    onChange={(e) => setNewCase({...newCase, patient_identifier: e.target.value})}
                    className="input-field"
                    placeholder="Patient identifier"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Surgeon *
                  </label>
                  <select
                    value={newCase.surgeon_id}
                    onChange={(e) => setNewCase({...newCase, surgeon_id: e.target.value})}
                    className="input-field"
                    required
                  >
                    <option value="">Select Surgeon</option>
                    {surgeons.map(surgeon => (
                      <option key={surgeon.id} value={surgeon.id}>
                        Dr. {surgeon.first_name} {surgeon.last_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Hospital *
                  </label>
                  <select
                    value={newCase.hospital_id}
                    onChange={(e) => setNewCase({...newCase, hospital_id: e.target.value})}
                    className="input-field"
                    required
                  >
                    <option value="">Select Hospital</option>
                    {hospitals.map(hospital => (
                      <option key={hospital.id} value={hospital.id}>
                        {hospital.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Procedure *
                  </label>
                  <select
                    value={newCase.procedure_id}
                    onChange={(e) => setNewCase({...newCase, procedure_id: e.target.value})}
                    className="input-field"
                    required
                  >
                    <option value="">Select Procedure</option>
                    {procedures.map(procedure => (
                      <option key={procedure.id} value={procedure.id}>
                        {procedure.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Operating Room
                  </label>
                  <input
                    type="text"
                    value={newCase.operating_room}
                    onChange={(e) => setNewCase({...newCase, operating_room: e.target.value})}
                    className="input-field"
                    placeholder="OR 1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Scheduled Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={newCase.scheduled_at}
                    onChange={(e) => setNewCase({...newCase, scheduled_at: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Estimated Cost
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newCase.estimated_cost}
                    onChange={(e) => setNewCase({...newCase, estimated_cost: e.target.value})}
                    className="input-field"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Notes
                </label>
                <textarea
                  value={newCase.notes}
                  onChange={(e) => setNewCase({...newCase, notes: e.target.value})}
                  className="input-field"
                  rows={3}
                  placeholder="Additional notes..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewCaseForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Scheduling...' : 'Schedule Surgery'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Case Detail Modal */}
      {showCaseDetail && selectedCase && (
        <div className="modal-overlay" onClick={() => setShowCaseDetail(false)}>
          <div className="modal max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">Case Details</h2>
              <button
                onClick={() => setShowCaseDetail(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Case Number</h3>
                  <p className="text-white">{selectedCase.case_number}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Status</h3>
                  <span className={`badge ${getStatusColor(selectedCase.status)}`}>
                    {selectedCase.status}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Surgeon</h3>
                  <p className="text-white">
                    {selectedCase.surgeon ? 
                      `Dr. ${selectedCase.surgeon.first_name} ${selectedCase.surgeon.last_name}` : 
                      'Unknown Surgeon'
                    }
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Procedure</h3>
                  <p className="text-white">{selectedCase.procedure?.name || 'Unknown Procedure'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Hospital</h3>
                  <p className="text-white">{selectedCase.hospital?.name || 'Unknown Hospital'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Scheduled Date & Time</h3>
                  <p className="text-white">
                    {formatDateTime(selectedCase.scheduled_at).date} at {formatDateTime(selectedCase.scheduled_at).time}
                  </p>
                </div>
                {selectedCase.operating_room && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Operating Room</h3>
                    <p className="text-white">OR {selectedCase.operating_room}</p>
                  </div>
                )}
                {selectedCase.patient_identifier && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Patient ID</h3>
                    <p className="text-white">{selectedCase.patient_identifier}</p>
                  </div>
                )}
                {selectedCase.estimated_cost && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Estimated Cost</h3>
                    <p className="text-white">${selectedCase.estimated_cost.toLocaleString()}</p>
                  </div>
                )}
              </div>

              {selectedCase.notes && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Notes</h3>
                  <p className="text-white bg-gray-800 p-3 rounded-lg">{selectedCase.notes}</p>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button className="btn-secondary">Edit Case</button>
                <button 
                  onClick={() => setShowCaseDetail(false)}
                  className="btn-primary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}