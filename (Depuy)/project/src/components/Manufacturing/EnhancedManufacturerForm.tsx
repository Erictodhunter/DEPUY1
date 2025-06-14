import React, { useState } from 'react';
import { Building, Phone, Mail, MapPin, Award, TrendingUp, DollarSign, Shield, AlertTriangle } from 'lucide-react';

interface EnhancedManufacturerFormProps {
  onSubmit: (data: ManufacturerFormData) => void;
  onCancel: () => void;
  initialData?: Partial<ManufacturerFormData>;
  loading?: boolean;
}

export interface ManufacturerFormData {
  // Basic Information
  name: string;
  legal_name: string;
  manufacturer_code: string;
  duns_number: string;
  
  // Contact Information
  primary_contact_name: string;
  primary_contact_email: string;
  primary_contact_phone: string;
  secondary_contact_name: string;
  secondary_contact_email: string;
  secondary_contact_phone: string;
  
  // Address Information
  headquarters_address: string;
  headquarters_city: string;
  headquarters_state: string;
  headquarters_country: string;
  headquarters_postal_code: string;
  
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_country: string;
  shipping_postal_code: string;
  
  billing_address: string;
  billing_city: string;
  billing_state: string;
  billing_country: string;
  billing_postal_code: string;
  
  // Regulatory & Compliance
  fda_establishment_number: string;
  iso_13485_certified: boolean;
  iso_13485_cert_number: string;
  iso_13485_expiry_date: string;
  ce_marking_authorized: boolean;
  mdr_compliance: boolean;
  
  // Business Information
  tax_id: string;
  business_type: string;
  annual_revenue: number;
  employee_count: number;
  established_date: string;
  
  // Quality & Performance
  quality_rating: number;
  on_time_delivery_rate: number;
  defect_rate: number;
  lead_time_days: number;
  minimum_order_quantity: number;
  
  // Financial Terms
  payment_terms: string;
  currency_code: string;
  credit_limit: number;
  discount_percentage: number;
  
  // Capabilities & Risk
  manufacturing_capabilities: string[];
  certifications: string[];
  specialties: string[];
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  backup_supplier_available: boolean;
  single_source: boolean;
  
  // Additional
  notes: string;
  website_url: string;
}

export default function EnhancedManufacturerForm({ 
  onSubmit, 
  onCancel, 
  initialData, 
  loading = false 
}: EnhancedManufacturerFormProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState<ManufacturerFormData>({
    // Basic Information
    name: initialData?.name || '',
    legal_name: initialData?.legal_name || '',
    manufacturer_code: initialData?.manufacturer_code || '',
    duns_number: initialData?.duns_number || '',
    
    // Contact Information
    primary_contact_name: initialData?.primary_contact_name || '',
    primary_contact_email: initialData?.primary_contact_email || '',
    primary_contact_phone: initialData?.primary_contact_phone || '',
    secondary_contact_name: initialData?.secondary_contact_name || '',
    secondary_contact_email: initialData?.secondary_contact_email || '',
    secondary_contact_phone: initialData?.secondary_contact_phone || '',
    
    // Address Information
    headquarters_address: initialData?.headquarters_address || '',
    headquarters_city: initialData?.headquarters_city || '',
    headquarters_state: initialData?.headquarters_state || '',
    headquarters_country: initialData?.headquarters_country || 'USA',
    headquarters_postal_code: initialData?.headquarters_postal_code || '',
    
    shipping_address: initialData?.shipping_address || '',
    shipping_city: initialData?.shipping_city || '',
    shipping_state: initialData?.shipping_state || '',
    shipping_country: initialData?.shipping_country || 'USA',
    shipping_postal_code: initialData?.shipping_postal_code || '',
    
    billing_address: initialData?.billing_address || '',
    billing_city: initialData?.billing_city || '',
    billing_state: initialData?.billing_state || '',
    billing_country: initialData?.billing_country || 'USA',
    billing_postal_code: initialData?.billing_postal_code || '',
    
    // Regulatory & Compliance
    fda_establishment_number: initialData?.fda_establishment_number || '',
    iso_13485_certified: initialData?.iso_13485_certified || false,
    iso_13485_cert_number: initialData?.iso_13485_cert_number || '',
    iso_13485_expiry_date: initialData?.iso_13485_expiry_date || '',
    ce_marking_authorized: initialData?.ce_marking_authorized || false,
    mdr_compliance: initialData?.mdr_compliance || false,
    
    // Business Information
    tax_id: initialData?.tax_id || '',
    business_type: initialData?.business_type || 'Corporation',
    annual_revenue: initialData?.annual_revenue || 0,
    employee_count: initialData?.employee_count || 0,
    established_date: initialData?.established_date || '',
    
    // Quality & Performance
    quality_rating: initialData?.quality_rating || 0,
    on_time_delivery_rate: initialData?.on_time_delivery_rate || 0,
    defect_rate: initialData?.defect_rate || 0,
    lead_time_days: initialData?.lead_time_days || 0,
    minimum_order_quantity: initialData?.minimum_order_quantity || 0,
    
    // Financial Terms
    payment_terms: initialData?.payment_terms || 'Net 30',
    currency_code: initialData?.currency_code || 'USD',
    credit_limit: initialData?.credit_limit || 0,
    discount_percentage: initialData?.discount_percentage || 0,
    
    // Capabilities & Risk
    manufacturing_capabilities: initialData?.manufacturing_capabilities || [],
    certifications: initialData?.certifications || [],
    specialties: initialData?.specialties || [],
    risk_level: initialData?.risk_level || 'MEDIUM',
    backup_supplier_available: initialData?.backup_supplier_available || false,
    single_source: initialData?.single_source || false,
    
    // Additional
    notes: initialData?.notes || '',
    website_url: initialData?.website_url || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateFormData = (field: keyof ManufacturerFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const copyAddress = (from: 'headquarters' | 'shipping', to: 'headquarters' | 'shipping' | 'billing') => {
    const addressFields = ['address', 'city', 'state', 'country', 'postal_code'];
    const updates: Partial<ManufacturerFormData> = {};
    
    addressFields.forEach(field => {
      const fromKey = `${from}_${field}` as keyof ManufacturerFormData;
      const toKey = `${to}_${field}` as keyof ManufacturerFormData;
      updates[toKey] = formData[fromKey] as any;
    });
    
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: Building },
    { id: 'contact', label: 'Contact', icon: Phone },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'regulatory', label: 'Regulatory', icon: Shield },
    { id: 'business', label: 'Business', icon: DollarSign },
    { id: 'performance', label: 'Performance', icon: TrendingUp },
    { id: 'capabilities', label: 'Capabilities', icon: Award },
    { id: 'risk', label: 'Risk & Notes', icon: AlertTriangle }
  ];

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal max-w-6xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex-shrink-0 border-b border-gray-700 pb-4 mb-6">
            <h2 className="text-2xl font-semibold text-white">
              {initialData ? 'Edit Manufacturer' : 'Add New Manufacturer'}
            </h2>
            <p className="text-gray-400 mt-1">
              Complete manufacturer information for regulatory compliance and supply chain management
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
                        Company Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => updateFormData('name', e.target.value)}
                        className="input-field"
                        placeholder="DePuy Synthes"
                        required
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Legal Name
                      </label>
                      <input
                        type="text"
                        value={formData.legal_name}
                        onChange={(e) => updateFormData('legal_name', e.target.value)}
                        className="input-field"
                        placeholder="DePuy Synthes Products, Inc."
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Manufacturer Code <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.manufacturer_code}
                        onChange={(e) => updateFormData('manufacturer_code', e.target.value)}
                        className="input-field"
                        placeholder="DS-001"
                        required
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        D-U-N-S Number
                      </label>
                      <input
                        type="text"
                        value={formData.duns_number}
                        onChange={(e) => updateFormData('duns_number', e.target.value)}
                        className="input-field"
                        placeholder="123456789"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Website URL
                    </label>
                    <input
                      type="url"
                      value={formData.website_url}
                      onChange={(e) => updateFormData('website_url', e.target.value)}
                      className="input-field"
                      placeholder="https://www.depuysynthes.com"
                      disabled={loading}
                    />
                  </div>
                </div>
              )}

              {/* Contact Information Tab */}
              {activeTab === 'contact' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                      <Phone size={20} className="mr-2 text-blue-400" />
                      Primary Contact
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Name
                        </label>
                        <input
                          type="text"
                          value={formData.primary_contact_name}
                          onChange={(e) => updateFormData('primary_contact_name', e.target.value)}
                          className="input-field"
                          placeholder="John Smith"
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={formData.primary_contact_email}
                          onChange={(e) => updateFormData('primary_contact_email', e.target.value)}
                          className="input-field"
                          placeholder="john.smith@company.com"
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={formData.primary_contact_phone}
                          onChange={(e) => updateFormData('primary_contact_phone', e.target.value)}
                          className="input-field"
                          placeholder="+1 (555) 123-4567"
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                      <Mail size={20} className="mr-2 text-green-400" />
                      Secondary Contact
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Name
                        </label>
                        <input
                          type="text"
                          value={formData.secondary_contact_name}
                          onChange={(e) => updateFormData('secondary_contact_name', e.target.value)}
                          className="input-field"
                          placeholder="Jane Doe"
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={formData.secondary_contact_email}
                          onChange={(e) => updateFormData('secondary_contact_email', e.target.value)}
                          className="input-field"
                          placeholder="jane.doe@company.com"
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={formData.secondary_contact_phone}
                          onChange={(e) => updateFormData('secondary_contact_phone', e.target.value)}
                          className="input-field"
                          placeholder="+1 (555) 987-6543"
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Continue with other tabs... */}
              
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
                  {loading ? 'Saving...' : initialData ? 'Update Manufacturer' : 'Add Manufacturer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 