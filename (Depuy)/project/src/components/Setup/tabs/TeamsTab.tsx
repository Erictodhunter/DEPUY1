import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Users, MapPin } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface RepTeam {
  id: number;
  name: string;
  team_lead: string;
  region_id?: number | null;
  region_name?: string;
  territories: Territory[];
  is_active: boolean;
}

interface Territory {
  id: number;
  name: string;
  team_id?: number | null;
  team_name?: string;
  coverage_area: string;
  is_active: boolean;
}

interface Region {
  id: number;
  name: string;
  code: string;
}

export default function TeamsTab() {
  const [teams, setTeams] = useState<RepTeam[]>([]);
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState<'team' | 'territory'>('team');
  const [editingTeam, setEditingTeam] = useState<RepTeam | null>(null);
  const [editingTerritory, setEditingTerritory] = useState<Territory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [teamFormData, setTeamFormData] = useState({
    name: '',
    teamLead: '',
    regionId: ''
  });

  const [territoryFormData, setTerritoryFormData] = useState({
    name: '',
    teamId: '',
    coverageArea: ''
  });

  const loadTeams = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('rep_teams')
        .select(`
          *,
          regions(name, code)
        `)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      const mappedTeams = data?.map((team: any) => ({
        id: team.id,
        name: team.name,
        team_lead: team.team_lead,
        region_id: team.region_id,
        region_name: team.regions?.name,
        territories: [],
        is_active: team.is_active
      })) || [];

      setTeams(mappedTeams);
      setError(null);
    } catch (error: any) {
      console.error('Error loading teams:', error);
      setError('Failed to load teams: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadTerritories = async () => {
    try {
      const { data, error } = await supabase
        .from('territories')
        .select(`
          *,
          rep_teams(name)
        `)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      const mappedTerritories = data?.map((territory: any) => ({
        id: territory.id,
        name: territory.name,
        team_id: territory.team_id,
        team_name: territory.rep_teams?.name,
        coverage_area: territory.coverage_area,
        is_active: territory.is_active
      })) || [];

      setTerritories(mappedTerritories);

      // Group territories under teams
      setTeams(prev => prev.map(team => ({
        ...team,
        territories: mappedTerritories.filter(t => t.team_id === team.id)
      })));
    } catch (error: any) {
      console.error('Error loading territories:', error);
      setError('Failed to load territories: ' + error.message);
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
      loadTeams(),
      loadTerritories(),
      loadRegions()
    ]);
  };

  const handleAddTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamFormData.name.trim() || !teamFormData.teamLead.trim()) return;

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('rep_teams')
        .insert([{
          name: teamFormData.name,
          team_lead: teamFormData.teamLead,
          region_id: teamFormData.regionId || null,
          is_active: true
        }]);

      if (error) throw error;

      await loadData();
      setShowAddModal(false);
      resetForm();
      setError(null);
    } catch (error: any) {
      console.error('Error adding team:', error);
      setError('Failed to add team: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTerritory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!territoryFormData.name.trim() || !territoryFormData.coverageArea.trim()) return;

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('territories')
        .insert([{
          name: territoryFormData.name,
          team_id: territoryFormData.teamId || null,
          coverage_area: territoryFormData.coverageArea,
          is_active: true
        }]);

      if (error) throw error;

      await loadData();
      setShowAddModal(false);
      resetForm();
      setError(null);
    } catch (error: any) {
      console.error('Error adding territory:', error);
      setError('Failed to add territory: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamFormData.name.trim() || !teamFormData.teamLead.trim() || !editingTeam) return;

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('rep_teams')
        .update({
          name: teamFormData.name,
          team_lead: teamFormData.teamLead,
          region_id: teamFormData.regionId || null
        })
        .eq('id', editingTeam.id);

      if (error) throw error;

      await loadData();
      setShowAddModal(false);
      resetForm();
      setError(null);
    } catch (error: any) {
      console.error('Error updating team:', error);
      setError('Failed to update team: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditTerritory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!territoryFormData.name.trim() || !territoryFormData.coverageArea.trim() || !editingTerritory) return;

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('territories')
        .update({
          name: territoryFormData.name,
          team_id: territoryFormData.teamId || null,
          coverage_area: territoryFormData.coverageArea
        })
        .eq('id', editingTerritory.id);

      if (error) throw error;

      await loadData();
      setShowAddModal(false);
      resetForm();
      setError(null);
    } catch (error: any) {
      console.error('Error updating territory:', error);
      setError('Failed to update territory: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeam = async (id: number) => {
    if (!confirm('Are you sure you want to delete this team?')) return;

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('rep_teams')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      await loadData();
      setError(null);
    } catch (error: any) {
      console.error('Error deleting team:', error);
      setError('Failed to delete team: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTerritory = async (id: number) => {
    if (!confirm('Are you sure you want to delete this territory?')) return;

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('territories')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      await loadData();
      setError(null);
    } catch (error: any) {
      console.error('Error deleting territory:', error);
      setError('Failed to delete territory: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = (type: 'team' | 'territory') => {
    setModalType(type);
    setEditingTeam(null);
    setEditingTerritory(null);
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (item: any) => {
    if (item.type === 'team') {
      setModalType('team');
      setEditingTeam(item);
      setEditingTerritory(null);
      setTeamFormData({
        name: item.name,
        teamLead: item.team_lead,
        regionId: item.region_id?.toString() || ''
      });
    } else {
      setModalType('territory');
      setEditingTerritory(item);
      setEditingTeam(null);
      setTerritoryFormData({
        name: item.name,
        teamId: item.team_id?.toString() || '',
        coverageArea: item.coverage_area
      });
    }
    setShowAddModal(true);
  };

  const resetForm = () => {
    setTeamFormData({
      name: '',
      teamLead: '',
      regionId: ''
    });
    setTerritoryFormData({
      name: '',
      teamId: '',
      coverageArea: ''
    });
    setEditingTeam(null);
    setEditingTerritory(null);
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading && teams.length === 0 && territories.length === 0) {
    return (
      <div className="space-y-6">
        <div className="card">
          <div className="text-center py-8">
            <div className="text-gray-400">Loading teams and territories...</div>
          </div>
        </div>
      </div>
    );
  }

  // Create hierarchical display
  const independentTerritories = territories.filter(t => !t.team_id);
  const teamsWithTerritories = teams.map(team => ({
    ...team,
    type: 'team' as const,
    territories: territories.filter(t => t.team_id === team.id)
  }));

  const allItems: any[] = [];
  
  // Add teams and their territories
  teamsWithTerritories.forEach(team => {
    allItems.push({ ...team, type: 'team' as const });
    team.territories.forEach(territory => {
      allItems.push({ ...territory, type: 'territory' as const, isChild: true });
    });
  });
  
  // Add independent territories
  if (teamsWithTerritories.length > 0 && independentTerritories.length > 0) {
    allItems.push({ 
      id: -1, 
      name: 'Independent Territories', 
      type: 'separator' as const, 
      isChild: false 
    });
  }
  
  independentTerritories.forEach(territory => {
    allItems.push({ ...territory, type: 'territory' as const, isChild: false });
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
            onClick={() => openAddModal('team')}
            className="btn-secondary flex items-center space-x-2"
            disabled={loading}
          >
            <Plus size={18} />
            <span>Add Team</span>
          </button>
          <button 
            onClick={() => openAddModal('territory')}
            className="btn-primary flex items-center space-x-2"
            disabled={loading}
          >
            <Plus size={18} />
            <span>Add Territory</span>
          </button>
        </div>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Region/Coverage</th>
              <th>Details</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {allItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-gray-400 py-8">
                  No teams or territories found. Add your first team or territory to get started.
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
                        {item.type === 'team' ? 
                          <Users size={16} className="mr-2 text-blue-400" /> :
                          <MapPin size={16} className="mr-2 text-green-400" />
                        }
                        {item.name}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${item.type === 'team' ? 'badge-info' : 'badge-success'}`}>
                        {item.type === 'team' ? 'Rep Team' : item.isChild ? 'Team Territory' : 'Independent Territory'}
                      </span>
                    </td>
                    <td className="text-gray-400">
                      {item.type === 'team' ? 
                        (item.region_name || <span className="text-gray-500">-</span>) :
                        item.coverage_area
                      }
                    </td>
                    <td className="text-gray-400">
                      {item.type === 'team' ? (
                        <div className="text-sm">
                          <div>Lead: {item.team_lead}</div>
                          <div>{item.territories?.length || 0} territories</div>
                        </div>
                      ) : (
                        <span className="text-gray-500">-</span>
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
                            if (item.type === 'team') {
                              handleDeleteTeam(item.id);
                            } else {
                              handleDeleteTerritory(item.id);
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

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-semibold text-white mb-6">
              {editingTeam || editingTerritory ? 'Edit' : 'Add New'} {modalType === 'team' ? 'Rep Team' : 'Territory'}
            </h2>
            <form className="space-y-4" onSubmit={
              editingTeam ? handleEditTeam :
              editingTerritory ? handleEditTerritory :
              modalType === 'team' ? handleAddTeam : handleAddTerritory
            }>
              {modalType === 'team' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Team Name <span className="text-red-400">*</span>
                    </label>
                    <input 
                      type="text" 
                      value={teamFormData.name}
                      onChange={(e) => setTeamFormData({...teamFormData, name: e.target.value})}
                      className="input-field" 
                      placeholder="Northeast Sales Team" 
                      required
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Team Lead <span className="text-red-400">*</span>
                    </label>
                    <input 
                      type="text" 
                      value={teamFormData.teamLead}
                      onChange={(e) => setTeamFormData({...teamFormData, teamLead: e.target.value})}
                      className="input-field" 
                      placeholder="John Smith" 
                      required
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Region <span className="text-gray-500">(optional)</span>
                    </label>
                    <select 
                      value={teamFormData.regionId}
                      onChange={(e) => setTeamFormData({...teamFormData, regionId: e.target.value})}
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
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Territory Name <span className="text-red-400">*</span>
                    </label>
                    <input 
                      type="text" 
                      value={territoryFormData.name}
                      onChange={(e) => setTerritoryFormData({...territoryFormData, name: e.target.value})}
                      className="input-field" 
                      placeholder="Boston Metro" 
                      required
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Assigned Team <span className="text-gray-500">(optional)</span>
                    </label>
                    <select 
                      value={territoryFormData.teamId}
                      onChange={(e) => setTerritoryFormData({...territoryFormData, teamId: e.target.value})}
                      className="input-field"
                      disabled={loading}
                    >
                      <option value="">Independent Territory</option>
                      {teams.map(team => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Coverage Area <span className="text-red-400">*</span>
                    </label>
                    <input 
                      type="text" 
                      value={territoryFormData.coverageArea}
                      onChange={(e) => setTerritoryFormData({...territoryFormData, coverageArea: e.target.value})}
                      className="input-field" 
                      placeholder="Boston, Cambridge, Somerville" 
                      required
                      disabled={loading}
                    />
                  </div>
                </>
              )}
              
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
                  {loading ? 'Saving...' : 
                   editingTeam || editingTerritory ? `Update ${modalType === 'team' ? 'Team' : 'Territory'}` :
                   `Add ${modalType === 'team' ? 'Team' : 'Territory'}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}