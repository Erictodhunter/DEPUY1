import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Activity, Search, Filter, X } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface Procedure {
  id: number;
  name: string;
  category: string;
  description?: string;
  average_duration?: number | null;
  complexity_level?: string | null;
  is_active: boolean;
}

export default function ProceduresTab() {
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProcedure, setEditingProcedure] = useState<Procedure | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    averageDuration: '',
    complexityLevel: ''
  });

  const complexityLevels = [
    'Low',
    'Medium',
    'High',
    'Critical'
  ];

  const categories = [
    'Orthopedic',
    'Trauma',
    'Joint Replacement',
    'Spine',
    'Sports Medicine',
    'Other'
  ];

  const loadProcedures = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('procedures')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      setProcedures(data || []);
      setError(null);
    } catch (error: any) {
      console.error('Error loading procedures:', error);
      setError('Failed to load procedures: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProcedure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('procedures')
        .insert([{
          name: formData.name,
          category: formData.category,
          description: formData.description || null,
          average_duration: formData.averageDuration ? parseInt(formData.averageDuration) : null,
          complexity_level: formData.complexityLevel || null,
          is_active: true
        }]);

      if (error) throw error;

      await loadProcedures();
      setShowAddModal(false);
      resetForm();
      setError(null);
    } catch (error: any) {
      console.error('Error adding procedure:', error);
      setError('Failed to add procedure: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProcedure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !editingProcedure) return;

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('procedures')
        .update({
          name: formData.name,
          category: formData.category,
          description: formData.description || null,
          average_duration: formData.averageDuration ? parseInt(formData.averageDuration) : null,
          complexity_level: formData.complexityLevel || null
        })
        .eq('id', editingProcedure.id);

      if (error) throw error;

      await loadProcedures();
      setShowAddModal(false);
      resetForm();
      setError(null);
    } catch (error: any) {
      console.error('Error updating procedure:', error);
      setError('Failed to update procedure: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProcedure = async (id: number) => {
    if (!confirm('Are you sure you want to delete this procedure?')) return;

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('procedures')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      await loadProcedures();
      setError(null);
    } catch (error: any) {
      console.error('Error deleting procedure:', error);
      setError('Failed to delete procedure: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (procedure: Procedure) => {
    setEditingProcedure(procedure);
    setFormData({
      name: procedure.name,
      category: procedure.category,
      description: procedure.description || '',
      averageDuration: procedure.average_duration?.toString() || '',
      complexityLevel: procedure.complexity_level || ''
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      description: '',
      averageDuration: '',
      complexityLevel: ''
    });
    setEditingProcedure(null);
  };

  // Filter procedures based on search and category
  const filteredProcedures = procedures.filter(procedure => {
    const matchesSearch = !searchTerm || 
      procedure.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (procedure.description && procedure.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = !filterCategory || procedure.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Get unique categories from procedures for filter dropdown
  const availableCategories = Array.from(new Set(procedures.map(p => p.category))).sort();

  useEffect(() => {
    loadProcedures();
  }, []);

  if (loading && procedures.length === 0) {
    return (
      <div className="space-y-6">
        <div className="card">
          <div className="text-center py-8">
            <div className="text-gray-400">Loading procedures...</div>
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
            title="Search procedures"
          >
            <Search size={18} />
          </button>

          {/* Filter Toggle */}
          <button 
            onClick={() => {
              setShowFilter(!showFilter);
              if (showFilter) setFilterCategory('');
            }}
            className={`p-2 rounded-lg transition-colors ${
              showFilter || filterCategory ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400 hover:text-gray-300'
            }`}
            title="Filter by category"
          >
            <Filter size={18} />
          </button>

          {/* Search Input */}
          {showSearch && (
            <div className="relative">
              <input
                type="text"
                placeholder="Search procedures..."
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

          {/* Filter Dropdown */}
          {showFilter && (
            <div className="relative">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="input-field w-48"
              >
                <option value="">All Categories</option>
                {availableCategories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {filterCategory && (
                <button
                  onClick={() => setFilterCategory('')}
                  className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
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
          <span>Add Procedure</span>
        </button>
      </div>

      {/* Results count */}
      {(searchTerm || filterCategory) && (
        <div className="text-sm text-gray-400">
          {filteredProcedures.length} of {procedures.length} procedures
          {searchTerm && ` matching "${searchTerm}"`}
          {filterCategory && ` in ${filterCategory}`}
        </div>
      )}

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Complexity</th>
              <th>Duration</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProcedures.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-gray-400 py-8">
                  {searchTerm || filterCategory ? 
                    'No procedures match your search criteria.' : 
                    'No procedures found. Add your first procedure to get started.'
                  }
                </td>
              </tr>
            ) : (
              filteredProcedures.map((procedure) => (
                <tr key={procedure.id}>
                  <td className="font-medium text-white">
                    <div className="flex items-center">
                      <Activity size={16} className="mr-2 text-green-400" />
                      {procedure.name}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-info">{procedure.category}</span>
                  </td>
                  <td className="text-gray-400">
                    {procedure.complexity_level ? (
                      <span className={`badge ${
                        procedure.complexity_level === 'Critical' ? 'badge-danger' :
                        procedure.complexity_level === 'High' ? 'badge-warning' :
                        procedure.complexity_level === 'Medium' ? 'badge-info' :
                        'badge-success'
                      }`}>
                        {procedure.complexity_level}
                      </span>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="text-gray-400">
                    {procedure.average_duration ? `${procedure.average_duration} min` : 
                     <span className="text-gray-500">-</span>}
                  </td>
                  <td className="text-gray-400 max-w-xs truncate">
                    {procedure.description || <span className="text-gray-500">-</span>}
                  </td>
                  <td>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => openEditModal(procedure)}
                        className="p-2 rounded-lg hover:bg-gray-700 text-purple-400 hover:text-purple-300"
                        disabled={loading}
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteProcedure(procedure.id)}
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
              {editingProcedure ? 'Edit Procedure' : 'Add New Procedure'}
            </h2>
            <form onSubmit={editingProcedure ? handleEditProcedure : handleAddProcedure} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Procedure Name <span className="text-red-400">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="input-field" 
                    placeholder="Total Knee Replacement" 
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category <span className="text-red-400">*</span>
                  </label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="input-field"
                    required
                    disabled={loading}
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Complexity Level <span className="text-gray-500">(optional)</span>
                  </label>
                  <select 
                    value={formData.complexityLevel}
                    onChange={(e) => setFormData({...formData, complexityLevel: e.target.value})}
                    className="input-field"
                    disabled={loading}
                  >
                    <option value="">Select Complexity</option>
                    {complexityLevels.map(level => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Average Duration (minutes) <span className="text-gray-500">(optional)</span>
                  </label>
                  <input 
                    type="number" 
                    value={formData.averageDuration}
                    onChange={(e) => setFormData({...formData, averageDuration: e.target.value})}
                    className="input-field" 
                    placeholder="120" 
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
                  placeholder="Brief description of the procedure..."
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
                  {loading ? 'Saving...' : (editingProcedure ? 'Update Procedure' : 'Add Procedure')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}