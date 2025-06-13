import React, { useState, useEffect } from 'react';
import { Plus, Calendar, User, Building2, FileText, Clock, AlertCircle, RefreshCw, Save } from 'lucide-react';
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
  // Joined data
  surgeon?: { first_name: string; last_name: string; };
  hospital?: { name: string; };
  procedure?: { name: string; };
}

interface BookingFormData {
  surgeon_id: string;
  hospital_id: string;
  procedure_id: string;
  patient_identifier: string;
  scheduled_date: string;
  scheduled_time: string;
  operating_room: string;
  estimated_cost: string;
  notes: string;
}

export default function BookingTab() {
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [recentBookings, setRecentBookings] = useState<SurgeryCase[]>([]);
  const [surgeons, setSurgeons] = useState<any[]>([]);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [procedures, setProcedures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<SurgeryCase | null>(null);
  const [viewMode, setViewMode] = useState<'create' | 'edit' | 'view'>('create');
  
  const [formData, setFormData] = useState<BookingFormData>({
    surgeon_id: '',
    hospital_id: '',
    procedure_id: '',
    patient_identifier: '',
    scheduled_date: '',
    scheduled_time: '',
    operating_room: '',
    estimated_cost: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load recent bookings (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [casesResult, surgeonsResult, hospitalsResult, proceduresResult] = await Promise.all([
        supabase
          .from('surgery_cases')
          .select(`
            *,
            surgeon:surgeons!surgery_cases_surgeon_id_fkey(first_name, last_name),
            hospital:hospitals!surgery_cases_hospital_id_fkey(name),
            procedure:procedures!surgery_cases_procedure_id_fkey(name)
          `)
          .gte('created_at', thirtyDaysAgo.toISOString())
          .order('created_at', { ascending: false })
          .limit(20),
        
        supabase
          .from('surgeons')
          .select('id, first_name, last_name')
          .eq('is_active', true)
          .order('last_name'),
        
        supabase
          .from('hospitals')
          .select('id, name')
          .eq('is_active', true)
          .order('name'),
        
        supabase
          .from('procedures')
          .select('id, name')
          .eq('is_active', true)
          .order('name')
      ]);

      if (casesResult.error) throw casesResult.error;
      if (surgeonsResult.error) throw surgeonsResult.error;
      if (hospitalsResult.error) throw hospitalsResult.error;
      if (proceduresResult.error) throw proceduresResult.error;

      setRecentBookings(casesResult.data || []);
      setSurgeons(surgeonsResult.data || []);
      setHospitals(hospitalsResult.data || []);
      setProcedures(proceduresResult.data || []);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateCaseNumber = () => {
    const timestamp = Date.now().toString().slice(-6);
    const randomChars = Math.random().toString(36).substring(2, 4).toUpperCase();
    return `CASE-${new Date().getFullYear()}-${randomChars}${timestamp}`;
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.surgeon_id || !formData.hospital_id || !formData.procedure_id || !formData.scheduled_date || !formData.scheduled_time) {
      setError('Please fill in all required fields');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Combine date and time
      const scheduledDateTime = new Date(`${formData.scheduled_date}T${formData.scheduled_time}:00`);
      
      const { data, error } = await supabase
        .from('surgery_cases')
        .insert({
          case_number: generateCaseNumber(),
          surgeon_id: parseInt(formData.surgeon_id),
          hospital_id: parseInt(formData.hospital_id),
          procedure_id: parseInt(formData.procedure_id),
          patient_identifier: formData.patient_identifier || null,
          scheduled_at: scheduledDateTime.toISOString(),
          operating_room: formData.operating_room || null,
          estimated_cost: formData.estimated_cost ? parseFloat(formData.estimated_cost) : null,
          notes: formData.notes || null,
          status: 'scheduled'
        })
        .select(`
          *,
                      surgeon:surgeons!surgery_cases_surgeon_id_fkey(first_name, last_name),
          hospital:hospitals!surgery_cases_hospital_id_fkey(name),
          procedure:procedures!surgery_cases_procedure_id_fkey(name)
        `)
        .single();

      if (error) throw error;

      // Add to recent bookings
      setRecentBookings(prev => [data, ...prev]);
      
      // Reset form
      setFormData({
        surgeon_id: '',
        hospital_id: '',
        procedure_id: '',
        patient_identifier: '',
        scheduled_date: '',
        scheduled_time: '',
        operating_room: '',
        estimated_cost: '',
        notes: ''
      });
      
      setShowBookingForm(false);
    } catch (err) {
      console.error('Error creating surgery booking:', err);
      setError('Failed to create surgery booking: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setSaving(false);
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

  const getBookingStats = () => {
    const thisWeek = recentBookings.filter(booking => {
      const bookingDate = new Date(booking.scheduled_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return bookingDate >= weekAgo;
    });

    const confirmed = recentBookings.filter(booking => booking.status === 'scheduled');
    const pending = recentBookings.filter(booking => booking.status === 'in_progress');
    const thisMonth = recentBookings.length;

    return {
      thisWeek: thisWeek.length,
      confirmed: confirmed.length,
      pending: pending.length,
      thisMonth
    };
  };

  const handleEdit = (booking: SurgeryCase) => {
    setSelectedBooking(booking);
    setViewMode('edit');
    
    // Populate form with existing data
    const scheduledDate = new Date(booking.scheduled_at);
    setFormData({
      surgeon_id: booking.surgeon_id.toString(),
      hospital_id: booking.hospital_id.toString(),
      procedure_id: booking.procedure_id.toString(),
      patient_identifier: booking.patient_identifier || '',
      scheduled_date: scheduledDate.toISOString().split('T')[0],
      scheduled_time: scheduledDate.toTimeString().slice(0, 5),
      operating_room: booking.operating_room || '',
      estimated_cost: booking.estimated_cost?.toString() || '',
      notes: booking.notes || ''
    });
    
    setShowBookingForm(true);
  };

  const handleView = (booking: SurgeryCase) => {
    setSelectedBooking(booking);
    setViewMode('view');
    setShowBookingForm(true);
  };

  const handleNewBooking = () => {
    setSelectedBooking(null);
    setViewMode('create');
    setFormData({
      surgeon_id: '',
      hospital_id: '',
      procedure_id: '',
      patient_identifier: '',
      scheduled_date: '',
      scheduled_time: '',
      operating_room: '',
      estimated_cost: '',
      notes: ''
    });
    setShowBookingForm(true);
  };

  const closeModal = () => {
    setShowBookingForm(false);
    setSelectedBooking(null);
    setViewMode('create');
    setError(null);
  };

  const stats = getBookingStats();

  if (error && !showBookingForm) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
          <div className="text-red-400 mb-4">{error}</div>
          <button onClick={loadData} className="btn-primary">
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
        <h3 className="text-lg font-semibold text-white">Surgery Booking</h3>
        <div className="flex items-center space-x-3">
          <button 
            onClick={loadData}
            className="btn-secondary flex items-center space-x-2"
            disabled={loading}
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button 
            onClick={handleNewBooking}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>New Surgery</span>
          </button>
        </div>
      </div>

      {loading && (
        <div className="card">
          <div className="text-center py-8">
            <div className="text-gray-400">Loading booking data...</div>
          </div>
        </div>
      )}

      {!loading && (
        <>
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-400">This Week</h4>
                  <p className="text-2xl font-bold text-purple-400">{stats.thisWeek}</p>
                </div>
                <Calendar size={24} className="text-purple-400" />
              </div>
            </div>
            
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-400">Scheduled</h4>
                  <p className="text-2xl font-bold text-blue-400">{stats.confirmed}</p>
                </div>
                <User size={24} className="text-blue-400" />
              </div>
            </div>
            
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-400">In Progress</h4>
                  <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
                </div>
                <Clock size={24} className="text-yellow-400" />
              </div>
            </div>
            
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-400">Last 30 Days</h4>
                  <p className="text-2xl font-bold text-green-400">{stats.thisMonth}</p>
                </div>
                <Calendar size={24} className="text-green-400" />
              </div>
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="card">
            <h4 className="text-lg font-semibold text-white mb-4">Recent Bookings</h4>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Case Number</th>
                    <th>Surgeon</th>
                    <th>Procedure</th>
                    <th>Hospital</th>
                    <th>Scheduled Date & Time</th>
                    <th>Status</th>
                    <th>Patient ID</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-gray-400">
                        No recent bookings found
                      </td>
                    </tr>
                  ) : (
                    recentBookings.map((booking) => (
                      <tr key={booking.id}>
                        <td className="text-white font-mono text-sm">{booking.case_number}</td>
                        <td className="text-white font-medium">
                          {booking.surgeon 
                            ? `${booking.surgeon.first_name} ${booking.surgeon.last_name}`
                            : 'Unknown Surgeon'
                          }
                        </td>
                        <td className="text-gray-300">{booking.procedure?.name || 'Unknown Procedure'}</td>
                        <td className="text-gray-400">{booking.hospital?.name || 'Unknown Hospital'}</td>
                        <td>
                          <div>
                            <div className="text-white">
                              {new Date(booking.scheduled_at).toLocaleDateString()}
                            </div>
                            <div className="text-gray-400 text-sm">
                              {new Date(booking.scheduled_at).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="text-gray-400 text-sm">
                          {booking.patient_identifier || 'N/A'}
                        </td>
                        <td>
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleEdit(booking)}
                              className="btn-secondary text-sm hover:bg-purple-600 transition-colors"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleView(booking)}
                              className="btn-primary text-sm hover:bg-blue-600 transition-colors"
                            >
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Booking Form Modal */}
      {showBookingForm && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-semibold text-white mb-6">
              {viewMode === 'create' ? 'Schedule New Surgery' : 
               viewMode === 'edit' ? 'Edit Surgery Booking' : 
               'Surgery Details'}
            </h2>
            
            {error && (
              <div className="p-4 bg-red-900/20 border border-red-500 rounded-lg mb-6">
                <div className="text-red-400">{error}</div>
              </div>
            )}
            
            {viewMode === 'view' ? (
              <div className="space-y-6">
                {/* View Mode - Read Only */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Case Number</label>
                    <div className="input-field bg-gray-800 font-mono">{selectedBooking?.case_number}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                    <div className="input-field bg-gray-800">
                      <span className={`badge ${getStatusColor(selectedBooking?.status || '')}`}>
                        {selectedBooking?.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Surgeon</label>
                    <div className="input-field bg-gray-800">
                      {selectedBooking?.surgeon 
                        ? `${selectedBooking.surgeon.first_name} ${selectedBooking.surgeon.last_name}`
                        : 'Unknown Surgeon'
                      }
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Hospital</label>
                    <div className="input-field bg-gray-800">
                      {selectedBooking?.hospital?.name || 'Unknown Hospital'}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Procedure</label>
                  <div className="input-field bg-gray-800">
                    {selectedBooking?.procedure?.name || 'Unknown Procedure'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Scheduled Date</label>
                    <div className="input-field bg-gray-800">
                      {selectedBooking?.scheduled_at 
                        ? new Date(selectedBooking.scheduled_at).toLocaleDateString()
                        : 'N/A'
                      }
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Scheduled Time</label>
                    <div className="input-field bg-gray-800">
                      {selectedBooking?.scheduled_at 
                        ? new Date(selectedBooking.scheduled_at).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })
                        : 'N/A'
                      }
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Patient ID</label>
                    <div className="input-field bg-gray-800 font-mono">
                      {selectedBooking?.patient_identifier || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Operating Room</label>
                    <div className="input-field bg-gray-800">
                      {selectedBooking?.operating_room || 'N/A'}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Estimated Cost</label>
                  <div className="input-field bg-gray-800">
                    {selectedBooking?.estimated_cost 
                      ? `$${selectedBooking.estimated_cost.toLocaleString()}`
                      : 'N/A'
                    }
                  </div>
                </div>

                {selectedBooking?.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
                    <div className="input-field bg-gray-800 min-h-[80px] p-3">
                      {selectedBooking.notes}
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <button 
                    onClick={closeModal}
                    className="btn-secondary"
                  >
                    Close
                  </button>
                  <button 
                    onClick={() => handleEdit(selectedBooking!)}
                    className="btn-primary"
                  >
                    Edit Surgery
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Surgeon *</label>
                  <select 
                    value={formData.surgeon_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, surgeon_id: e.target.value }))}
                    className="input-field"
                    required
                  >
                    <option value="">Select Surgeon</option>
                    {surgeons.map(surgeon => (
                      <option key={surgeon.id} value={surgeon.id}>
                        {surgeon.first_name} {surgeon.last_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Hospital *</label>
                  <select 
                    value={formData.hospital_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, hospital_id: e.target.value }))}
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

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Procedure *</label>
                <select 
                  value={formData.procedure_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, procedure_id: e.target.value }))}
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Date *</label>
                  <input 
                    type="date" 
                    value={formData.scheduled_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduled_date: e.target.value }))}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Time *</label>
                  <input 
                    type="time" 
                    value={formData.scheduled_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduled_time: e.target.value }))}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Patient ID</label>
                  <input 
                    type="text" 
                    value={formData.patient_identifier}
                    onChange={(e) => setFormData(prev => ({ ...prev, patient_identifier: e.target.value }))}
                    className="input-field" 
                    placeholder="PAT-2024-001" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Operating Room</label>
                  <input 
                    type="text" 
                    value={formData.operating_room}
                    onChange={(e) => setFormData(prev => ({ ...prev, operating_room: e.target.value }))}
                    className="input-field" 
                    placeholder="OR-1" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Estimated Cost</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={formData.estimated_cost}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimated_cost: e.target.value }))}
                  className="input-field" 
                  placeholder="15000.00" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
                <textarea 
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="input-field" 
                  rows={3}
                  placeholder="Special requirements, patient allergies, etc."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="btn-secondary"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary flex items-center space-x-2"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Scheduling...</span>
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      <span>{viewMode === 'edit' ? 'Update Surgery' : 'Schedule Surgery'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}