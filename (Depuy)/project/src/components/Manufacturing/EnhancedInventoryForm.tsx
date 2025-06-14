import React, { useState } from 'react';
import { Package, Ruler, Thermometer, Shield, Truck, DollarSign, BarChart3, AlertCircle } from 'lucide-react';

interface EnhancedInventoryFormProps {
  onSubmit: (data: InventoryItemFormData) => void;
  onCancel: () => void;
  initialData?: Partial<InventoryItemFormData>;
  manufacturers: Array<{ id: string; name: string }>;
  loading?: boolean;
}

export interface InventoryItemFormData {
  // Basic Product Information
  name: string;
  description: string;
  sku: string;
  manufacturer_part_number: string;
  internal_part_number: string;
  upc_code: string;
  gtin: string;
  
  // Manufacturer & Supplier
  manufacturer_id: string;
  primary_supplier_id: string;
  secondary_supplier_id: string;
  
  // Product Classification
  category: string;
  subcategory: string;
  product_line: string;
  product_family: string;
  device_class: string;
  
  // Regulatory Information
  fda_510k_number: string;
  fda_pma_number: string;
  ce_marking: boolean;
  mdr_compliant: boolean;
  lot_controlled: boolean;
  serial_controlled: boolean;
  expiration_controlled: boolean;
  
  // Physical Specifications
  unit_of_measure: string;
  weight_grams: number;
  length_mm: number;
  width_mm: number;
  height_mm: number;
  volume_ml: number;
  
  // Packaging Information
  package_type: string;
  sterile: boolean;
  sterilization_method: string;
  shelf_life_months: number;
  storage_temperature_min: number;
  storage_temperature_max: number;
  storage_humidity_max: number;
  
  // Inventory Management
  stock_quantity: number;
  reserved_quantity: number;
  reorder_point: number;
  reorder_quantity: number;
  safety_stock: number;
  max_stock_level: number;
  
  // Cost Information
  unit_cost: number;
  last_cost: number;
  average_cost: number;
  standard_cost: number;
  list_price: number;
  
  // Location & Storage
  primary_location: string;
  bin_location: string;
  warehouse_zone: string;
  storage_requirements: string;
  hazmat: boolean;
  controlled_substance: boolean;
  
  // Quality Control
  incoming_inspection_required: boolean;
  certificate_of_analysis_required: boolean;
  biocompatibility_tested: boolean;
  
  // Lifecycle Management
  lifecycle_stage: string;
  introduction_date: string;
  discontinuation_date: string;
  replacement_item_id: string;
  
  // Traceability
  requires_lot_tracking: boolean;
  requires_serial_tracking: boolean;
  requires_udi: boolean;
  
  // Status & Metadata
  is_consignment: boolean;
  is_kit_component: boolean;
  is_implantable: boolean;
  notes: string;
}

export default function EnhancedInventoryForm({ 
  onSubmit, 
  onCancel, 
  initialData, 
  manufacturers,
  loading = false 
}: EnhancedInventoryFormProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState<InventoryItemFormData>({
    // Basic Product Information
    name: initialData?.name || '',
    description: initialData?.description || '',
    sku: initialData?.sku || '',
    manufacturer_part_number: initialData?.manufacturer_part_number || '',
    internal_part_number: initialData?.internal_part_number || '',
    upc_code: initialData?.upc_code || '',
    gtin: initialData?.gtin || '',
    
    // Manufacturer & Supplier
    manufacturer_id: initialData?.manufacturer_id || '',
    primary_supplier_id: initialData?.primary_supplier_id || '',
    secondary_supplier_id: initialData?.secondary_supplier_id || '',
    
    // Product Classification
    category: initialData?.category || 'Orthopedic Implants',
    subcategory: initialData?.subcategory || '',
    product_line: initialData?.product_line || '',
    product_family: initialData?.product_family || '',
    device_class: initialData?.device_class || 'Class II',
    
    // Regulatory Information
    fda_510k_number: initialData?.fda_510k_number || '',
    fda_pma_number: initialData?.fda_pma_number || '',
    ce_marking: initialData?.ce_marking || false,
    mdr_compliant: initialData?.mdr_compliant || false,
    lot_controlled: initialData?.lot_controlled ?? true,
    serial_controlled: initialData?.serial_controlled || false,
    expiration_controlled: initialData?.expiration_controlled ?? true,
    
    // Physical Specifications
    unit_of_measure: initialData?.unit_of_measure || 'EA',
    weight_grams: initialData?.weight_grams || 0,
    length_mm: initialData?.length_mm || 0,
    width_mm: initialData?.width_mm || 0,
    height_mm: initialData?.height_mm || 0,
    volume_ml: initialData?.volume_ml || 0,
    
    // Packaging Information
    package_type: initialData?.package_type || 'Sterile Pouch',
    sterile: initialData?.sterile || false,
    sterilization_method: initialData?.sterilization_method || 'ETO',
    shelf_life_months: initialData?.shelf_life_months || 0,
    storage_temperature_min: initialData?.storage_temperature_min || 15,
    storage_temperature_max: initialData?.storage_temperature_max || 25,
    storage_humidity_max: initialData?.storage_humidity_max || 60,
    
    // Inventory Management
    stock_quantity: initialData?.stock_quantity || 0,
    reserved_quantity: initialData?.reserved_quantity || 0,
    reorder_point: initialData?.reorder_point || 0,
    reorder_quantity: initialData?.reorder_quantity || 0,
    safety_stock: initialData?.safety_stock || 0,
    max_stock_level: initialData?.max_stock_level || 0,
    
    // Cost Information
    unit_cost: initialData?.unit_cost || 0,
    last_cost: initialData?.last_cost || 0,
    average_cost: initialData?.average_cost || 0,
    standard_cost: initialData?.standard_cost || 0,
    list_price: initialData?.list_price || 0,
    
    // Location & Storage
    primary_location: initialData?.primary_location || '',
    bin_location: initialData?.bin_location || '',
    warehouse_zone: initialData?.warehouse_zone || 'A',
    storage_requirements: initialData?.storage_requirements || '',
    hazmat: initialData?.hazmat || false,
    controlled_substance: initialData?.controlled_substance || false,
    
    // Quality Control
    incoming_inspection_required: initialData?.incoming_inspection_required ?? true,
    certificate_of_analysis_required: initialData?.certificate_of_analysis_required || false,
    biocompatibility_tested: initialData?.biocompatibility_tested || false,
    
    // Lifecycle Management
    lifecycle_stage: initialData?.lifecycle_stage || 'ACTIVE',
    introduction_date: initialData?.introduction_date || '',
    discontinuation_date: initialData?.discontinuation_date || '',
    replacement_item_id: initialData?.replacement_item_id || '',
    
    // Traceability
    requires_lot_tracking: initialData?.requires_lot_tracking ?? true,
    requires_serial_tracking: initialData?.requires_serial_tracking || false,
    requires_udi: initialData?.requires_udi || false,
    
    // Status & Metadata
    is_consignment: initialData?.is_consignment || false,
    is_kit_component: initialData?.is_kit_component || false,
    is_implantable: initialData?.is_implantable || false,
    notes: initialData?.notes || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateFormData = (field: keyof InventoryItemFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: Package },
    { id: 'classification', label: 'Classification', icon: BarChart3 },
    { id: 'regulatory', label: 'Regulatory', icon: Shield },
    { id: 'physical', label: 'Physical', icon: Ruler },
    { id: 'packaging', label: 'Packaging', icon: Thermometer },
    { id: 'inventory', label: 'Inventory', icon: Truck },
    { id: 'costs', label: 'Costs', icon: DollarSign },
    { id: 'quality', label: 'Quality & Notes', icon: AlertCircle }
  ];

  const categories = [
    'Orthopedic Implants',
    'Surgical Instruments',
    'Trauma Products',
    'Spine Products',
    'Sports Medicine',
    'Power Tools',
    'Biomaterials',
    'Disposables'
  ];

  const deviceClasses = ['Class I', 'Class II', 'Class III'];
  const unitOfMeasures = ['EA', 'BOX', 'CASE', 'SET', 'KIT', 'PAIR'];
  const packageTypes = ['Sterile Pouch', 'Tray', 'Box', 'Blister Pack', 'Tube', 'Vial'];
  const sterilizationMethods = ['ETO', 'Gamma', 'Steam', 'E-Beam', 'Plasma'];
  const lifecycleStages = ['DEVELOPMENT', 'ACTIVE', 'PHASE_OUT', 'DISCONTINUED', 'OBSOLETE'];

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal max-w-6xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex-shrink-0 border-b border-gray-700 pb-4 mb-6">
            <h2 className="text-2xl font-semibold text-white">
              {initialData ? 'Edit Inventory Item' : 'Add New Inventory Item'}
            </h2>
            <p className="text-gray-400 mt-1">
              Complete product information for regulatory compliance and inventory management
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex-shrink-0 border-b border-gray-700 mb-6">
            <div className="flex space-x-1 overflow-x-auto">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-t-lg whitespace-nowrap transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    <Icon size={16} />
                    <span className="text-sm">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information Tab */}
              {activeTab === 'basic' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Product Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => updateFormData('name', e.target.value)}
                        className="input-field"
                        placeholder="DePuy Synthes Hip Implant - Ceramic Head"
                        required
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        SKU <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.sku}
                        onChange={(e) => updateFormData('sku', e.target.value)}
                        className="input-field"
                        placeholder="DS-HIP-CER-28"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => updateFormData('description', e.target.value)}
                      className="input-field"
                      placeholder="Detailed product description..."
                      rows={3}
                      disabled={loading}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Manufacturer Part Number
                      </label>
                      <input
                        type="text"
                        value={formData.manufacturer_part_number}
                        onChange={(e) => updateFormData('manufacturer_part_number', e.target.value)}
                        className="input-field"
                        placeholder="DS-28MM-CER-STD"
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Internal Part Number
                      </label>
                      <input
                        type="text"
                        value={formData.internal_part_number}
                        onChange={(e) => updateFormData('internal_part_number', e.target.value)}
                        className="input-field"
                        placeholder="INT-001-2024"
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        UPC Code
                      </label>
                      <input
                        type="text"
                        value={formData.upc_code}
                        onChange={(e) => updateFormData('upc_code', e.target.value)}
                        className="input-field"
                        placeholder="123456789012"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        GTIN (Global Trade Item Number)
                      </label>
                      <input
                        type="text"
                        value={formData.gtin}
                        onChange={(e) => updateFormData('gtin', e.target.value)}
                        className="input-field"
                        placeholder="01234567890123"
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Unit of Measure <span className="text-red-400">*</span>
                      </label>
                      <select
                        value={formData.unit_of_measure}
                        onChange={(e) => updateFormData('unit_of_measure', e.target.value)}
                        className="input-field"
                        required
                        disabled={loading}
                      >
                        {unitOfMeasures.map(uom => (
                          <option key={uom} value={uom}>{uom}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Manufacturer <span className="text-red-400">*</span>
                      </label>
                      <select
                        value={formData.manufacturer_id}
                        onChange={(e) => updateFormData('manufacturer_id', e.target.value)}
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
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Primary Supplier
                      </label>
                      <select
                        value={formData.primary_supplier_id}
                        onChange={(e) => updateFormData('primary_supplier_id', e.target.value)}
                        className="input-field"
                        disabled={loading}
                      >
                        <option value="">Select Primary Supplier</option>
                        {manufacturers.map(manufacturer => (
                          <option key={manufacturer.id} value={manufacturer.id}>
                            {manufacturer.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Secondary Supplier
                      </label>
                      <select
                        value={formData.secondary_supplier_id}
                        onChange={(e) => updateFormData('secondary_supplier_id', e.target.value)}
                        className="input-field"
                        disabled={loading}
                      >
                        <option value="">Select Secondary Supplier</option>
                        {manufacturers.map(manufacturer => (
                          <option key={manufacturer.id} value={manufacturer.id}>
                            {manufacturer.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Classification Tab */}
              {activeTab === 'classification' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Category <span className="text-red-400">*</span>
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => updateFormData('category', e.target.value)}
                        className="input-field"
                        required
                        disabled={loading}
                      >
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Subcategory
                      </label>
                      <input
                        type="text"
                        value={formData.subcategory}
                        onChange={(e) => updateFormData('subcategory', e.target.value)}
                        className="input-field"
                        placeholder="Hip Implants"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Product Line
                      </label>
                      <input
                        type="text"
                        value={formData.product_line}
                        onChange={(e) => updateFormData('product_line', e.target.value)}
                        className="input-field"
                        placeholder="PINNACLE"
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Product Family
                      </label>
                      <input
                        type="text"
                        value={formData.product_family}
                        onChange={(e) => updateFormData('product_family', e.target.value)}
                        className="input-field"
                        placeholder="Ceramic Heads"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Device Class
                    </label>
                    <select
                      value={formData.device_class}
                      onChange={(e) => updateFormData('device_class', e.target.value)}
                      className="input-field"
                      disabled={loading}
                    >
                      {deviceClasses.map(deviceClass => (
                        <option key={deviceClass} value={deviceClass}>{deviceClass}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_implantable"
                        checked={formData.is_implantable}
                        onChange={(e) => updateFormData('is_implantable', e.target.checked)}
                        className="mr-2"
                        disabled={loading}
                      />
                      <label htmlFor="is_implantable" className="text-sm text-gray-300">
                        Implantable Device
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_kit_component"
                        checked={formData.is_kit_component}
                        onChange={(e) => updateFormData('is_kit_component', e.target.checked)}
                        className="mr-2"
                        disabled={loading}
                      />
                      <label htmlFor="is_kit_component" className="text-sm text-gray-300">
                        Kit Component
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_consignment"
                        checked={formData.is_consignment}
                        onChange={(e) => updateFormData('is_consignment', e.target.checked)}
                        className="mr-2"
                        disabled={loading}
                      />
                      <label htmlFor="is_consignment" className="text-sm text-gray-300">
                        Consignment Item
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-700">
                <button
                  type="button"
                  onClick={onCancel}
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
                  {loading ? 'Saving...' : initialData ? 'Update Item' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 