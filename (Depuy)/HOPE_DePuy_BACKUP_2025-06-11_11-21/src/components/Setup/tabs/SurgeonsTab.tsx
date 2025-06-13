import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, User, Phone, Building2, X } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface Surgeon {
  id: number;
  first_name: string;
  last_name: string;
  specialties: string[];
  contact_info: any;
  hospital_id?: number | null;
  hospital_name?: string;
  user_id?: number | null;
  user_name?: string;
  cases: number;
  is_active: boolean;
}

interface Hospital {
  id: number;
  name: string;
}

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

export default function SurgeonsTab() {
  const [surgeons, setSurgeons] = useState<Surgeon[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [editingSurgeon, setEditingSurgeon] = useState<Surgeon | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    specialty: '',
    phone: '',
    hospitalId: '',
    userId: ''
  });

  // Load initial data
  useEffect(() => {
    loadSurgeons();
    loadHospitals();
    loadUsers();
  }, []);

  const loadSurgeons = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('surgeons')
        .select('*')
        .eq('is_active', true)
        .order('last_name');

      if (error) throw error;

      // Load hospital names separately to avoid relationship issues
      const hospitalData = await supabase
        .from('hospitals')
        .select('id, name')
        .eq('is_active', true);

      const hospitalMap = new Map();
      if (hospitalData.data) {
        hospitalData.data.forEach(hospital => {
          hospitalMap.set(hospital.id, hospital.name);
        });
      }

      const mappedSurgeons = data?.map((surgeon: any) => ({
        id: surgeon.id,
        first_name: surgeon.first_name,
        last_name: surgeon.last_name,
        specialties: surgeon.specialties || [],
        contact_info: surgeon.contact_info || {},
        hospital_id: surgeon.hospital_id,
        hospital_name: surgeon.hospital_id ? hospitalMap.get(surgeon.hospital_id) : undefined,
        user_id: null, // Simplified for now
        user_name: undefined,
        cases: 0, // This would come from a cases count query in real implementation
        is_active: surgeon.is_active
      })) || [];

      setSurgeons(mappedSurgeons);
      setError(null);
    } catch (error: any) {
      console.error('Error loading surgeons:', error);
      setError('Failed to load surgeons: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadHospitals = async () => {
    try {
      const { data, error } = await supabase
        .from('hospitals')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setHospitals(data || []);
    } catch (error: any) {
      console.error('Error loading hospitals:', error);
      setError('Failed to load hospitals: ' + error.message);
    }
  };

  const loadUsers = async () => {
    // Disabled for now - will implement proper user linking later
    setUsers([]);
  };

  const handleAddSurgeon = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.specialty) {
      alert('Please fill in all required fields (First Name, Last Name, and Specialty are required)');
      return;
    }

    try {
      setLoading(true);

      const contactInfo: any = {};
      if (formData.phone) {
        contactInfo.phone = formData.phone;
      }

      const surgeonData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        specialties: [formData.specialty],
        contact_info: contactInfo,
        hospital_id: formData.hospitalId ? Number(formData.hospitalId) : null,
        is_active: true
      };

      console.log('Attempting to insert surgeon data:', surgeonData);

      const { data, error } = await supabase
        .from('surgeons')
        .insert([surgeonData])
        .select()
        .single();

      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }

      console.log('Surgeon created successfully:', data);

      // User linking disabled for now

      // Reload surgeons to get the fresh data
      await loadSurgeons();
      
      resetForm();
      setShowAddModal(false);
      setError(null);
    } catch (error: any) {
      console.error('Error adding surgeon:', error);
      setError('Failed to add surgeon: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSurgeon = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingSurgeon || !formData.firstName || !formData.lastName || !formData.specialty) {
      alert('Please fill in all required fields (First Name, Last Name, and Specialty are required)');
      return;
    }

    try {
      setLoading(true);

      const contactInfo: any = {};
      if (formData.phone) {
        contactInfo.phone = formData.phone;
      }

      const surgeonData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        specialties: [formData.specialty],
        contact_info: contactInfo,
        hospital_id: formData.hospitalId ? Number(formData.hospitalId) : null
      };

      const { error } = await supabase
        .from('surgeons')
        .update(surgeonData)
        .eq('id', editingSurgeon.id);

      if (error) throw error;

      // User linking disabled for now

      await loadSurgeons();
      resetForm();
      setEditingSurgeon(null);
      setShowAddModal(false);
      setError(null);
    } catch (error: any) {
      console.error('Error updating surgeon:', error);
      setError('Failed to update surgeon: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSurgeon = async (id: number) => {
    if (!confirm('Are you sure you want to delete this surgeon?')) {
      return;
    }

    try {
      setLoading(true);

      // Soft delete by setting is_active to false
      const { error } = await supabase
        .from('surgeons')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      await loadSurgeons();
      setError(null);
    } catch (error: any) {
      console.error('Error deleting surgeon:', error);
      setError('Failed to delete surgeon: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (surgeon: Surgeon) => {
    setEditingSurgeon(surgeon);
    setFormData({
      firstName: surgeon.first_name,
      lastName: surgeon.last_name,
      specialty: surgeon.specialties[0] || '',
      phone: surgeon.contact_info?.phone || '',
      hospitalId: surgeon.hospital_id?.toString() || '',
      userId: surgeon.user_id?.toString() || ''
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      specialty: '',
      phone: '',
      hospitalId: '',
      userId: ''
    });
    setEditingSurgeon(null);
  };

  const filteredSurgeons = surgeons.filter(surgeon =>
    `${surgeon.first_name} ${surgeon.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    surgeon.specialties.join(', ').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && surgeons.length === 0) {
    return (
      <div className="space-y-6">
        <div className="card">
          <div className="text-center py-8">
            <div className="text-gray-400">Loading surgeons...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
          <div className="text-red-400">{error}</div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* Search Toggle */}
          <button
            onClick={() => {
              setShowSearch(!showSearch);
              if (showSearch) setSearchTerm('');
            }}
            className={`p-2 rounded-lg transition-colors ${
              showSearch || searchTerm ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400 hover:text-gray-300'
            }`}
            title="Search surgeons"
          >
            <Search size={18} />
          </button>

          {/* Search Input */}
          {showSearch && (
            <div className="relative">
              <input
                type="text"
                placeholder="Search surgeons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field w-80"
                autoFocus
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          )}
        </div>

        <button 
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="btn-primary flex items-center space-x-2"
          disabled={loading}
        >
          <Plus size={18} />
          <span>Add Surgeon</span>
        </button>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Specialty</th>
              <th>Phone</th>
              <th>Primary Hospital</th>
              <th>Linked User</th>
              <th>Total Cases</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSurgeons.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center text-gray-400 py-8">
                  {searchTerm ? 'No surgeons found matching your search.' : 'No surgeons found. Add your first surgeon to get started.'}
                </td>
              </tr>
            ) : (
              filteredSurgeons.map((surgeon) => (
                <tr key={surgeon.id}>
                  <td className="font-medium text-white">
                    Dr. {surgeon.first_name} {surgeon.last_name}
                  </td>
                  <td>
                    <span className="badge badge-info">{surgeon.specialties.join(', ')}</span>
                  </td>
                  <td className="text-gray-400">
                    {surgeon.contact_info?.phone ? (
                      <div className="flex items-center">
                        <Phone size={14} className="mr-1" />
                        {surgeon.contact_info.phone}
                      </div>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="text-gray-400">
                    {surgeon.hospital_name ? (
                      <div className="flex items-center">
                        <Building2 size={14} className="mr-1" />
                        {surgeon.hospital_name}
                      </div>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="text-gray-400">
                    {surgeon.user_name ? (
                      <div className="flex items-center">
                        <User size={14} className="mr-1" />
                        {surgeon.user_name}
                      </div>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="text-white">{surgeon.cases}</td>
                  <td>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => openEditModal(surgeon)}
                        className="p-2 rounded-lg hover:bg-gray-700 text-purple-400 hover:text-purple-300"
                        disabled={loading}
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteSurgeon(surgeon.id)}
                        className="p-2 rounded-lg hover:bg-gray-700 text-red-400 hover:text-red-300"
                        disabled={loading}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-semibold text-white mb-6">
              {editingSurgeon ? 'Edit Surgeon' : 'Add New Surgeon'}
            </h2>
            <form onSubmit={editingSurgeon ? handleEditSurgeon : handleAddSurgeon} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    First Name <span className="text-red-400">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="input-field" 
                    placeholder="John" 
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Last Name <span className="text-red-400">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="input-field" 
                    placeholder="Smith" 
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Specialty <span className="text-red-400">*</span>
                </label>
                <input 
                  type="text" 
                  value={formData.specialty}
                  onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                  className="input-field" 
                  placeholder="Orthopedic Surgery, Trauma Surgery, etc." 
                  required
                  disabled={loading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone Number <span className="text-gray-500">(optional)</span>
                </label>
                <input 
                  type="tel" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="input-field" 
                  placeholder="(555) 123-4567" 
                  disabled={loading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Primary Hospital <span className="text-gray-500">(optional)</span>
                </label>
                <select 
                  value={formData.hospitalId}
                  onChange={(e) => setFormData({...formData, hospitalId: e.target.value})}
                  className="input-field"
                  disabled={loading}
                >
                  <option value="">None</option>
                  {hospitals.map(hospital => (
                    <option key={hospital.id} value={hospital.id}>
                      {hospital.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Link to User <span className="text-gray-500">(optional)</span>
                </label>
                <select 
                  value={formData.userId}
                  onChange={(e) => setFormData({...formData, userId: e.target.value})}
                  className="input-field"
                  disabled={loading}
                >
                  <option value="">None</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.first_name} {user.last_name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="btn-secondary"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : (editingSurgeon ? 'Update Surgeon' : 'Add Surgeon')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}