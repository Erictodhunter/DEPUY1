import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, Edit, Trash2, Save, X } from 'lucide-react';
import { getKits, createKit, Kit, supabase, getProcedures, Procedure } from '../../../lib/supabase';

interface KitFormData {
  name: string;
  kit_code: string;
  procedure_id: number | null;
  description: string;
  is_standard: boolean;
  total_cost: number;
}

export default function KitsTab() {
  const [kits, setKits] = useState<Kit[]>([]);
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingKit, setEditingKit] = useState<Kit | null>(null);
  const [formData, setFormData] = useState<KitFormData>({
    name: '',
    kit_code: '',
    procedure_id: null,
    description: '',
    is_standard: false,
    total_cost: 0
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [kitsData, proceduresData] = await Promise.all([
        getKits(),
        getProcedures()
      ]);
      setKits(kitsData);
      setProcedures(proceduresData);
    } catch (err) {
      setError('Failed to load data. Please check your Supabase configuration.');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateKitCode = () => {
    const timestamp = Date.now().toString().slice(-6);
    const randomChars = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `KIT-${randomChars}-${timestamp}`;
  };

  const handleCreateKit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.kit_code) {
      setError('Please fill in all required fields');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const newKit = await createKit({
        name: formData.name,
        kit_code: formData.kit_code,
        procedure_id: formData.procedure_id,
        description: formData.description || null,
        is_standard: formData.is_standard,
        total_cost: formData.total_cost,
        is_active: true
      });

      if (newKit) {
        setKits(prev => [newKit, ...prev]);
        setFormData({
          name: '',
          kit_code: '',
          procedure_id: null,
          description: '',
          is_standard: false,
          total_cost: 0
        });
        setShowCreateForm(false);
      } else {
        setError('Failed to create kit');
      }
    } catch (err) {
      setError('Error creating kit: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleEditKit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingKit || !formData.name || !formData.kit_code) {
      setError('Please fill in all required fields');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('kits')
        .update({
          name: formData.name,
          kit_code: formData.kit_code,
          procedure_id: formData.procedure_id,
          description: formData.description || null,
          is_standard: formData.is_standard,
          total_cost: formData.total_cost,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingKit.id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setKits(prev => prev.map(kit => kit.id === editingKit.id ? data : kit));
        setEditingKit(null);
        setFormData({
          name: '',
          kit_code: '',
          procedure_id: null,
          description: '',
          is_standard: false,
          total_cost: 0
        });
      }
    } catch (err) {
      setError('Error updating kit: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteKit = async (kitId: number) => {
    if (!window.confirm('Are you sure you want to delete this kit?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('kits')
        .delete()
        .eq('id', kitId);

      if (error) throw error;

      setKits(prev => prev.filter(kit => kit.id !== kitId));
    } catch (err) {
      setError('Error deleting kit: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const startEdit = (kit: Kit) => {
    setEditingKit(kit);
    setFormData({
      name: kit.name,
      kit_code: kit.kit_code,
      procedure_id: kit.procedure_id,
      description: kit.description || '',
      is_standard: kit.is_standard,
      total_cost: kit.total_cost
    });
    setShowCreateForm(false);
  };

  const cancelEdit = () => {
    setEditingKit(null);
    setFormData({
      name: '',
      kit_code: '',
      procedure_id: null,
      description: '',
      is_standard: false,
      total_cost: 0
    });
  };

  const getProcedureName = (procedureId: number | null | undefined) => {
    if (!procedureId) return 'No procedure assigned';
    const procedure = procedures.find(p => p.id === procedureId);
    return procedure ? procedure.name : 'Unknown procedure';
  };

  const filteredKits = kits.filter(kit => 
    kit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    kit.kit_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getProcedureName(kit.procedure_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
    (kit.description && kit.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <div className="text-gray-400">Loading kits and procedures...</div>
        </div>
      </div>
    );
  }

  if (showCreateForm || editingKit) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">
            {editingKit ? 'Edit Kit' : 'Create New Kit'}
          </h3>
          <button 
            onClick={() => {
              setShowCreateForm(false);
              cancelEdit();
            }}
            className="btn-secondary flex items-center space-x-2"
          >
            <X size={18} />
            <span>Cancel</span>
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-900/20 border border-red-500 rounded-lg">
            <div className="text-red-400">{error}</div>
          </div>
        )}

        <div className="card">
          <form onSubmit={editingKit ? handleEditKit : handleCreateKit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Kit Name *
                </label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="input-field" 
                  placeholder="Primary TKR Kit"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Kit Code *
                </label>
                <div className="flex space-x-2">
                  <input 
                    type="text" 
                    value={formData.kit_code}
                    onChange={(e) => setFormData(prev => ({ ...prev, kit_code: e.target.value }))}
                    className="input-field" 
                    placeholder="KIT-ABC-123456"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, kit_code: generateKitCode() }))}
                    className="btn-secondary whitespace-nowrap"
                  >
                    Generate
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Procedure
                </label>
                <select 
                  value={formData.procedure_id || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, procedure_id: e.target.value ? parseInt(e.target.value) : null }))}
                  className="input-field"
                >
                  <option value="">Select procedure (optional)</option>
                  {procedures.map(procedure => (
                    <option key={procedure.id} value={procedure.id}>
                                              {procedure.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Total Cost
                </label>
                <input 
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.total_cost}
                  onChange={(e) => setFormData(prev => ({ ...prev, total_cost: parseFloat(e.target.value) || 0 }))}
                  className="input-field" 
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Kit Description
              </label>
              <textarea 
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="input-field" 
                rows={3}
                placeholder="Describe the kit contents and usage"
              />
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.is_standard}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_standard: e.target.checked }))}
                  className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
                />
                <span className="text-sm text-gray-300">This is a standard kit</span>
              </label>
            </div>

            <div className="flex justify-end space-x-3">
              <button 
                type="button" 
                onClick={() => {
                  setShowCreateForm(false);
                  cancelEdit();
                }}
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
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    <span>{editingKit ? 'Update Kit' : 'Create Kit'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Medical Kits</h3>
        <button 
          onClick={() => {
            setShowCreateForm(true);
            setFormData({
              name: '',
              kit_code: generateKitCode(),
              procedure_id: null,
              description: '',
              is_standard: false,
              total_cost: 0
            });
            setError(null);
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={18} />
          <span>Create Kit</span>
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search kits by name, code, procedure, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <div className="text-sm text-gray-400">
          {filteredKits.length} of {kits.length} kits
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-900/20 border border-red-500 rounded-lg">
          <div className="text-red-400">{error}</div>
        </div>
      )}

      <div className="card">
        {filteredKits.length === 0 ? (
          <div className="text-center py-12">
            <Package size={48} className="text-gray-600 mx-auto mb-4" />
            <div className="text-gray-400 mb-2">
              {searchTerm ? 'No kits match your search' : kits.length === 0 ? 'No kits found' : 'No results'}
            </div>
            <div className="text-gray-500 text-sm mb-4">
              {searchTerm 
                ? 'Try adjusting your search terms' 
                : kits.length === 0 
                ? 'Create your first medical kit to get started' 
                : 'Try a different search'
              }
            </div>
            {!searchTerm && kits.length === 0 && (
              <button 
                onClick={() => {
                  setShowCreateForm(true);
                  setFormData({
                    name: '',
                    kit_code: generateKitCode(),
                    procedure_id: null,
                    description: '',
                    is_standard: false,
                    total_cost: 0
                  });
                  setError(null);
                }}
                className="btn-primary flex items-center space-x-2 mx-auto"
              >
                <Plus size={18} />
                <span>Create First Kit</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredKits.map((kit) => (
              <div key={kit.id} className="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="text-white font-medium mb-1">{kit.name}</h4>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="badge badge-info text-xs">{kit.kit_code}</span>
                      {kit.is_standard && (
                        <span className="badge badge-success text-xs">Standard</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">
                      {getProcedureName(kit.procedure_id)}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button 
                      onClick={() => startEdit(kit)}
                      className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                      title="Edit kit"
                    >
                      <Edit size={14} />
                    </button>
                    <button 
                      onClick={() => handleDeleteKit(kit.id)}
                      className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                      title="Delete kit"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {kit.description && (
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">{kit.description}</p>
                )}

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    <div>Cost: ${kit.total_cost.toFixed(2)}</div>
                    <div className="text-xs">Created {new Date(kit.created_at).toLocaleDateString()}</div>
                  </div>
                  <button 
                    onClick={() => startEdit(kit)}
                    className="btn-secondary text-sm"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}