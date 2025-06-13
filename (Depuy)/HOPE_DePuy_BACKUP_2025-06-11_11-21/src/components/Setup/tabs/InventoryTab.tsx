import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Building, Package, Search, Filter, X } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface Manufacturer {
  id: number;
  name: string;
  contact_info?: any;
  is_active: boolean;
}

interface InventoryItem {
  id: number;
  name: string;
  manufacturer_id: number;
  sku?: string | null;
  description?: string | null;
  price?: number | null;
  stock_quantity?: number | null;
  is_active: boolean;
}

interface DisplayItem {
  id: number;
  type: 'manufacturer' | 'item' | 'separator';
  name: string;
  manufacturer?: Manufacturer;
  item?: InventoryItem;
  isChild?: boolean;
  itemCount?: number;
}

export default function InventoryTab() {
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingManufacturer, setEditingManufacturer] = useState<Manufacturer | null>(null);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  const [formData, setFormData] = useState({
    companyName: '',
    contactInfo: '',
    itemName: '',
    sku: '',
    description: '',
    unitPrice: '',
    stockQuantity: '',
    manufacturerId: ''
  });

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [manufacturersRes, itemsRes] = await Promise.all([
        supabase
          .from('manufacturers')
          .select('*')
          .eq('is_active', true)
          .order('name'),
        supabase
          .from('inventory_items')
          .select('*')
          .eq('is_active', true)
          .order('name')
      ]);

      if (manufacturersRes.error) throw manufacturersRes.error;
      if (itemsRes.error) throw itemsRes.error;

      setManufacturers(manufacturersRes.data || []);
      setInventoryItems(itemsRes.data || []);
      setError(null);
    } catch (error: any) {
      console.error('Error loading data:', error);
      setError('Failed to load data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddManufacturer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName.trim()) return;

    try {
      setLoading(true);
      
      // Parse contact info safely
      let contactInfo = null;
      if (formData.contactInfo?.trim()) {
        try {
          contactInfo = JSON.parse(formData.contactInfo);
        } catch (jsonError) {
          // If it's not valid JSON, treat it as a simple string
          contactInfo = { note: formData.contactInfo.trim() };
        }
      }
      
      const { error } = await supabase
        .from('manufacturers')
        .insert([{
          name: formData.companyName,
          contact_info: contactInfo,
          is_active: true
        }]);

      if (error) throw error;

      await loadData();
      setShowAddModal(false);
      resetForm();
      setError(null);
    } catch (error: any) {
      console.error('Error adding manufacturer:', error);
      setError('Failed to add manufacturer: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditManufacturer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName.trim() || !editingManufacturer) return;

    try {
      setLoading(true);
      
      // Parse contact info safely
      let contactInfo = null;
      if (formData.contactInfo?.trim()) {
        try {
          contactInfo = JSON.parse(formData.contactInfo);
        } catch (jsonError) {
          // If it's not valid JSON, treat it as a simple string
          contactInfo = { note: formData.contactInfo.trim() };
        }
      }
      
      const { error } = await supabase
        .from('manufacturers')
        .update({
          name: formData.companyName,
          contact_info: contactInfo
        })
        .eq('id', editingManufacturer.id);

      if (error) throw error;

      await loadData();
      setShowAddModal(false);
      resetForm();
      setError(null);
    } catch (error: any) {
      console.error('Error updating manufacturer:', error);
      setError('Failed to update manufacturer: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.itemName.trim() || !formData.manufacturerId) return;

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('inventory_items')
        .insert([{
          name: formData.itemName,
          manufacturer_id: parseInt(formData.manufacturerId),
          sku: formData.sku || null,
          description: formData.description || null,
          price: formData.unitPrice ? parseFloat(formData.unitPrice) : null,
          stock_quantity: formData.stockQuantity ? parseInt(formData.stockQuantity) : null,
          is_active: true
        }]);

      if (error) throw error;

      await loadData();
      setShowAddModal(false);
      resetForm();
      setError(null);
    } catch (error: any) {
      console.error('Error adding item:', error);
      setError('Failed to add item: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.itemName.trim() || !editingItem) return;

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('inventory_items')
        .update({
          name: formData.itemName,
          manufacturer_id: parseInt(formData.manufacturerId),
          sku: formData.sku || null,
          description: formData.description || null,
          price: formData.unitPrice ? parseFloat(formData.unitPrice) : null,
          stock_quantity: formData.stockQuantity ? parseInt(formData.stockQuantity) : null
        })
        .eq('id', editingItem.id);

      if (error) throw error;

      await loadData();
      setShowAddModal(false);
      resetForm();
      setError(null);
    } catch (error: any) {
      console.error('Error updating item:', error);
      setError('Failed to update item: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteManufacturer = async (id: number) => {
    if (!confirm('Are you sure you want to delete this manufacturer? This will also remove all associated inventory items.')) return;

    try {
      setLoading(true);
      
      // Delete associated items first
      await supabase
        .from('inventory_items')
        .update({ is_active: false })
        .eq('manufacturer_id', id);

      // Then delete manufacturer
      const { error } = await supabase
        .from('manufacturers')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      await loadData();
      setError(null);
    } catch (error: any) {
      console.error('Error deleting manufacturer:', error);
      setError('Failed to delete manufacturer: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (!confirm('Are you sure you want to delete this inventory item?')) return;

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('inventory_items')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      await loadData();
      setError(null);
    } catch (error: any) {
      console.error('Error deleting item:', error);
      setError('Failed to delete item: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const openEditManufacturerModal = (manufacturer: Manufacturer) => {
    setEditingManufacturer(manufacturer);
    setEditingItem(null);
    setIsAddingItem(false);
    setFormData({
      companyName: manufacturer.name,
      contactInfo: manufacturer.contact_info ? JSON.stringify(manufacturer.contact_info, null, 2) : '',
      itemName: '',
      sku: '',
      description: '',
      unitPrice: '',
      stockQuantity: '',
      manufacturerId: ''
    });
    setShowAddModal(true);
  };

  const openEditItemModal = (item: InventoryItem) => {
    setEditingItem(item);
    setEditingManufacturer(null);
    setIsAddingItem(true);
    setFormData({
      companyName: '',
      contactInfo: '',
      itemName: item.name,
      sku: item.sku || '',
      description: item.description || '',
      unitPrice: item.price?.toString() || '',
      stockQuantity: item.stock_quantity?.toString() || '',
      manufacturerId: item.manufacturer_id.toString()
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setFormData({
      companyName: '',
      contactInfo: '',
      itemName: '',
      sku: '',
      description: '',
      unitPrice: '',
      stockQuantity: '',
      manufacturerId: ''
    });
    setEditingManufacturer(null);
    setEditingItem(null);
    setIsAddingItem(false);
  };

  // Create hierarchical display data
  const createDisplayData = (): DisplayItem[] => {
    const displayItems: DisplayItem[] = [];
    
    // Filter data based on search and type
    const filteredManufacturers = manufacturers.filter(manufacturer => {
      if (searchTerm) {
        return manufacturer.name.toLowerCase().includes(searchTerm.toLowerCase());
      }
      return true;
    });

    const filteredItems = inventoryItems.filter(item => {
      if (searchTerm) {
        const matchesName = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSku = item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDescription = item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase());
        if (!matchesName && !matchesSku && !matchesDescription) return false;
      }
      return true;
    });

    // Add manufacturers with their items
    filteredManufacturers.forEach(manufacturer => {
      const manufacturerItems = filteredItems.filter(item => item.manufacturer_id === manufacturer.id);
      
      // Add manufacturer
      displayItems.push({
        id: manufacturer.id,
        type: 'manufacturer',
        name: manufacturer.name,
        manufacturer,
        itemCount: manufacturerItems.length
      });

      // Add manufacturer's items
      manufacturerItems.forEach(item => {
        displayItems.push({
          id: item.id,
          type: 'item',
          name: item.name,
          item,
          isChild: true
        });
      });
    });

    // Add independent items (items without manufacturer)
    const independentItems = filteredItems.filter(item => 
      !manufacturers.some(m => m.id === item.manufacturer_id)
    );

    if (independentItems.length > 0) {
      displayItems.push({
        id: -1,
        type: 'separator',
        name: 'Independent Items'
      });

      independentItems.forEach(item => {
        displayItems.push({
          id: item.id,
          type: 'item',
          name: item.name,
          item
        });
      });
    }

    return displayItems;
  };

  const displayData = createDisplayData();

  useEffect(() => {
    loadData();
  }, []);

  if (loading && manufacturers.length === 0 && inventoryItems.length === 0) {
    return (
      <div className="space-y-6">
        <div className="card">
          <div className="text-center py-8">
            <div className="text-gray-400">Loading manufacturers and inventory...</div>
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
            title="Search manufacturers and inventory"
          >
            <Search size={18} />
          </button>

          {/* Search Input */}
          {showSearch && (
            <div className="relative">
              <input
                type="text"
                placeholder="Search manufacturers and items..."
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

        <div className="flex items-center space-x-2">
          <button 
            onClick={() => {
              resetForm();
              setIsAddingItem(false);
              setShowAddModal(true);
            }}
            className="btn-secondary flex items-center space-x-2"
            disabled={loading}
          >
            <Building size={18} />
            <span>Add Manufacturer</span>
          </button>
          <button 
            onClick={() => {
              resetForm();
              setIsAddingItem(true);
              setShowAddModal(true);
            }}
            className="btn-primary flex items-center space-x-2"
            disabled={loading}
          >
            <Plus size={18} />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Results count */}
      {searchTerm && (
        <div className="text-sm text-gray-400">
          {displayData.filter(item => item.type !== 'separator').length} results matching "{searchTerm}"
        </div>
      )}

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>SKU</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayData.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-gray-400 py-8">
                  {searchTerm ? 
                    'No manufacturers or items match your search.' : 
                    'No manufacturers or inventory items found. Add your first manufacturer to get started.'
                  }
                </td>
              </tr>
            ) : (
              displayData.map((item, index) => {
                if (item.type === 'separator') {
                  return (
                    <tr key={`separator-${index}`}>
                      <td colSpan={6} className="border-t border-gray-600 pt-4">
                        <div className="flex items-center space-x-2 text-gray-400 font-medium">
                          <div className="h-px bg-gray-600 flex-1"></div>
                          <span>{item.name}</span>
                          <div className="h-px bg-gray-600 flex-1"></div>
                        </div>
                      </td>
                    </tr>
                  );
                }

                if (item.type === 'manufacturer') {
                  return (
                    <tr key={`manufacturer-${item.id}`} className="bg-gray-800/50">
                      <td className="font-medium text-white">
                        <div className="flex items-center">
                          <Building size={16} className="mr-2 text-blue-400" />
                          {item.name}
                          <span className="ml-2 badge badge-info">Manufacturer</span>
                          {item.itemCount && item.itemCount > 0 && (
                            <span className="ml-2 text-gray-400 text-sm">
                              ({item.itemCount} items)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="text-gray-500">-</td>
                      <td className="text-gray-500">-</td>
                      <td className="text-gray-500">-</td>
                      <td className="text-gray-400">
                        {item.manufacturer?.contact_info ? 
                          <span className="text-sm">Contact info available</span> :
                          <span className="text-gray-500">-</span>
                        }
                      </td>
                      <td>
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => openEditManufacturerModal(item.manufacturer!)}
                            className="p-2 rounded-lg hover:bg-gray-700 text-purple-400 hover:text-purple-300"
                            disabled={loading}
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteManufacturer(item.manufacturer!.id)}
                            className="p-2 rounded-lg hover:bg-gray-700 text-red-400 hover:text-red-300"
                            disabled={loading}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }

                // item type
                const itemData = item.item!;
                return (
                  <tr key={`item-${item.id}`} className={item.isChild ? 'bg-gray-900/30' : ''}>
                    <td className="font-medium text-white">
                      <div className={`flex items-center ${item.isChild ? 'ml-6' : ''}`}>
                        {item.isChild && (
                          <div className="mr-2 text-gray-600">
                            <div className="w-4 h-px bg-gray-600 mb-2"></div>
                            <div className="w-px h-4 bg-gray-600 -mt-2 ml-4"></div>
                          </div>
                        )}
                        <Package size={16} className="mr-2 text-green-400" />
                        {item.name}
                        {item.isChild && (
                          <span className="ml-2 badge badge-success">Item</span>
                        )}
                        {!item.isChild && (
                          <span className="ml-2 badge badge-warning">Independent</span>
                        )}
                      </div>
                    </td>
                    <td className="text-gray-400">
                      {itemData.sku ? (
                        <span className="font-mono text-sm">{itemData.sku}</span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="text-gray-400">
                      {itemData.price ? 
                        `$${itemData.price.toFixed(2)}` : 
                        <span className="text-gray-500">-</span>
                      }
                    </td>
                    <td className="text-gray-400">
                      {itemData.stock_quantity !== null ? 
                        itemData.stock_quantity : 
                        <span className="text-gray-500">-</span>
                      }
                    </td>
                    <td className="text-gray-400 max-w-xs truncate">
                      {itemData.description || <span className="text-gray-500">-</span>}
                    </td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => openEditItemModal(itemData)}
                          className="p-2 rounded-lg hover:bg-gray-700 text-purple-400 hover:text-purple-300"
                          disabled={loading}
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteItem(itemData.id)}
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
              {editingManufacturer ? 'Edit Manufacturer' : 
               editingItem ? 'Edit Inventory Item' :
               isAddingItem ? 'Add Inventory Item' : 'Add Manufacturer'}
            </h2>
            
            <form 
              onSubmit={
                editingManufacturer ? handleEditManufacturer :
                editingItem ? handleEditItem :
                isAddingItem ? handleAddItem : handleAddManufacturer
              } 
              className="space-y-4"
            >
              {!isAddingItem && !editingItem ? (
                // Manufacturer form
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Company Name <span className="text-red-400">*</span>
                    </label>
                    <input 
                      type="text" 
                      value={formData.companyName}
                      onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                      className="input-field" 
                      placeholder="DePuy Synthes" 
                      required
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Contact Info <span className="text-gray-500">(optional)</span>
                    </label>
                    <textarea 
                      value={formData.contactInfo}
                      onChange={(e) => setFormData({...formData, contactInfo: e.target.value})}
                      className="input-field" 
                      placeholder='Enter contact information or JSON: {"phone": "+1-555-0123", "email": "contact@company.com"}'
                      rows={3}
                      disabled={loading}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      You can enter plain text or JSON format. Plain text will be saved as a note.
                    </p>
                  </div>
                </>
              ) : (
                // Item form
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Item Name <span className="text-red-400">*</span>
                      </label>
                      <input 
                        type="text" 
                        value={formData.itemName}
                        onChange={(e) => setFormData({...formData, itemName: e.target.value})}
                        className="input-field" 
                        placeholder="Titanium Hip Stem" 
                        required
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Manufacturer <span className="text-red-400">*</span>
                      </label>
                      <select 
                        value={formData.manufacturerId}
                        onChange={(e) => setFormData({...formData, manufacturerId: e.target.value})}
                        className="input-field"
                        required
                        disabled={loading}
                      >
                        <option value="">Select Manufacturer</option>
                        {manufacturers.map(manufacturer => (
                          <option key={manufacturer.id} value={manufacturer.id}>
                            {manufacturer.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        SKU <span className="text-gray-500">(optional)</span>
                      </label>
                      <input 
                        type="text" 
                        value={formData.sku}
                        onChange={(e) => setFormData({...formData, sku: e.target.value})}
                        className="input-field" 
                        placeholder="HIP-TI-12-001" 
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Unit Price <span className="text-gray-500">(optional)</span>
                      </label>
                      <input 
                        type="number" 
                        step="0.01"
                        value={formData.unitPrice}
                        onChange={(e) => setFormData({...formData, unitPrice: e.target.value})}
                        className="input-field" 
                        placeholder="125.00" 
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Stock Quantity <span className="text-gray-500">(optional)</span>
                    </label>
                    <input 
                      type="number" 
                      value={formData.stockQuantity}
                      onChange={(e) => setFormData({...formData, stockQuantity: e.target.value})}
                      className="input-field" 
                      placeholder="50" 
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description <span className="text-gray-500">(optional)</span>
                    </label>
                    <textarea 
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="input-field" 
                      placeholder="Brief description of the inventory item..."
                      rows={3}
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
                   editingManufacturer ? 'Update Manufacturer' :
                   editingItem ? 'Update Item' :
                   isAddingItem ? 'Add Item' : 'Add Manufacturer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}