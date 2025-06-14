import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Building, Package, Search, Filter, X, FileText, BarChart3, Shield, Truck, AlertTriangle, CheckCircle, Clock, Eye } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import EnhancedManufacturerForm, { ManufacturerFormData } from '../../Manufacturing/EnhancedManufacturerForm';
import EnhancedInventoryForm, { InventoryItemFormData } from '../../Manufacturing/EnhancedInventoryForm';

interface Manufacturer {
  id: string;
  name: string;
  legal_name?: string;
  manufacturer_code: string;
  primary_contact_name?: string;
  primary_contact_email?: string;
  headquarters_city?: string;
  headquarters_country?: string;
  iso_13485_certified?: boolean;
  quality_rating?: number;
  status: string;
  created_at: string;
}

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  manufacturer_id?: string;
  category: string;
  subcategory?: string;
  device_class?: string;
  unit_cost?: number;
  list_price?: number;
  stock_quantity: number;
  reorder_point?: number;
  sterile?: boolean;
  lot_controlled?: boolean;
  requires_udi?: boolean;
  is_implantable?: boolean;
  status: string;
  created_at: string;
}

interface InventoryLot {
  id: string;
  item_id: string;
  lot_number: string;
  expiration_date?: string;
  current_quantity: number;
  quality_status: string;
  status: string;
}

interface DisplayItem {
  id: string;
  type: 'manufacturer' | 'item' | 'lot' | 'separator';
  name: string;
  manufacturer?: Manufacturer;
  item?: InventoryItem;
  lot?: InventoryLot;
  itemCount?: number;
  isChild?: boolean;
  isGrandChild?: boolean;
}

export default function EnhancedInventoryTab() {
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [inventoryLots, setInventoryLots] = useState<InventoryLot[]>([]);
  const [showManufacturerForm, setShowManufacturerForm] = useState(false);
  const [showInventoryForm, setShowInventoryForm] = useState(false);
  const [editingManufacturer, setEditingManufacturer] = useState<Manufacturer | null>(null);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [viewMode, setViewMode] = useState<'hierarchical' | 'table'>('hierarchical');

  // Statistics
  const [stats, setStats] = useState({
    totalManufacturers: 0,
    totalItems: 0,
    totalValue: 0,
    lowStockItems: 0,
    expiringSoon: 0
  });

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [manufacturersRes, itemsRes, lotsRes] = await Promise.all([
        supabase
          .from('manufacturers')
          .select('*')
          .eq('status', 'ACTIVE')
          .order('name'),
        supabase
          .from('inventory_items')
          .select('*')
          .eq('status', 'ACTIVE')
          .order('name'),
        supabase
          .from('inventory_lots')
          .select('*')
          .eq('status', 'ACTIVE')
          .order('lot_number')
      ]);

      if (manufacturersRes.error) throw manufacturersRes.error;
      if (itemsRes.error) throw itemsRes.error;
      if (lotsRes.error) throw lotsRes.error;

      const manufacturerData = manufacturersRes.data || [];
      const itemData = itemsRes.data || [];
      const lotData = lotsRes.data || [];

      setManufacturers(manufacturerData);
      setInventoryItems(itemData);
      setInventoryLots(lotData);

      // Calculate statistics
      const totalValue = itemData.reduce((sum, item) => sum + (item.stock_quantity * (item.unit_cost || 0)), 0);
      const lowStockItems = itemData.filter(item => item.stock_quantity <= (item.reorder_point || 0)).length;
      const expiringSoon = lotData.filter(lot => {
        if (!lot.expiration_date) return false;
        const expiryDate = new Date(lot.expiration_date);
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        return expiryDate <= thirtyDaysFromNow;
      }).length;

      setStats({
        totalManufacturers: manufacturerData.length,
        totalItems: itemData.length,
        totalValue,
        lowStockItems,
        expiringSoon
      });

      setError(null);
    } catch (error: any) {
      console.error('Error loading data:', error);
      setError('Failed to load data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddManufacturer = async (data: ManufacturerFormData) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('manufacturers')
        .insert([{
          name: data.name,
          legal_name: data.legal_name,
          manufacturer_code: data.manufacturer_code,
          duns_number: data.duns_number,
          primary_contact_name: data.primary_contact_name,
          primary_contact_email: data.primary_contact_email,
          primary_contact_phone: data.primary_contact_phone,
          secondary_contact_name: data.secondary_contact_name,
          secondary_contact_email: data.secondary_contact_email,
          secondary_contact_phone: data.secondary_contact_phone,
          headquarters_address: data.headquarters_address,
          headquarters_city: data.headquarters_city,
          headquarters_state: data.headquarters_state,
          headquarters_country: data.headquarters_country,
          headquarters_postal_code: data.headquarters_postal_code,
          shipping_address: data.shipping_address,
          shipping_city: data.shipping_city,
          shipping_state: data.shipping_state,
          shipping_country: data.shipping_country,
          shipping_postal_code: data.shipping_postal_code,
          billing_address: data.billing_address,
          billing_city: data.billing_city,
          billing_state: data.billing_state,
          billing_country: data.billing_country,
          billing_postal_code: data.billing_postal_code,
          fda_establishment_number: data.fda_establishment_number,
          iso_13485_certified: data.iso_13485_certified,
          iso_13485_cert_number: data.iso_13485_cert_number,
          iso_13485_expiry_date: data.iso_13485_expiry_date || null,
          ce_marking_authorized: data.ce_marking_authorized,
          mdr_compliance: data.mdr_compliance,
          tax_id: data.tax_id,
          business_type: data.business_type,
          annual_revenue: data.annual_revenue,
          employee_count: data.employee_count,
          established_date: data.established_date || null,
          quality_rating: data.quality_rating,
          on_time_delivery_rate: data.on_time_delivery_rate,
          defect_rate: data.defect_rate,
          lead_time_days: data.lead_time_days,
          minimum_order_quantity: data.minimum_order_quantity,
          payment_terms: data.payment_terms,
          currency_code: data.currency_code,
          credit_limit: data.credit_limit,
          discount_percentage: data.discount_percentage,
          manufacturing_capabilities: data.manufacturing_capabilities,
          certifications: data.certifications,
          specialties: data.specialties,
          risk_level: data.risk_level,
          backup_supplier_available: data.backup_supplier_available,
          single_source: data.single_source,
          notes: data.notes,
          website_url: data.website_url,
          status: 'ACTIVE'
        }]);

      if (error) throw error;

      await loadData();
      setShowManufacturerForm(false);
      setEditingManufacturer(null);
      setError(null);
    } catch (error: any) {
      console.error('Error adding manufacturer:', error);
      setError('Failed to add manufacturer: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddInventoryItem = async (data: InventoryItemFormData) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('inventory_items')
        .insert([{
          name: data.name,
          description: data.description,
          sku: data.sku,
          manufacturer_part_number: data.manufacturer_part_number,
          internal_part_number: data.internal_part_number,
          upc_code: data.upc_code,
          gtin: data.gtin,
          manufacturer_id: data.manufacturer_id || null,
          primary_supplier_id: data.primary_supplier_id || null,
          secondary_supplier_id: data.secondary_supplier_id || null,
          category: data.category,
          subcategory: data.subcategory,
          product_line: data.product_line,
          product_family: data.product_family,
          device_class: data.device_class,
          fda_510k_number: data.fda_510k_number,
          fda_pma_number: data.fda_pma_number,
          ce_marking: data.ce_marking,
          mdr_compliant: data.mdr_compliant,
          lot_controlled: data.lot_controlled,
          serial_controlled: data.serial_controlled,
          expiration_controlled: data.expiration_controlled,
          unit_of_measure: data.unit_of_measure,
          weight_grams: data.weight_grams,
          length_mm: data.length_mm,
          width_mm: data.width_mm,
          height_mm: data.height_mm,
          volume_ml: data.volume_ml,
          package_type: data.package_type,
          sterile: data.sterile,
          sterilization_method: data.sterilization_method,
          shelf_life_months: data.shelf_life_months,
          storage_temperature_min: data.storage_temperature_min,
          storage_temperature_max: data.storage_temperature_max,
          storage_humidity_max: data.storage_humidity_max,
          stock_quantity: data.stock_quantity,
          reserved_quantity: data.reserved_quantity,
          reorder_point: data.reorder_point,
          reorder_quantity: data.reorder_quantity,
          safety_stock: data.safety_stock,
          max_stock_level: data.max_stock_level,
          unit_cost: data.unit_cost,
          last_cost: data.last_cost,
          average_cost: data.average_cost,
          standard_cost: data.standard_cost,
          list_price: data.list_price,
          primary_location: data.primary_location,
          bin_location: data.bin_location,
          warehouse_zone: data.warehouse_zone,
          storage_requirements: data.storage_requirements,
          hazmat: data.hazmat,
          controlled_substance: data.controlled_substance,
          incoming_inspection_required: data.incoming_inspection_required,
          certificate_of_analysis_required: data.certificate_of_analysis_required,
          biocompatibility_tested: data.biocompatibility_tested,
          lifecycle_stage: data.lifecycle_stage,
          introduction_date: data.introduction_date || null,
          discontinuation_date: data.discontinuation_date || null,
          replacement_item_id: data.replacement_item_id || null,
          requires_lot_tracking: data.requires_lot_tracking,
          requires_serial_tracking: data.requires_serial_tracking,
          requires_udi: data.requires_udi,
          is_consignment: data.is_consignment,
          is_kit_component: data.is_kit_component,
          is_implantable: data.is_implantable,
          notes: data.notes,
          status: 'ACTIVE'
        }]);

      if (error) throw error;

      await loadData();
      setShowInventoryForm(false);
      setEditingItem(null);
      setError(null);
    } catch (error: any) {
      console.error('Error adding inventory item:', error);
      setError('Failed to add inventory item: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteManufacturer = async (id: string) => {
    if (!confirm('Are you sure you want to delete this manufacturer? This will also affect associated inventory items.')) return;

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('manufacturers')
        .update({ status: 'INACTIVE' })
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

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this inventory item?')) return;

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('inventory_items')
        .update({ status: 'INACTIVE' })
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

  // Create hierarchical display data
  const createDisplayData = (): DisplayItem[] => {
    const displayItems: DisplayItem[] = [];
    
    // Filter data based on search and filters
    const filteredManufacturers = manufacturers.filter(manufacturer => {
      if (searchTerm && !manufacturer.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });

    const filteredItems = inventoryItems.filter(item => {
      if (searchTerm) {
        const matchesName = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSku = item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase());
        if (!matchesName && !matchesSku && !matchesCategory) return false;
      }
      if (filterCategory && item.category !== filterCategory) return false;
      if (filterStatus && item.status !== filterStatus) return false;
      return true;
    });

    // Add manufacturers with their items and lots
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

        // Add item's lots if lot controlled
        if (item.lot_controlled) {
          const itemLots = inventoryLots.filter(lot => lot.item_id === item.id);
          itemLots.forEach(lot => {
            displayItems.push({
              id: lot.id,
              type: 'lot',
              name: `Lot: ${lot.lot_number}`,
              lot,
              isChild: true,
              isGrandChild: true
            });
          });
        }
      });
    });

    // Add independent items (items without manufacturer)
    const independentItems = filteredItems.filter(item => 
      !manufacturers.some(m => m.id === item.manufacturer_id)
    );

    if (independentItems.length > 0) {
      displayItems.push({
        id: 'separator-independent',
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

        // Add item's lots if lot controlled
        if (item.lot_controlled) {
          const itemLots = inventoryLots.filter(lot => lot.item_id === item.id);
          itemLots.forEach(lot => {
            displayItems.push({
              id: lot.id,
              type: 'lot',
              name: `Lot: ${lot.lot_number}`,
              lot,
              isChild: true
            });
          });
        }
      });
    }

    return displayItems;
  };

  const displayData = createDisplayData();
  const categories = [...new Set(inventoryItems.map(item => item.category))];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <CheckCircle size={16} className="text-green-400" />;
      case 'INACTIVE': return <X size={16} className="text-red-400" />;
      case 'PENDING': return <Clock size={16} className="text-yellow-400" />;
      default: return <AlertTriangle size={16} className="text-gray-400" />;
    }
  };

  const getQualityStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED': return <CheckCircle size={16} className="text-green-400" />;
      case 'REJECTED': return <X size={16} className="text-red-400" />;
      case 'QUARANTINE': return <AlertTriangle size={16} className="text-yellow-400" />;
      default: return <Clock size={16} className="text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Statistics */}
      <div className="grid grid-cols-5 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Manufacturers</p>
              <p className="text-2xl font-bold text-white">{stats.totalManufacturers}</p>
            </div>
            <Building className="text-blue-400" size={24} />
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Items</p>
              <p className="text-2xl font-bold text-white">{stats.totalItems}</p>
            </div>
            <Package className="text-green-400" size={24} />
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Value</p>
              <p className="text-2xl font-bold text-white">${stats.totalValue.toLocaleString()}</p>
            </div>
            <BarChart3 className="text-purple-400" size={24} />
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Low Stock Items</p>
              <p className="text-2xl font-bold text-yellow-400">{stats.lowStockItems}</p>
            </div>
            <AlertTriangle className="text-yellow-400" size={24} />
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Expiring Soon</p>
              <p className="text-2xl font-bold text-red-400">{stats.expiringSoon}</p>
            </div>
            <Clock className="text-red-400" size={24} />
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="text-red-400 mr-2" size={20} />
            <span className="text-red-400">{error}</span>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className={`btn-secondary flex items-center space-x-2 ${showSearch ? 'bg-blue-600' : ''}`}
            >
              <Search size={18} />
              <span>Search</span>
            </button>
            {showSearch && (
              <div className="absolute top-full left-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-lg p-4 z-10">
                <input
                  type="text"
                  placeholder="Search manufacturers, items, SKUs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field"
                />
              </div>
            )}
          </div>

          {/* Filter */}
          <div className="relative">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className={`btn-secondary flex items-center space-x-2 ${showFilter ? 'bg-blue-600' : ''}`}
            >
              <Filter size={18} />
              <span>Filter</span>
            </button>
            {showFilter && (
              <div className="absolute top-full left-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-lg p-4 z-10">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="input-field"
                    >
                      <option value="">All Categories</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="input-field"
                    >
                      <option value="">All Statuses</option>
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                      <option value="DISCONTINUED">Discontinued</option>
                    </select>
                  </div>
                  <button
                    onClick={() => {
                      setFilterCategory('');
                      setFilterStatus('');
                      setShowFilter(false);
                    }}
                    className="btn-secondary w-full"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('hierarchical')}
              className={`px-3 py-1 rounded text-sm ${
                viewMode === 'hierarchical' ? 'bg-blue-600 text-white' : 'text-gray-400'
              }`}
            >
              Hierarchical
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded text-sm ${
                viewMode === 'table' ? 'bg-blue-600 text-white' : 'text-gray-400'
              }`}
            >
              Table
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            onClick={() => {
              setEditingManufacturer(null);
              setShowManufacturerForm(true);
            }}
            className="btn-secondary flex items-center space-x-2"
            disabled={loading}
          >
            <Building size={18} />
            <span>Add Manufacturer</span>
          </button>
          <button 
            onClick={() => {
              setEditingItem(null);
              setShowInventoryForm(true);
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

      {/* Data Display */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
            <p className="text-gray-400 mt-2">Loading enhanced inventory data...</p>
          </div>
        ) : displayData.length === 0 ? (
          <div className="p-8 text-center">
            <Package size={48} className="mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400">No manufacturers or inventory items found</p>
            <p className="text-gray-500 text-sm mt-1">Run the enhanced schema SQL to upgrade your database</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="text-left p-4 font-medium text-gray-300">Name / SKU</th>
                  <th className="text-left p-4 font-medium text-gray-300">Category</th>
                  <th className="text-left p-4 font-medium text-gray-300">Stock</th>
                  <th className="text-left p-4 font-medium text-gray-300">Value</th>
                  <th className="text-left p-4 font-medium text-gray-300">Status</th>
                  <th className="text-left p-4 font-medium text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayData.map((item, index) => {
                  if (item.type === 'separator') {
                    return (
                      <tr key={item.id} className="bg-gray-700">
                        <td colSpan={6} className="p-4 font-medium text-gray-300">
                          {item.name}
                        </td>
                      </tr>
                    );
                  }

                  if (item.type === 'manufacturer') {
                    return (
                      <tr key={`manufacturer-${item.id}`} className="bg-gray-800/50 hover:bg-gray-700/50">
                        <td className="p-4">
                          <div className="flex items-center">
                            <Building size={16} className="mr-2 text-blue-400" />
                            <div>
                              <div className="font-medium text-white">{item.name}</div>
                              <div className="text-sm text-gray-400">
                                {item.manufacturer?.manufacturer_code} • {item.manufacturer?.headquarters_city}, {item.manufacturer?.headquarters_country}
                              </div>
                            </div>
                            <span className="ml-2 badge badge-info">Manufacturer</span>
                            {item.itemCount && item.itemCount > 0 && (
                              <span className="ml-2 text-gray-400 text-sm">
                                ({item.itemCount} items)
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-gray-500">-</td>
                        <td className="p-4 text-gray-500">-</td>
                        <td className="p-4 text-gray-500">-</td>
                        <td className="p-4">
                          <div className="flex items-center">
                            {getStatusIcon(item.manufacturer?.status || 'UNKNOWN')}
                            <span className="ml-2 text-sm text-gray-300">{item.manufacturer?.status}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setEditingManufacturer(item.manufacturer!);
                                setShowManufacturerForm(true);
                              }}
                              className="text-blue-400 hover:text-blue-300"
                              title="Edit Manufacturer"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteManufacturer(item.id)}
                              className="text-red-400 hover:text-red-300"
                              title="Delete Manufacturer"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  if (item.type === 'item') {
                    const isLowStock = item.item && item.item.stock_quantity <= (item.item.reorder_point || 0);
                    return (
                      <tr key={`item-${item.id}`} className={`hover:bg-gray-700/50 ${item.isChild ? 'bg-gray-800/30' : ''}`}>
                        <td className="p-4">
                          <div className={`flex items-center ${item.isChild ? 'ml-6' : ''}`}>
                            <Package size={16} className="mr-2 text-green-400" />
                            <div>
                              <div className="font-medium text-white">{item.name}</div>
                              <div className="text-sm text-gray-400">
                                SKU: {item.item?.sku}
                                {item.item?.device_class && (
                                  <span className="ml-2">• {item.item.device_class}</span>
                                )}
                                {item.item?.sterile && (
                                  <span className="ml-2 text-blue-400">• Sterile</span>
                                )}
                                {item.item?.is_implantable && (
                                  <span className="ml-2 text-purple-400">• Implantable</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div>
                            <div className="text-white">{item.item?.category}</div>
                            {item.item?.subcategory && (
                              <div className="text-sm text-gray-400">{item.item.subcategory}</div>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className={`font-medium ${isLowStock ? 'text-yellow-400' : 'text-white'}`}>
                            {item.item?.stock_quantity || 0}
                            {isLowStock && (
                              <AlertTriangle size={16} className="inline ml-1 text-yellow-400" />
                            )}
                          </div>
                          {item.item?.reorder_point && (
                            <div className="text-sm text-gray-400">
                              Reorder: {item.item.reorder_point}
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="text-white font-medium">
                            ${((item.item?.stock_quantity || 0) * (item.item?.unit_cost || 0)).toLocaleString()}
                          </div>
                          {item.item?.unit_cost && (
                            <div className="text-sm text-gray-400">
                              @ ${item.item.unit_cost.toFixed(2)}
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center">
                            {getStatusIcon(item.item?.status || 'UNKNOWN')}
                            <span className="ml-2 text-sm text-gray-300">{item.item?.status}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setEditingItem(item.item!);
                                setShowInventoryForm(true);
                              }}
                              className="text-blue-400 hover:text-blue-300"
                              title="Edit Item"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-red-400 hover:text-red-300"
                              title="Delete Item"
                            >
                              <Trash2 size={16} />
                            </button>
                            <button
                              className="text-gray-400 hover:text-gray-300"
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  if (item.type === 'lot') {
                    const isExpiringSoon = item.lot?.expiration_date && 
                      new Date(item.lot.expiration_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                    
                    return (
                      <tr key={`lot-${item.id}`} className="bg-gray-800/20 hover:bg-gray-700/30">
                        <td className="p-4">
                          <div className="flex items-center ml-12">
                            <FileText size={14} className="mr-2 text-yellow-400" />
                            <div>
                              <div className="text-sm font-medium text-white">{item.name}</div>
                              {item.lot?.expiration_date && (
                                <div className={`text-xs ${isExpiringSoon ? 'text-yellow-400' : 'text-gray-400'}`}>
                                  Expires: {new Date(item.lot.expiration_date).toLocaleDateString()}
                                  {isExpiringSoon && <span className="ml-1">⚠️</span>}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-gray-500 text-sm">Lot</td>
                        <td className="p-4">
                          <div className="text-sm text-white">{item.lot?.current_quantity || 0}</div>
                        </td>
                        <td className="p-4 text-gray-500">-</td>
                        <td className="p-4">
                          <div className="flex items-center">
                            {getQualityStatusIcon(item.lot?.quality_status || 'PENDING')}
                            <span className="ml-2 text-xs text-gray-300">{item.lot?.quality_status}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <button
                            className="text-gray-400 hover:text-gray-300"
                            title="View Lot Details"
                          >
                            <Eye size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  }

                  return null;
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Enhanced Manufacturer Form */}
      {showManufacturerForm && (
        <EnhancedManufacturerForm
          onSubmit={handleAddManufacturer}
          onCancel={() => {
            setShowManufacturerForm(false);
            setEditingManufacturer(null);
          }}
          initialData={editingManufacturer || undefined}
          loading={loading}
        />
      )}

      {/* Enhanced Inventory Form */}
      {showInventoryForm && (
        <EnhancedInventoryForm
          onSubmit={handleAddInventoryItem}
          onCancel={() => {
            setShowInventoryForm(false);
            setEditingItem(null);
          }}
          initialData={editingItem || undefined}
          manufacturers={manufacturers.map(m => ({ id: m.id, name: m.name }))}
          loading={loading}
        />
      )}
    </div>
  );
} 