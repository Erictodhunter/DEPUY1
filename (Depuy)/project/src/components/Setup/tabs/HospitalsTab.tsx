import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Building2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface HospitalSystem {
  id: number;
  name: string;
  headquarters_address: any;
  contact_info: any;
  region_id: number | null;
  region_name?: string;
  is_active: boolean;
}

interface Hospital {
  id: number;
  name: string;
  hospital_system_id?: number | null;
  hospital_system_name?: string;
  address: any;
  contact_info: any;
  region_id: number | null;
  region_name?: string;
  bed_count?: number | null;
  trauma_level?: string | null;
  is_active: boolean;
}

interface Region {
  id: number;
  name: string;
  code: string;
}

export default function HospitalsTab() {
  const [hospitalSystems, setHospitalSystems] = useState<HospitalSystem[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState<'system' | 'hospital'>('system');
  const [editingSystem, setEditingSystem] = useState<HospitalSystem | null>(null);
  const [editingHospital, setEditingHospital] = useState<Hospital | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [systemFormData, setSystemFormData] = useState({
    name: '',
    regionId: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: ''
  });

  const [hospitalFormData, setHospitalFormData] = useState({
    name: '',
    systemId: '',
    regionId: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    bedCount: '',
    traumaLevel: ''
  });

  const traumaLevels = [
    'Level 1',
    'Level 2', 
    'Level 3',
    'Level 4',
    'None'
  ];

  const loadHospitalSystems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('hospital_systems')
        .select(`
          *,
          regions(name, code)
        `)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      const mappedSystems = data?.map((system: any) => ({
        id: system.id,
        name: system.name,
        headquarters_address: system.headquarters_address || {},
        contact_info: system.contact_info || {},
        region_id: system.region_id,
        region_name: system.regions?.name,
        is_active: system.is_active
      })) || [];

      setHospitalSystems(mappedSystems);
      setError(null);
    } catch (error: any) {
      console.error('Error loading hospital systems:', error);
      setError('Failed to load hospital systems: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadHospitals = async () => {
    try {
      const { data, error } = await supabase
        .from('hospitals')
        .select(`
          *,
          hospital_systems(name),
          regions(name, code)
        `)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      const mappedHospitals = data?.map((hospital: any) => ({
        id: hospital.id,
        name: hospital.name,
        hospital_system_id: hospital.hospital_system_id,
        hospital_system_name: hospital.hospital_systems?.name,
        address: hospital.address || {},
        contact_info: hospital.contact_info || {},
        region_id: hospital.region_id,
        region_name: hospital.regions?.name,
        bed_count: hospital.bed_count,
        trauma_level: hospital.trauma_level,
        is_active: hospital.is_active
      })) || [];

      setHospitals(mappedHospitals);
    } catch (error: any) {
      console.error('Error loading hospitals:', error);
      setError('Failed to load hospitals: ' + error.message);
    }
  };

  const loadRegions = async () => {
    try {
      const { data, error } = await supabase
        .from('regions')
        .select('id, name, code')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setRegions(data || []);
    } catch (error: any) {
      console.error('Error loading regions:', error);
      setError('Failed to load regions: ' + error.message);
    }
  };

  const loadData = async () => {
    await Promise.all([
      loadHospitalSystems(),
      loadHospitals(),
      loadRegions()
    ]);
  };

  const openAddModal = (type: 'system' | 'hospital') => {
    setModalType(type);
    setEditingSystem(null);
    setEditingHospital(null);
    resetForm();
    setShowAddModal(true);
  };

  const handleAddSystem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!systemFormData.name.trim()) return;

    try {
      setLoading(true);
      
      const addressData = systemFormData.address || systemFormData.city || systemFormData.state || systemFormData.zipCode ? {
        street: systemFormData.address,
        city: systemFormData.city,
        state: systemFormData.state,
        zip: systemFormData.zipCode
      } : null;

      const contactData = systemFormData.contactPerson || systemFormData.contactEmail || systemFormData.contactPhone ? {
        person: systemFormData.contactPerson,
        email: systemFormData.contactEmail,
        phone: systemFormData.contactPhone
      } : null;

      const { data, error } = await supabase
        .from('hospital_systems')
        .insert([{
          name: systemFormData.name,
          region_id: systemFormData.regionId || null,
          headquarters_address: addressData,
          contact_info: contactData,
          is_active: true
        }])
        .select();

      if (error) throw error;

      // Refresh data
      await loadData();
      
      // Close modal and reset form
      setShowAddModal(false);
      resetForm();
      setError(null);
      
      console.log('System added successfully:', data);
    } catch (error: any) {
      console.error('Error adding system:', error);
      setError('Failed to add system: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddHospital = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hospitalFormData.name.trim()) return;

    try {
      setLoading(true);
      
      const addressData = hospitalFormData.address || hospitalFormData.city || hospitalFormData.state || hospitalFormData.zipCode ? {
        street: hospitalFormData.address,
        city: hospitalFormData.city,
        state: hospitalFormData.state,
        zip: hospitalFormData.zipCode
      } : null;

      const contactData = hospitalFormData.contactPerson || hospitalFormData.contactEmail || hospitalFormData.contactPhone ? {
        person: hospitalFormData.contactPerson,
        email: hospitalFormData.contactEmail,
        phone: hospitalFormData.contactPhone
      } : null;

      const { data, error } = await supabase
        .from('hospitals')
        .insert([{
          name: hospitalFormData.name,
          hospital_system_id: hospitalFormData.systemId || null,
          region_id: hospitalFormData.regionId || null,
          address: addressData,
          contact_info: contactData,
          bed_count: hospitalFormData.bedCount ? parseInt(hospitalFormData.bedCount) : null,
          trauma_level: hospitalFormData.traumaLevel || null,
          is_active: true
        }])
        .select();

      if (error) throw error;

      // Refresh data
      await loadData();
      
      // Close modal and reset form
      setShowAddModal(false);
      resetForm();
      setError(null);
      
      console.log('Hospital added successfully:', data);
    } catch (error: any) {
      console.error('Error adding hospital:', error);
      setError('Failed to add hospital: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSystem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!systemFormData.name.trim() || !editingSystem) return;

    try {
      setLoading(true);
      
      const addressData = systemFormData.address || systemFormData.city || systemFormData.state || systemFormData.zipCode ? {
        street: systemFormData.address,
        city: systemFormData.city,
        state: systemFormData.state,
        zip: systemFormData.zipCode
      } : null;

      const contactData = systemFormData.contactPerson || systemFormData.contactEmail || systemFormData.contactPhone ? {
        person: systemFormData.contactPerson,
        email: systemFormData.contactEmail,
        phone: systemFormData.contactPhone
      } : null;

      const { error } = await supabase
        .from('hospital_systems')
        .update({
          name: systemFormData.name,
          region_id: systemFormData.regionId || null,
          headquarters_address: addressData,
          contact_info: contactData
        })
        .eq('id', editingSystem.id);

      if (error) throw error;

      await loadData();
      setShowAddModal(false);
      resetForm();
      setError(null);
      
      console.log('System updated successfully');
    } catch (error: any) {
      console.error('Error updating system:', error);
      setError('Failed to update system: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditHospital = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hospitalFormData.name.trim() || !editingHospital) return;

    try {
      setLoading(true);
      
      const addressData = hospitalFormData.address || hospitalFormData.city || hospitalFormData.state || hospitalFormData.zipCode ? {
        street: hospitalFormData.address,
        city: hospitalFormData.city,
        state: hospitalFormData.state,
        zip: hospitalFormData.zipCode
      } : null;

      const contactData = hospitalFormData.contactPerson || hospitalFormData.contactEmail || hospitalFormData.contactPhone ? {
        person: hospitalFormData.contactPerson,
        email: hospitalFormData.contactEmail,
        phone: hospitalFormData.contactPhone
      } : null;

      const { error } = await supabase
        .from('hospitals')
        .update({
          name: hospitalFormData.name,
          hospital_system_id: hospitalFormData.systemId || null,
          region_id: hospitalFormData.regionId || null,
          address: addressData,
          contact_info: contactData,
          bed_count: hospitalFormData.bedCount ? parseInt(hospitalFormData.bedCount) : null,
          trauma_level: hospitalFormData.traumaLevel || null
        })
        .eq('id', editingHospital.id);

      if (error) throw error;

      await loadData();
      setShowAddModal(false);
      resetForm();
      setError(null);
      
      console.log('Hospital updated successfully');
    } catch (error: any) {
      console.error('Error updating hospital:', error);
      setError('Failed to update hospital: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSystem = async (id: number) => {
    if (!confirm('Are you sure you want to delete this hospital system?')) return;

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('hospital_systems')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      await loadData();
      setError(null);
      
      console.log('System deleted successfully');
    } catch (error: any) {
      console.error('Error deleting system:', error);
      setError('Failed to delete system: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHospital = async (id: number) => {
    if (!confirm('Are you sure you want to delete this hospital?')) return;

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('hospitals')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      await loadData();
      setError(null);
      
      console.log('Hospital deleted successfully');
    } catch (error: any) {
      console.error('Error deleting hospital:', error);
      setError('Failed to delete hospital: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (item: any) => {
    if (item.type === 'system') {
      setModalType('system');
      setEditingSystem(item);
      setEditingHospital(null);
      
      // Pre-fill form with system data
      setSystemFormData({
        name: item.name || '',
        regionId: item.region_id?.toString() || '',
        address: item.headquarters_address?.street || '',
        city: item.headquarters_address?.city || '',
        state: item.headquarters_address?.state || '',
        zipCode: item.headquarters_address?.zip || '',
        contactPerson: item.contact_info?.person || '',
        contactEmail: item.contact_info?.email || '',
        contactPhone: item.contact_info?.phone || ''
      });
    } else {
      setModalType('hospital');
      setEditingHospital(item);
      setEditingSystem(null);
      
      // Pre-fill form with hospital data
      setHospitalFormData({
        name: item.name || '',
        systemId: item.hospital_system_id?.toString() || '',
        regionId: item.region_id?.toString() || '',
        address: item.address?.street || '',
        city: item.address?.city || '',
        state: item.address?.state || '',
        zipCode: item.address?.zip || '',
        contactPerson: item.contact_info?.person || '',
        contactEmail: item.contact_info?.email || '',
        contactPhone: item.contact_info?.phone || '',
        bedCount: item.bed_count?.toString() || '',
        traumaLevel: item.trauma_level || ''
      });
    }
    
    setShowAddModal(true);
  };

  const resetForm = () => {
    setSystemFormData({
      name: '',
      regionId: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      contactPerson: '',
      contactEmail: '',
      contactPhone: ''
    });
    setHospitalFormData({
      name: '',
      systemId: '',
      regionId: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      contactPerson: '',
      contactEmail: '',
      contactPhone: '',
      bedCount: '',
      traumaLevel: ''
    });
    setEditingSystem(null);
    setEditingHospital(null);
  };

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  if (loading && hospitalSystems.length === 0 && hospitals.length === 0) {
    return (
      <div className="space-y-6">
        <div className="card">
          <div className="text-center py-8">
            <div className="text-gray-400">Loading hospitals and systems...</div>
          </div>
        </div>
      </div>
    );
  }

  // Group hospitals under their systems and separate independent hospitals
  const independentHospitals = hospitals.filter(h => !h.hospital_system_id);
  const systemsWithHospitals = hospitalSystems.map(system => ({
    ...system,
    type: 'system' as const,
    hospitals: hospitals.filter(h => h.hospital_system_id === system.id)
  }));

  // Create flat display list with hierarchy
  const allItems = [];
  
  // Add systems and their hospitals
  systemsWithHospitals.forEach(system => {
    allItems.push({ ...system, type: 'system' as const });
    system.hospitals.forEach(hospital => {
      allItems.push({ ...hospital, type: 'hospital' as const, isChild: true });
    });
  });
  
  // Add independent hospitals with a separator if there are both systems and independent hospitals
  if (systemsWithHospitals.length > 0 && independentHospitals.length > 0) {
    allItems.push({ 
      id: -1, 
      name: 'Independent Hospitals', 
      type: 'separator' as const, 
      isChild: false 
    });
  }
  
  independentHospitals.forEach(hospital => {
    allItems.push({ ...hospital, type: 'hospital' as const, isChild: false });
  });

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
          <div className="text-red-400">{error}</div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div></div>
        <div className="flex space-x-3">
          <button 
            onClick={() => openAddModal('system')}
            className="btn-secondary flex items-center space-x-2"
            disabled={loading}
          >
            <Plus size={18} />
            <span>Add System</span>
          </button>
          <button 
            onClick={() => openAddModal('hospital')}
            className="btn-primary flex items-center space-x-2"
            disabled={loading}
          >
            <Plus size={18} />
            <span>Add Hospital</span>
          </button>
        </div>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Region</th>
              <th>Details</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {allItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-gray-400 py-8">
                  No hospitals or systems found. Add your first hospital or system to get started.
                </td>
              </tr>
            ) : (
              allItems.map((item: any) => {
                if (item.type === 'separator') {
                  return (
                    <tr key={`separator-${item.id}`} className="bg-slate-700/20">
                      <td colSpan={5} className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="flex-1 h-px bg-gray-600"></div>
                          <span className="px-4 text-gray-400 font-medium">{item.name}</span>
                          <div className="flex-1 h-px bg-gray-600"></div>
                        </div>
                      </td>
                    </tr>
                  );
                }
                
                return (
                  <tr key={`${item.type}-${item.id}`} className={item.isChild ? 'bg-slate-800/30' : ''}>
                    <td className="font-medium text-white">
                      <div className={`flex items-center ${item.isChild ? 'pl-8' : ''}`}>
                        {item.isChild && <div className="w-4 h-px bg-gray-600 mr-2"></div>}
                        <Building2 size={16} className={`mr-2 ${item.type === 'system' ? 'text-blue-400' : 'text-green-400'}`} />
                        {item.name}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${item.type === 'system' ? 'badge-info' : 'badge-success'}`}>
                        {item.type === 'system' ? 'Hospital System' : item.isChild ? 'System Hospital' : 'Independent Hospital'}
                      </span>
                    </td>
                    <td className="text-gray-400">
                      {item.region_name || <span className="text-gray-500">-</span>}
                    </td>
                    <td className="text-gray-400">
                      {item.type === 'hospital' ? (
                        <div className="text-sm">
                          {(item as Hospital).bed_count && (
                            <div>Beds: {(item as Hospital).bed_count}</div>
                          )}
                          {(item as Hospital).trauma_level && (
                            <div>Trauma: {(item as Hospital).trauma_level}</div>
                          )}
                          {!(item as Hospital).bed_count && !(item as Hospital).trauma_level && (
                            <span className="text-gray-500">-</span>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">
                          {(item as any).hospitals?.length || 0} hospitals
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => openEditModal(item)}
                          className="p-2 rounded-lg hover:bg-gray-700 text-purple-400 hover:text-purple-300"
                          disabled={loading}
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => {
                            if (item.type === 'system') {
                              handleDeleteSystem(item.id);
                            } else {
                              handleDeleteHospital(item.id);
                            }
                          }}
                          className="p-2 rounded-lg hover:bg-gray-700 text-red-400 hover:text-red-300"
                          disabled={loading}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-semibold text-white mb-6">
              {editingSystem || editingHospital ? 'Edit' : 'Add New'} {modalType === 'system' ? 'Hospital System' : 'Hospital'}
            </h2>
            <form className="space-y-4" onSubmit={
              editingSystem ? handleEditSystem :
              editingHospital ? handleEditHospital :
              modalType === 'system' ? handleAddSystem : handleAddHospital
            }>
              {modalType === 'system' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      System Name <span className="text-red-400">*</span>
                    </label>
                    <input 
                      type="text" 
                      value={systemFormData.name}
                      onChange={(e) => setSystemFormData({...systemFormData, name: e.target.value})}
                      className="input-field" 
                      placeholder="Metro Health System" 
                      required
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Region <span className="text-gray-500">(optional)</span>
                    </label>
                    <select 
                      value={systemFormData.regionId}
                      onChange={(e) => setSystemFormData({...systemFormData, regionId: e.target.value})}
                      className="input-field"
                      disabled={loading}
                    >
                      <option value="">No Region</option>
                      {regions.map(region => (
                        <option key={region.id} value={region.id}>
                          {region.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Headquarters Address</label>
                    <input 
                      type="text" 
                      value={systemFormData.address}
                      onChange={(e) => setSystemFormData({...systemFormData, address: e.target.value})}
                      className="input-field" 
                      placeholder="123 Medical Plaza Drive" 
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">City</label>
                      <input 
                        type="text" 
                        value={systemFormData.city}
                        onChange={(e) => setSystemFormData({...systemFormData, city: e.target.value})}
                        className="input-field" 
                        placeholder="Boston" 
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">State</label>
                      <input 
                        type="text" 
                        value={systemFormData.state}
                        onChange={(e) => setSystemFormData({...systemFormData, state: e.target.value})}
                        className="input-field" 
                        placeholder="MA" 
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">ZIP Code</label>
                      <input 
                        type="text" 
                        value={systemFormData.zipCode}
                        onChange={(e) => setSystemFormData({...systemFormData, zipCode: e.target.value})}
                        className="input-field" 
                        placeholder="02101" 
                        disabled={loading}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Hospital Name <span className="text-red-400">*</span>
                    </label>
                    <input 
                      type="text" 
                      value={hospitalFormData.name}
                      onChange={(e) => setHospitalFormData({...hospitalFormData, name: e.target.value})}
                      className="input-field" 
                      placeholder="General Hospital" 
                      required
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Parent System <span className="text-gray-500">(optional)</span>
                    </label>
                    <select 
                      value={hospitalFormData.systemId}
                      onChange={(e) => setHospitalFormData({...hospitalFormData, systemId: e.target.value})}
                      className="input-field"
                      disabled={loading}
                    >
                      <option value="">Independent Hospital</option>
                      {hospitalSystems.map(system => (
                        <option key={system.id} value={system.id}>
                          {system.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Region <span className="text-gray-500">(optional)</span>
                    </label>
                    <select 
                      value={hospitalFormData.regionId}
                      onChange={(e) => setHospitalFormData({...hospitalFormData, regionId: e.target.value})}
                      className="input-field"
                      disabled={loading}
                    >
                      <option value="">No Region</option>
                      {regions.map(region => (
                        <option key={region.id} value={region.id}>
                          {region.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Number of Beds</label>
                      <input 
                        type="number" 
                        value={hospitalFormData.bedCount}
                        onChange={(e) => setHospitalFormData({...hospitalFormData, bedCount: e.target.value})}
                        className="input-field" 
                        placeholder="450" 
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Trauma Level</label>
                      <select 
                        value={hospitalFormData.traumaLevel}
                        onChange={(e) => setHospitalFormData({...hospitalFormData, traumaLevel: e.target.value})}
                        className="input-field"
                        disabled={loading}
                      >
                        <option value="">Select Trauma Level</option>
                        {traumaLevels.map(level => (
                          <option key={level} value={level}>
                            {level}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}
              
              <div className="flex justify-end space-x-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
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
                  {loading ? 'Saving...' : 
                   editingSystem || editingHospital ? `Update ${modalType === 'system' ? 'System' : 'Hospital'}` :
                   `Add ${modalType === 'system' ? 'System' : 'Hospital'}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
