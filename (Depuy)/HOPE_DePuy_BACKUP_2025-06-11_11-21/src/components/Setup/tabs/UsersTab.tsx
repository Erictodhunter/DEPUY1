import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, User, Shield, Mail, Settings, Users, Lock } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface UserRole {
  id: number;
  name: string;
  display_name: string;
  description?: string;
  color: string;
  is_active: boolean;
  created_at: string;
}

interface Permission {
  id: number;
  name: string;
  display_name: string;
  description?: string;
  category: string;
  is_active: boolean;
}

interface AppUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string; // legacy field
  role_id?: number;
  status: string;
  last_login?: string | null;
  created_at: string;
  is_active: boolean;
  user_role?: UserRole;
}

interface RolePermission {
  role_id: number;
  permission_id: number;
}

export default function UsersTab() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [editingRole, setEditingRole] = useState<UserRole | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [userFormData, setUserFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    roleId: '',
    status: 'active'
  });

  const [roleFormData, setRoleFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    color: 'gray',
    selectedPermissions: [] as number[]
  });

  const statuses = ['active', 'inactive', 'pending'];
  const roleColors = [
    { value: 'gray', label: 'Gray', class: 'badge-gray' },
    { value: 'red', label: 'Red', class: 'badge-danger' },
    { value: 'orange', label: 'Orange', class: 'badge-warning' },
    { value: 'blue', label: 'Blue', class: 'badge-info' },
    { value: 'green', label: 'Green', class: 'badge-success' },
    { value: 'purple', label: 'Purple', class: 'badge-purple' }
  ];

  // Load all data
  const loadData = async () => {
    try {
      setLoading(true);
      
      const [usersRes, rolesRes, permissionsRes, rolePermissionsRes] = await Promise.all([
        supabase
          .from('users')
          .select(`
            *,
            user_role:user_roles(*)
          `)
          .eq('is_active', true)
          .order('last_name'),
        supabase
          .from('user_roles')
          .select('*')
          .eq('is_active', true)
          .order('display_name'),
        supabase
          .from('permissions')
          .select('*')
          .eq('is_active', true)
          .order('category, display_name'),
        supabase
          .from('role_permissions')
          .select('role_id, permission_id')
      ]);

      if (usersRes.error) throw usersRes.error;
      if (rolesRes.error) throw rolesRes.error;
      if (permissionsRes.error) throw permissionsRes.error;
      if (rolePermissionsRes.error) throw rolePermissionsRes.error;

      setUsers(usersRes.data || []);
      setRoles(rolesRes.data || []);
      setPermissions(permissionsRes.data || []);
      setRolePermissions(rolePermissionsRes.data || []);
      setError(null);
    } catch (error: any) {
      console.error('Error loading data:', error);
      setError('Failed to load data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // User CRUD operations
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFormData.email.trim() || !userFormData.firstName.trim() || !userFormData.lastName.trim()) return;

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('users')
        .insert([{
          email: userFormData.email,
          first_name: userFormData.firstName,
          last_name: userFormData.lastName,
          role_id: parseInt(userFormData.roleId),
          role: roles.find(r => r.id === parseInt(userFormData.roleId))?.name || 'viewer', // legacy
          status: userFormData.status,
          is_active: true,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;

      await loadData();
      setShowAddModal(false);
      resetUserForm();
      setError(null);
    } catch (error: any) {
      console.error('Error adding user:', error);
      setError('Failed to add user: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFormData.email.trim() || !userFormData.firstName.trim() || !userFormData.lastName.trim() || !editingUser) return;

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('users')
        .update({
          email: userFormData.email,
          first_name: userFormData.firstName,
          last_name: userFormData.lastName,
          role_id: parseInt(userFormData.roleId),
          role: roles.find(r => r.id === parseInt(userFormData.roleId))?.name || 'viewer', // legacy
          status: userFormData.status
        })
        .eq('id', editingUser.id);

      if (error) throw error;

      await loadData();
      setShowAddModal(false);
      resetUserForm();
      setError(null);
    } catch (error: any) {
      console.error('Error updating user:', error);
      setError('Failed to update user: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('users')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      await loadData();
      setError(null);
    } catch (error: any) {
      console.error('Error deleting user:', error);
      setError('Failed to delete user: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Role CRUD operations
  const handleAddRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleFormData.name.trim() || !roleFormData.displayName.trim()) return;

    try {
      setLoading(true);
      
      // Create role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .insert([{
          name: roleFormData.name.toLowerCase().replace(/\s+/g, '_'),
          display_name: roleFormData.displayName,
          description: roleFormData.description,
          color: roleFormData.color,
          is_active: true
        }])
        .select()
        .single();

      if (roleError) throw roleError;

      // Assign permissions
      if (roleFormData.selectedPermissions.length > 0) {
        const permissionInserts = roleFormData.selectedPermissions.map(permissionId => ({
          role_id: roleData.id,
          permission_id: permissionId
        }));

        const { error: permError } = await supabase
          .from('role_permissions')
          .insert(permissionInserts);

        if (permError) throw permError;
      }

      await loadData();
      setShowRoleModal(false);
      resetRoleForm();
      setError(null);
    } catch (error: any) {
      console.error('Error adding role:', error);
      setError('Failed to add role: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleFormData.displayName.trim() || !editingRole) return;

    try {
      setLoading(true);
      
      // Update role
      const { error: roleError } = await supabase
        .from('user_roles')
        .update({
          display_name: roleFormData.displayName,
          description: roleFormData.description,
          color: roleFormData.color
        })
        .eq('id', editingRole.id);

      if (roleError) throw roleError;

      // Update permissions - delete existing and insert new ones
      await supabase
        .from('role_permissions')
        .delete()
        .eq('role_id', editingRole.id);

      if (roleFormData.selectedPermissions.length > 0) {
        const permissionInserts = roleFormData.selectedPermissions.map(permissionId => ({
          role_id: editingRole.id,
          permission_id: permissionId
        }));

        const { error: permError } = await supabase
          .from('role_permissions')
          .insert(permissionInserts);

        if (permError) throw permError;
      }

      await loadData();
      setShowRoleModal(false);
      resetRoleForm();
      setError(null);
    } catch (error: any) {
      console.error('Error updating role:', error);
      setError('Failed to update role: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRole = async (id: number) => {
    // Check if role is being used by any users
    const usersWithRole = users.filter(user => user.role_id === id);
    if (usersWithRole.length > 0) {
      setError(`Cannot delete role: ${usersWithRole.length} user(s) are currently assigned to this role.`);
      return;
    }

    if (!confirm('Are you sure you want to delete this role?')) return;

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('user_roles')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      await loadData();
      setError(null);
    } catch (error: any) {
      console.error('Error deleting role:', error);
      setError('Failed to delete role: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const openEditUserModal = (user: AppUser) => {
    setEditingUser(user);
    setUserFormData({
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      roleId: user.role_id?.toString() || '',
      status: user.status
    });
    setShowAddModal(true);
  };

  const openEditRoleModal = (role: UserRole) => {
    setEditingRole(role);
    const rolePerms = rolePermissions.filter(rp => rp.role_id === role.id).map(rp => rp.permission_id);
    setRoleFormData({
      name: role.name,
      displayName: role.display_name,
      description: role.description || '',
      color: role.color,
      selectedPermissions: rolePerms
    });
    setShowRoleModal(true);
  };

  const resetUserForm = () => {
    setUserFormData({
      email: '',
      firstName: '',
      lastName: '',
      roleId: '',
      status: 'active'
    });
    setEditingUser(null);
  };

  const resetRoleForm = () => {
    setRoleFormData({
      name: '',
      displayName: '',
      description: '',
      color: 'gray',
      selectedPermissions: []
    });
    setEditingRole(null);
  };

  const getRoleIcon = (role: UserRole | undefined) => {
    if (!role) return <User size={16} className="mr-2 text-gray-400" />;
    
    const iconClass = role.color === 'red' ? 'text-red-400' :
                     role.color === 'orange' ? 'text-orange-400' :
                     role.color === 'blue' ? 'text-blue-400' :
                     role.color === 'green' ? 'text-green-400' :
                     role.color === 'purple' ? 'text-purple-400' :
                     'text-gray-400';
    
    return <Shield size={16} className={`mr-2 ${iconClass}`} />;
  };

  const getRoleBadgeClass = (color: string) => {
    return roleColors.find(rc => rc.value === color)?.class || 'badge-gray';
  };

  const getPermissionsByCategory = () => {
    const grouped = permissions.reduce((acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = [];
      }
      acc[permission.category].push(permission);
      return acc;
    }, {} as Record<string, Permission[]>);
    
    return grouped;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatLastLogin = (dateString: string | null | undefined) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading && users.length === 0 && roles.length === 0) {
    return (
      <div className="space-y-6">
        <div className="card">
          <div className="text-center py-8">
            <div className="text-gray-400">Loading users and roles...</div>
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

      {/* Tab Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'users'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <Users size={16} className="inline mr-2" />
            Users
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'roles'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <Settings size={16} className="inline mr-2" />
            Roles & Permissions
          </button>
        </div>

        <div className="flex items-center space-x-2">
          {activeTab === 'users' ? (
            <button 
              onClick={() => {
                resetUserForm();
                setShowAddModal(true);
              }}
              className="btn-primary flex items-center space-x-2"
              disabled={loading}
            >
              <Plus size={18} />
              <span>Add User</span>
            </button>
          ) : (
            <button 
              onClick={() => {
                resetRoleForm();
                setShowRoleModal(true);
              }}
              className="btn-primary flex items-center space-x-2"
              disabled={loading}
            >
              <Plus size={18} />
              <span>Add Role</span>
            </button>
          )}
        </div>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-gray-400 py-8">
                    No users found. Add your first user to get started.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td className="font-medium text-white">
                      <div className="flex items-center">
                        {getRoleIcon(user.user_role)}
                        {user.first_name} {user.last_name}
                      </div>
                    </td>
                    <td className="text-gray-400">
                      <div className="flex items-center">
                        <Mail size={14} className="mr-2 text-gray-500" />
                        {user.email}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${getRoleBadgeClass(user.user_role?.color || 'gray')}`}>
                        {user.user_role?.display_name || 'No Role'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${
                        user.status === 'active' ? 'badge-success' :
                        user.status === 'inactive' ? 'badge-danger' :
                        'badge-warning'
                      }`}>
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </span>
                    </td>
                    <td className="text-gray-400 text-sm">
                      {formatLastLogin(user.last_login)}
                    </td>
                    <td className="text-gray-400 text-sm">
                      {formatDate(user.created_at)}
                    </td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => openEditUserModal(user)}
                          className="p-2 rounded-lg hover:bg-gray-700 text-purple-400 hover:text-purple-300"
                          disabled={loading}
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
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
      )}

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Role Name</th>
                <th>Description</th>
                <th>Permissions</th>
                <th>Users</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-gray-400 py-8">
                    No roles found. Add your first role to get started.
                  </td>
                </tr>
              ) : (
                roles.map((role) => {
                  const rolePermCount = rolePermissions.filter(rp => rp.role_id === role.id).length;
                  const userCount = users.filter(user => user.role_id === role.id).length;
                  
                  return (
                    <tr key={role.id}>
                      <td className="font-medium text-white">
                        <div className="flex items-center">
                          <Shield size={16} className={`mr-2 ${
                            role.color === 'red' ? 'text-red-400' :
                            role.color === 'orange' ? 'text-orange-400' :
                            role.color === 'blue' ? 'text-blue-400' :
                            role.color === 'green' ? 'text-green-400' :
                            role.color === 'purple' ? 'text-purple-400' :
                            'text-gray-400'
                          }`} />
                          {role.display_name}
                        </div>
                      </td>
                      <td className="text-gray-400">
                        {role.description || '-'}
                      </td>
                      <td>
                        <div className="flex items-center">
                          <Lock size={14} className="mr-2 text-gray-500" />
                          <span className="text-gray-400">{rolePermCount} permissions</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center">
                          <User size={14} className="mr-2 text-gray-500" />
                          <span className="text-gray-400">{userCount} users</span>
                        </div>
                      </td>
                      <td className="text-gray-400 text-sm">
                        {formatDate(role.created_at)}
                      </td>
                      <td>
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => openEditRoleModal(role)}
                            className="p-2 rounded-lg hover:bg-gray-700 text-purple-400 hover:text-purple-300"
                            disabled={loading}
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteRole(role.id)}
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
      )}

      {/* Add/Edit User Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-semibold text-white mb-6">
              {editingUser ? 'Edit User' : 'Add New User'}
            </h2>
            <form onSubmit={editingUser ? handleEditUser : handleAddUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    First Name <span className="text-red-400">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={userFormData.firstName}
                    onChange={(e) => setUserFormData({...userFormData, firstName: e.target.value})}
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
                    value={userFormData.lastName}
                    onChange={(e) => setUserFormData({...userFormData, lastName: e.target.value})}
                    className="input-field" 
                    placeholder="Smith" 
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <input 
                  type="email" 
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({...userFormData, email: e.target.value})}
                  className="input-field" 
                  placeholder="john.smith@company.com" 
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Role <span className="text-red-400">*</span>
                  </label>
                  <select 
                    value={userFormData.roleId}
                    onChange={(e) => setUserFormData({...userFormData, roleId: e.target.value})}
                    className="input-field"
                    required
                    disabled={loading}
                  >
                    <option value="">Select Role</option>
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>
                        {role.display_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Status <span className="text-red-400">*</span>
                  </label>
                  <select 
                    value={userFormData.status}
                    onChange={(e) => setUserFormData({...userFormData, status: e.target.value})}
                    className="input-field"
                    disabled={loading}
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowAddModal(false);
                    resetUserForm();
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
                  {loading ? 'Saving...' : (editingUser ? 'Update User' : 'Add User')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Role Modal */}
      {showRoleModal && (
        <div className="modal-overlay" onClick={() => setShowRoleModal(false)}>
          <div className="modal max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-semibold text-white mb-6">
              {editingRole ? 'Edit Role' : 'Add New Role'}
            </h2>
            <form onSubmit={editingRole ? handleEditRole : handleAddRole} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Role Name <span className="text-red-400">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={roleFormData.displayName}
                    onChange={(e) => setRoleFormData({...roleFormData, displayName: e.target.value})}
                    className="input-field" 
                    placeholder="Sales Manager" 
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Color
                  </label>
                  <select 
                    value={roleFormData.color}
                    onChange={(e) => setRoleFormData({...roleFormData, color: e.target.value})}
                    className="input-field"
                    disabled={loading}
                  >
                    {roleColors.map(color => (
                      <option key={color.value} value={color.value}>
                        {color.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {!editingRole && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    System Name
                  </label>
                  <input 
                    type="text" 
                    value={roleFormData.name}
                    onChange={(e) => setRoleFormData({...roleFormData, name: e.target.value})}
                    className="input-field" 
                    placeholder="sales_manager (auto-generated if empty)"
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty to auto-generate from role name
                  </p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea 
                  value={roleFormData.description}
                  onChange={(e) => setRoleFormData({...roleFormData, description: e.target.value})}
                  className="input-field" 
                  placeholder="Describe what this role can do..."
                  rows={2}
                  disabled={loading}
                />
              </div>

              {/* Permissions */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-4">
                  Permissions
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(getPermissionsByCategory()).map(([category, perms]) => (
                    <div key={category} className="space-y-3">
                      <h4 className="font-medium text-white capitalize">{category}</h4>
                      <div className="space-y-2">
                        {perms.map(permission => (
                          <label key={permission.id} className="flex items-start space-x-3">
                            <input
                              type="checkbox"
                              checked={roleFormData.selectedPermissions.includes(permission.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setRoleFormData({
                                    ...roleFormData,
                                    selectedPermissions: [...roleFormData.selectedPermissions, permission.id]
                                  });
                                } else {
                                  setRoleFormData({
                                    ...roleFormData,
                                    selectedPermissions: roleFormData.selectedPermissions.filter(id => id !== permission.id)
                                  });
                                }
                              }}
                              className="mt-0.5 rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500"
                              disabled={loading}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-300">{permission.display_name}</p>
                              {permission.description && (
                                <p className="text-xs text-gray-500">{permission.description}</p>
                              )}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowRoleModal(false);
                    resetRoleForm();
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
                  {loading ? 'Saving...' : (editingRole ? 'Update Role' : 'Add Role')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}