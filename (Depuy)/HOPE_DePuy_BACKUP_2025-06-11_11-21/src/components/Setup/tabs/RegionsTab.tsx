import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, MapPin, Search, Filter, X } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface Region {
  id: number;
  name: string;
  code?: string | null;
  description?: string | null;
  is_active: boolean;
}

export default function RegionsTab() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRegion, setEditingRegion] = useState<Region | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: ''
  });

  const loadRegions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('regions')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      setRegions(data || []);
      setError(null);
    } catch (error: any) {
      console.error('Error loading regions:', error);
      setError('Failed to load regions: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRegion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('regions')
        .insert([{
          name: formData.name,
          code: formData.code || null,
          description: formData.description || null,
          is_active: true
        }]);

      if (error) throw error;

      await loadRegions();
      setShowAddModal(false);
      resetForm();
      setError(null);
    } catch (error: any) {
      console.error('Error adding region:', error);
      setError('Failed to add region: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditRegion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !editingRegion) return;

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('regions')
        .update({
          name: formData.name,
          code: formData.code || null,
          description: formData.description || null
        })
        .eq('id', editingRegion.id);

      if (error) throw error;

      await loadRegions();
      setShowAddModal(false);
      resetForm();
      setError(null);
    } catch (error: any) {
      console.error('Error updating region:', error);
      setError('Failed to update region: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRegion = async (id: number) => {
    if (!confirm('Are you sure you want to delete this region?')) return;

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('regions')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      await loadRegions();
      setError(null);
    } catch (error: any) {
      console.error('Error deleting region:', error);
      setError('Failed to delete region: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (region: Region) => {
    setEditingRegion(region);
    setFormData({
      name: region.name,
      code: region.code || '',
      description: region.description || ''
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: ''
    });
    setEditingRegion(null);
  };

  // Filter regions based on search
  const filteredRegions = regions.filter(region => {
    const matchesSearch = !searchTerm || 
      region.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (region.code && region.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (region.description && region.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  });

  useEffect(() => {
    loadRegions();
  }, []);

  if (loading && regions.length === 0) {
    return (
      <div className="space-y-6">
        <div className="card">
          <div className="text-center py-8">
            <div className="text-gray-400">Loading regions...</div>
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
            title="Search regions"
          >
            <Search size={18} />
          </button>

          {/* Search Input */}
          {showSearch && (
            <div className="relative">
              <input
                type="text"
                placeholder="Search regions..."
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
          <span>Add Region</span>
        </button>
      </div>

      {/* Results count */}
      {searchTerm && (
        <div className="text-sm text-gray-400">
          {filteredRegions.length} of {regions.length} regions
          {searchTerm && ` matching "${searchTerm}"`}
        </div>
      )}

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Region Name</th>
              <th>Code</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRegions.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center text-gray-400 py-8">
                  {searchTerm ? 
                    'No regions match your search criteria.' : 
                    'No regions found. Add your first region to get started.'
                  }
                </td>
              </tr>
            ) : (
              filteredRegions.map((region) => (
                <tr key={region.id}>
                  <td className="font-medium text-white">
                    <div className="flex items-center">
                      <MapPin size={16} className="mr-2 text-blue-400" />
                      {region.name}
                    </div>
                  </td>
                  <td className="text-gray-400">
                    {region.code ? (
                      <span className="badge badge-secondary">{region.code}</span>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="text-gray-400 max-w-xs truncate">
                    {region.description || <span className="text-gray-500">-</span>}
                  </td>
                  <td>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => openEditModal(region)}
                        className="p-2 rounded-lg hover:bg-gray-700 text-purple-400 hover:text-purple-300"
                        disabled={loading}
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteRegion(region.id)}
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
              {editingRegion ? 'Edit Region' : 'Add New Region'}
            </h2>
            <form onSubmit={editingRegion ? handleEditRegion : handleAddRegion} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Region Name <span className="text-red-400">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="input-field" 
                    placeholder="Northeast Region" 
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Region Code <span className="text-gray-500">(optional)</span>
                  </label>
                  <input 
                    type="text" 
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                    className="input-field" 
                    placeholder="NE" 
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description <span className="text-gray-500">(optional)</span>
                </label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="input-field" 
                  placeholder="Brief description of the region coverage..."
                  rows={3}
                  disabled={loading}
                />
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
                  {loading ? 'Saving...' : (editingRegion ? 'Update Region' : 'Add Region')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}