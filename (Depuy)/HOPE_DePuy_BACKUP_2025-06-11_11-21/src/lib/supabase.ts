import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Kit {
  id: number;
  name: string;
  kit_code: string;
  procedure_id?: number | null;
  description?: string | null;
  is_standard: boolean;
  total_cost: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: number | null;
  updated_by?: number | null;
}

export interface Surgery {
  id: string;
  case_id: string;
  surgeon_name: string;
  procedure_name: string;
  hospital_name: string;
  surgery_date: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  kit_id?: string;
  created_at: string;
  updated_at: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku?: string;
  description?: string;
  manufacturer_id?: string;
  price?: number;
  stock_quantity?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Manufacturer {
  id: string;
  name: string;
  contact_info?: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Hospital {
  id: string;
  name: string;
  code?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  region_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Region {
  id: string;
  name: string;
  code: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Procedure {
  id: number;
  name: string;
  code?: string | null;
  description?: string | null;
  estimated_duration_minutes?: number | null;
  complexity_score?: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Sales Management Interfaces
export interface SalesOpportunity {
  id: number;
  title: string;
  hospital_id: number;
  surgeon_id: number;
  estimated_value: number;
  stage: string;
  probability: number;
  expected_close_date: string;
  rep_id: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SalesTransaction {
  id: number;
  opportunity_id?: number;
  amount: number;
  transaction_date: string;
  product_line?: string;
  rep_id: number;
  hospital_id: number;
  created_at: string;
}

export interface SalesRep {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  territory?: string;
  target_annual?: number;
  created_at: string;
}

// Kit management functions
export async function getKits(): Promise<Kit[]> {
  const { data, error } = await supabase
    .from('kits')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching kits:', error);
    return [];
  }

  return data || [];
}

export async function createKit(kit: {
  name: string;
  kit_code: string;
  procedure_id?: number | null;
  description?: string | null;
  is_standard?: boolean;
  total_cost?: number;
  is_active?: boolean;
}): Promise<Kit | null> {
  const { data, error } = await supabase
    .from('kits')
    .insert({
      name: kit.name,
      kit_code: kit.kit_code,
      procedure_id: kit.procedure_id || null,
      description: kit.description || null,
      is_standard: kit.is_standard || false,
      total_cost: kit.total_cost || 0,
      is_active: kit.is_active !== false
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating kit:', error);
    return null;
  }

  return data;
}

// Surgery management functions
export async function getSurgeries(): Promise<Surgery[]> {
  const { data, error } = await supabase
    .from('surgeries')
    .select('*')
    .order('surgery_date', { ascending: true });

  if (error) {
    console.error('Error fetching surgeries:', error);
    return [];
  }

  return data || [];
}

export async function createSurgery(surgery: Omit<Surgery, 'id' | 'created_at' | 'updated_at'>): Promise<Surgery | null> {
  const { data, error } = await supabase
    .from('surgeries')
    .insert(surgery)
    .select()
    .single();

  if (error) {
    console.error('Error creating surgery:', error);
    return null;
  }

  return data;
}

// Inventory management functions
export async function getInventoryItems(): Promise<InventoryItem[]> {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error('Error fetching inventory:', error);
    return [];
  }

  return data || [];
}

export async function getManufacturers(): Promise<Manufacturer[]> {
  const { data, error } = await supabase
    .from('manufacturers')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error('Error fetching manufacturers:', error);
    return [];
  }

  return data || [];
}

export async function getHospitals(): Promise<Hospital[]> {
  const { data, error } = await supabase
    .from('hospitals')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error('Error fetching hospitals:', error);
    return [];
  }

  return data || [];
}

export async function getRegions(): Promise<Region[]> {
  const { data, error } = await supabase
    .from('regions')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error('Error fetching regions:', error);
    return [];
  }

  return data || [];
}

// Procedures management functions
export async function getProcedures(): Promise<Procedure[]> {
  const { data, error } = await supabase
    .from('procedures')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error('Error fetching procedures:', error);
    return [];
  }

  return data || [];
}

// Helper functions
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}; 