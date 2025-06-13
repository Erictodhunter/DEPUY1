import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, RefreshCw, Plus, ChevronLeft, ChevronRight, AlertCircle, CheckCircle } from 'lucide-react';
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

export default function ScheduleTab() {
  const [appointments, setAppointments] = useState<SurgeryCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(0); // 0 = Monday, 1 = Tuesday, etc.
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');

  useEffect(() => {
    loadAppointments();
  }, [currentWeekStart]);

  const loadAppointments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get start and end of current week for filtering
      const startOfWeek = new Date(currentWeekStart);
      startOfWeek.setDate(currentWeekStart.getDate() - currentWeekStart.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

              const { data, error } = await supabase
          .from('surgery_cases')
          .select(`
            *,
            surgeon:surgeons!surgery_cases_surgeon_id_fkey(first_name, last_name),
            hospital:hospitals!surgery_cases_hospital_id_fkey(name),
            procedure:procedures!surgery_cases_procedure_id_fkey(name)
          `)
        .gte('scheduled_at', startOfWeek.toISOString())
        .lte('scheduled_at', endOfWeek.toISOString())
        .order('scheduled_at', { ascending: true });

      if (error) throw error;

      setAppointments(data || []);
    } catch (err) {
      console.error('Error loading appointments:', err);
      setError('Failed to load appointments. Please try again.');
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

  const getWeekDates = () => {
    const startOfWeek = new Date(currentWeekStart);
    startOfWeek.setDate(currentWeekStart.getDate() - currentWeekStart.getDay());
    
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return date;
    });
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeekStart);
    newWeek.setDate(currentWeekStart.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeekStart(newWeek);
  };

  const formatTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatTimeRange = (scheduledAt: string, actualStart?: string, actualEnd?: string) => {
    const scheduled = formatTime(scheduledAt);
    if (actualStart && actualEnd) {
      return `${formatTime(actualStart)} - ${formatTime(actualEnd)}`;
    } else if (actualStart) {
      return `Started ${formatTime(actualStart)}`;
    }
    return `Scheduled ${scheduled}`;
  };

  const getWeekStats = () => {
    const total = appointments.length;
    const confirmed = appointments.filter(apt => apt.status === 'scheduled').length;
    const inProgress = appointments.filter(apt => apt.status === 'in_progress').length;
    const completed = appointments.filter(apt => apt.status === 'completed').length;

    return { total, confirmed, inProgress, completed };
  };

  const weekStats = getWeekStats();
  const weekDates = getWeekDates();

  if (error) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
          <div className="text-red-400 mb-4">{error}</div>
          <button onClick={loadAppointments} className="btn-primary">
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
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => navigateWeek('prev')}
              className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white"
              disabled={loading}
            >
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-xl font-semibold text-white min-w-[200px] text-center">
              Week of {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </h2>
            <button 
              onClick={() => navigateWeek('next')}
              className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white"
              disabled={loading}
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="text-sm text-gray-400">
            Click on any day tab to view its schedule
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button 
            onClick={loadAppointments}
            className="btn-secondary flex items-center space-x-2"
            disabled={loading}
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button className="btn-primary flex items-center space-x-2">
            <Plus size={18} />
            <span>Add Surgery</span>
          </button>
        </div>
      </div>

      {/* Calendar Integration Notice */}
      <div className="card bg-blue-900/20 border-blue-500/30 relative overflow-hidden">
        <div className="flex items-center space-x-3">
          <Calendar size={24} className="text-blue-400" />
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <h3 className="text-white font-semibold">Calendar Integration</h3>
              <span className="px-3 py-1 bg-orange-500/20 border border-orange-500/30 rounded-full text-orange-300 text-xs font-medium">
                Coming Soon
              </span>
            </div>
            <p className="text-blue-300 text-sm mt-1">
              Sync with Google Calendar or iCal to import your surgery schedule automatically
            </p>
          </div>
          <button className="btn-secondary ml-auto opacity-50 cursor-not-allowed" disabled>
            Connect Calendar
          </button>
        </div>
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-orange-500/10 to-transparent"></div>
      </div>

      {loading && (
        <div className="card">
          <div className="text-center py-8">
            <div className="text-gray-400">Loading appointments...</div>
          </div>
        </div>
      )}

      {!loading && (
        <>
          {/* Day Tabs */}
          <div className="card">
            <div className="flex flex-wrap gap-2 mb-6">
              {weekDates.map((date, index) => {
                const dayAppointments = appointments.filter(apt => {
                  const aptDate = new Date(apt.scheduled_at);
                  return aptDate.toDateString() === date.toDateString();
                });
                const isToday = date.toDateString() === new Date().toDateString();
                const isSelected = selectedDay === index;
                
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedDay(index)}
                    className={`flex-1 min-w-[120px] p-4 rounded-xl border transition-all duration-200 ${
                      isSelected 
                        ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20' 
                        : isToday 
                        ? 'bg-purple-900/20 border-purple-500/30 text-purple-300 hover:bg-purple-800/30'
                        : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-xs font-medium uppercase tracking-wide opacity-80">
                        {date.toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                      <div className="text-lg font-bold mt-1">
                        {date.getDate()}
                      </div>
                      <div className="text-xs opacity-60 mt-1">
                        {date.toLocaleDateString('en-US', { month: 'short' })}
                      </div>
                      {dayAppointments.length > 0 && (
                        <div className={`text-xs mt-2 px-2 py-1 rounded-full ${
                          isSelected ? 'bg-white/20' : 'bg-purple-500/20'
                        }`}>
                          {dayAppointments.length} {dayAppointments.length === 1 ? 'surgery' : 'surgeries'}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Day Content */}
            <div className="min-h-[400px]">
              {(() => {
                const selectedDate = weekDates[selectedDay];
                const dayAppointments = appointments.filter(apt => {
                  const aptDate = new Date(apt.scheduled_at);
                  return aptDate.toDateString() === selectedDate.toDateString();
                });
                const isToday = selectedDate.toDateString() === new Date().toDateString();

                return (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          {selectedDate.toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                          {isToday && <span className="text-purple-400 ml-2">(Today)</span>}
                        </h3>
                        <p className="text-gray-400 text-sm mt-1">
                          {dayAppointments.length} {dayAppointments.length === 1 ? 'surgery' : 'surgeries'} scheduled
                        </p>
                      </div>
                      <button className="btn-primary flex items-center space-x-2">
                        <Plus size={18} />
                        <span>Add Surgery</span>
                      </button>
                    </div>

                    {dayAppointments.length === 0 ? (
                      <div className="text-center py-16">
                        <Calendar size={64} className="text-gray-600 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-400 mb-2">No surgeries scheduled</h4>
                        <p className="text-gray-500 text-sm mb-6">
                          {isToday ? 'You have a free day today!' : 'This day is available for scheduling.'}
                        </p>
                        <button className="btn-primary">Schedule Surgery</button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {dayAppointments
                          .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
                          .map((appointment) => (
                          <div key={appointment.id} className="group">
                            <div className="p-6 bg-gradient-to-r from-gray-800 to-gray-750 rounded-xl border border-gray-600 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/10 cursor-pointer transition-all duration-300">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-4 mb-4">
                                    <div className="flex items-center space-x-2">
                                      <Clock size={18} className="text-purple-400" />
                                      <span className="text-lg font-semibold text-purple-300">
                                        {formatTime(appointment.scheduled_at)}
                                      </span>
                                    </div>
                                    <span className={`badge ${getStatusColor(appointment.status)}`}>
                                      {appointment.status.replace('_', ' ')}
                                    </span>
                                  </div>
                                  
                                  <h4 className="text-xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors">
                                    {appointment.procedure?.name || 'Unknown Procedure'}
                                  </h4>
                                  
                                  <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="flex items-center space-x-3">
                                      <User size={16} className="text-gray-400" />
                                      <div>
                                        <div className="text-sm text-gray-400">Surgeon</div>
                                        <div className="text-white font-medium">
                                          Dr. {appointment.surgeon 
                                            ? `${appointment.surgeon.first_name} ${appointment.surgeon.last_name}`
                                            : 'Unknown Surgeon'
                                          }
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                      <MapPin size={16} className="text-gray-400" />
                                      <div>
                                        <div className="text-sm text-gray-400">Hospital</div>
                                        <div className="text-white font-medium">
                                          {appointment.hospital?.name || 'Unknown Hospital'}
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center space-x-6 text-sm text-gray-400">
                                    {appointment.operating_room && (
                                      <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                                        <span>OR: {appointment.operating_room}</span>
                                      </div>
                                    )}
                                    {appointment.patient_identifier && (
                                      <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                                        <span className="font-mono">Patient: {appointment.patient_identifier}</span>
                                      </div>
                                    )}
                                  </div>

                                  {appointment.notes && (
                                    <div className="mt-4 p-3 bg-gray-900/50 rounded-lg border border-gray-600">
                                      <div className="text-sm text-gray-300">
                                        {appointment.notes}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                <div className="flex flex-col space-y-2 ml-6">
                                  <button className="btn-secondary text-sm">Edit</button>
                                  <button className="btn-primary text-sm">View</button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Enhanced Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card bg-gradient-to-br from-purple-900/20 to-purple-800/10 border-purple-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-purple-400">{weekStats.total}</div>
                  <div className="text-sm text-purple-300 font-medium">Total This Week</div>
                  <div className="text-xs text-gray-400 mt-1">Surgeries scheduled</div>
                </div>
                <Calendar size={32} className="text-purple-400" />
              </div>
            </div>
            <div className="card bg-gradient-to-br from-blue-900/20 to-blue-800/10 border-blue-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-blue-400">{weekStats.confirmed}</div>
                  <div className="text-sm text-blue-300 font-medium">Scheduled</div>
                  <div className="text-xs text-gray-400 mt-1">Ready to proceed</div>
                </div>
                <CheckCircle size={32} className="text-blue-400" />
              </div>
            </div>
            <div className="card bg-gradient-to-br from-yellow-900/20 to-yellow-800/10 border-yellow-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-yellow-400">{weekStats.inProgress}</div>
                  <div className="text-sm text-yellow-300 font-medium">In Progress</div>
                  <div className="text-xs text-gray-400 mt-1">Currently ongoing</div>
                </div>
                <Clock size={32} className="text-yellow-400" />
              </div>
            </div>
            <div className="card bg-gradient-to-br from-green-900/20 to-green-800/10 border-green-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-green-400">{weekStats.completed}</div>
                  <div className="text-sm text-green-300 font-medium">Completed</div>
                  <div className="text-xs text-gray-400 mt-1">Successfully finished</div>
                </div>
                <CheckCircle size={32} className="text-green-400" />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}