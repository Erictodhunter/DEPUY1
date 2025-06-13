import { supabase } from './supabase';

export interface Procedure {
  id: number;
  name: string;
  category: string;
  description?: string;
  average_duration?: number | null;
  complexity_level?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProcedureFormData {
  name: string;
  category: string;
  description?: string;
  average_duration?: number | null;
  complexity_level?: string | null;
}

// Standard procedure categories
export const PROCEDURE_CATEGORIES = [
  'Orthopedic',
  'Trauma',
  'Joint Replacement',
  'Spine',
  'Sports Medicine',
  'Other'
] as const;

// Complexity levels
export const COMPLEXITY_LEVELS = [
  'Low',
  'Medium', 
  'High',
  'Critical'
] as const;

/**
 * Get all active procedures
 */
export async function getAllProcedures(): Promise<Procedure[]> {
  const { data, error } = await supabase
    .from('procedures')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) {
    throw new Error(`Failed to fetch procedures: ${error.message}`);
  }

  return data || [];
}

/**
 * Get procedures by category
 */
export async function getProceduresByCategory(category: string): Promise<Procedure[]> {
  const { data, error } = await supabase
    .from('procedures')
    .select('*')
    .eq('is_active', true)
    .eq('category', category)
    .order('name');

  if (error) {
    throw new Error(`Failed to fetch procedures by category: ${error.message}`);
  }

  return data || [];
}

/**
 * Get procedure by ID
 */
export async function getProcedureById(id: number): Promise<Procedure | null> {
  const { data, error } = await supabase
    .from('procedures')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // No rows returned
    }
    throw new Error(`Failed to fetch procedure: ${error.message}`);
  }

  return data;
}

/**
 * Create a new procedure
 */
export async function createProcedure(procedureData: ProcedureFormData): Promise<Procedure> {
  const { data, error } = await supabase
    .from('procedures')
    .insert([{
      ...procedureData,
      is_active: true
    }])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create procedure: ${error.message}`);
  }

  return data;
}

/**
 * Update an existing procedure
 */
export async function updateProcedure(id: number, procedureData: Partial<ProcedureFormData>): Promise<Procedure> {
  const { data, error } = await supabase
    .from('procedures')
    .update(procedureData)
    .eq('id', id)
    .eq('is_active', true)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update procedure: ${error.message}`);
  }

  return data;
}

/**
 * Soft delete a procedure (set is_active to false)
 */
export async function deleteProcedure(id: number): Promise<void> {
  const { error } = await supabase
    .from('procedures')
    .update({ is_active: false })
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete procedure: ${error.message}`);
  }
}

/**
 * Search procedures by name or description
 */
export async function searchProcedures(searchTerm: string): Promise<Procedure[]> {
  const { data, error } = await supabase
    .from('procedures')
    .select('*')
    .eq('is_active', true)
    .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
    .order('name');

  if (error) {
    throw new Error(`Failed to search procedures: ${error.message}`);
  }

  return data || [];
}

/**
 * Get procedure statistics
 */
export async function getProcedureStats(): Promise<{
  total: number;
  byCategory: Record<string, number>;
  byComplexity: Record<string, number>;
  averageDuration: number | null;
}> {
  const procedures = await getAllProcedures();
  
  const stats = {
    total: procedures.length,
    byCategory: {} as Record<string, number>,
    byComplexity: {} as Record<string, number>,
    averageDuration: null as number | null
  };

  // Count by category
  procedures.forEach(procedure => {
    stats.byCategory[procedure.category] = (stats.byCategory[procedure.category] || 0) + 1;
  });

  // Count by complexity
  procedures.forEach(procedure => {
    if (procedure.complexity_level) {
      stats.byComplexity[procedure.complexity_level] = (stats.byComplexity[procedure.complexity_level] || 0) + 1;
    }
  });

  // Calculate average duration
  const proceduresWithDuration = procedures.filter(p => p.average_duration);
  if (proceduresWithDuration.length > 0) {
    const totalDuration = proceduresWithDuration.reduce((sum, p) => sum + (p.average_duration || 0), 0);
    stats.averageDuration = Math.round(totalDuration / proceduresWithDuration.length);
  }

  return stats;
}

/**
 * Get complexity level color class for UI
 */
export function getComplexityColor(level: string | null): string {
  switch (level) {
    case 'Critical':
      return 'badge-danger';
    case 'High':
      return 'badge-warning';
    case 'Medium':
      return 'badge-info';
    case 'Low':
      return 'badge-success';
    default:
      return 'badge-secondary';
  }
}

/**
 * Format duration for display
 */
export function formatDuration(minutes: number | null): string {
  if (!minutes) return '-';
  
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Validate procedure data
 */
export function validateProcedureData(data: ProcedureFormData): string[] {
  const errors: string[] = [];

  if (!data.name?.trim()) {
    errors.push('Procedure name is required');
  }

  if (!data.category?.trim()) {
    errors.push('Category is required');
  }

  if (data.average_duration !== null && data.average_duration !== undefined) {
    if (data.average_duration < 1) {
      errors.push('Duration must be at least 1 minute');
    }
    if (data.average_duration > 1440) { // 24 hours
      errors.push('Duration cannot exceed 24 hours (1440 minutes)');
    }
  }

  return errors;
} 