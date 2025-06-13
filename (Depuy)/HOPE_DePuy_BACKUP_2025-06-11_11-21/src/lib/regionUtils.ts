import { supabase } from './supabase';

export interface Region {
  id: number;
  name: string;
  code?: string | null;
  description?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface RegionFormData {
  name: string;
  code?: string | null;
  description?: string | null;
}

/**
 * Get all active regions
 */
export async function getAllRegions(): Promise<Region[]> {
  const { data, error } = await supabase
    .from('regions')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) {
    throw new Error(`Failed to fetch regions: ${error.message}`);
  }

  return data || [];
}

/**
 * Get region by ID
 */
export async function getRegionById(id: number): Promise<Region | null> {
  const { data, error } = await supabase
    .from('regions')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // No rows returned
    }
    throw new Error(`Failed to fetch region: ${error.message}`);
  }

  return data;
}

/**
 * Get region by code
 */
export async function getRegionByCode(code: string): Promise<Region | null> {
  const { data, error } = await supabase
    .from('regions')
    .select('*')
    .eq('code', code)
    .eq('is_active', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // No rows returned
    }
    throw new Error(`Failed to fetch region by code: ${error.message}`);
  }

  return data;
}

/**
 * Create a new region
 */
export async function createRegion(regionData: RegionFormData): Promise<Region> {
  const { data, error } = await supabase
    .from('regions')
    .insert([{
      ...regionData,
      is_active: true
    }])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create region: ${error.message}`);
  }

  return data;
}

/**
 * Update an existing region
 */
export async function updateRegion(id: number, regionData: Partial<RegionFormData>): Promise<Region> {
  const { data, error } = await supabase
    .from('regions')
    .update(regionData)
    .eq('id', id)
    .eq('is_active', true)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update region: ${error.message}`);
  }

  return data;
}

/**
 * Soft delete a region (set is_active to false)
 * Note: This will only work if no hospitals reference this region
 */
export async function deleteRegion(id: number): Promise<void> {
  // First check if any hospitals reference this region
  const { data: hospitals, error: checkError } = await supabase
    .from('hospitals')
    .select('id')
    .eq('region_id', id)
    .eq('is_active', true)
    .limit(1);

  if (checkError) {
    throw new Error(`Failed to check region usage: ${checkError.message}`);
  }

  if (hospitals && hospitals.length > 0) {
    throw new Error('Cannot delete region: it is currently used by one or more hospitals. Please reassign hospitals to different regions first.');
  }

  const { error } = await supabase
    .from('regions')
    .update({ is_active: false })
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete region: ${error.message}`);
  }
}

/**
 * Search regions by name, code, or description
 */
export async function searchRegions(searchTerm: string): Promise<Region[]> {
  const { data, error } = await supabase
    .from('regions')
    .select('*')
    .eq('is_active', true)
    .or(`name.ilike.%${searchTerm}%,code.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
    .order('name');

  if (error) {
    throw new Error(`Failed to search regions: ${error.message}`);
  }

  return data || [];
}

/**
 * Get regions with hospital counts
 */
export async function getRegionsWithHospitalCounts(): Promise<Array<Region & { hospital_count: number }>> {
  const { data, error } = await supabase
    .from('regions')
    .select(`
      *,
      hospitals!inner(id)
    `)
    .eq('is_active', true)
    .eq('hospitals.is_active', true);

  if (error) {
    throw new Error(`Failed to fetch regions with hospital counts: ${error.message}`);
  }

  // Transform the data to include hospital count
  const regionsMap = new Map();
  
  data?.forEach((item: any) => {
    const regionId = item.id;
    if (!regionsMap.has(regionId)) {
      regionsMap.set(regionId, {
        id: item.id,
        name: item.name,
        code: item.code,
        description: item.description,
        is_active: item.is_active,
        created_at: item.created_at,
        updated_at: item.updated_at,
        hospital_count: 0
      });
    }
    regionsMap.get(regionId).hospital_count++;
  });

  return Array.from(regionsMap.values()).sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Get unused regions (regions with no hospitals)
 */
export async function getUnusedRegions(): Promise<Region[]> {
  const { data, error } = await supabase
    .from('regions')
    .select('*')
    .eq('is_active', true)
    .not('id', 'in', `(
      SELECT DISTINCT region_id 
      FROM hospitals 
      WHERE region_id IS NOT NULL 
      AND is_active = true
    )`)
    .order('name');

  if (error) {
    throw new Error(`Failed to fetch unused regions: ${error.message}`);
  }

  return data || [];
}

/**
 * Validate region data
 */
export function validateRegionData(data: RegionFormData): string[] {
  const errors: string[] = [];

  if (!data.name?.trim()) {
    errors.push('Region name is required');
  }

  if (data.code && data.code.trim().length > 10) {
    errors.push('Region code must be 10 characters or less');
  }

  if (data.description && data.description.trim().length > 500) {
    errors.push('Description must be 500 characters or less');
  }

  return errors;
}

/**
 * Check if region code is unique
 */
export async function isRegionCodeUnique(code: string, excludeId?: number): Promise<boolean> {
  if (!code?.trim()) return true; // Empty codes are allowed

  let query = supabase
    .from('regions')
    .select('id')
    .eq('code', code.trim())
    .eq('is_active', true);

  if (excludeId) {
    query = query.neq('id', excludeId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to check region code uniqueness: ${error.message}`);
  }

  return !data || data.length === 0;
}

/**
 * Get region statistics
 */
export async function getRegionStats(): Promise<{
  total: number;
  withHospitals: number;
  withoutHospitals: number;
  totalHospitals: number;
}> {
  const [allRegions, regionsWithHospitals] = await Promise.all([
    getAllRegions(),
    getRegionsWithHospitalCounts()
  ]);
  
  const totalHospitals = regionsWithHospitals.reduce((sum, region) => sum + region.hospital_count, 0);
  
  return {
    total: allRegions.length,
    withHospitals: regionsWithHospitals.length,
    withoutHospitals: allRegions.length - regionsWithHospitals.length,
    totalHospitals
  };
} 