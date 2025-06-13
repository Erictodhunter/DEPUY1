import { supabase } from './supabase';

export interface Manufacturer {
  id: number;
  name: string;
  contact_info?: any;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface InventoryItem {
  id: number;
  name: string;
  manufacturer_id: number;
  sku?: string | null;
  category?: string | null;
  description?: string | null;
  price?: number | null;
  stock_quantity?: number | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ManufacturerFormData {
  name: string;
  contact_info?: any;
}

export interface InventoryItemFormData {
  name: string;
  manufacturer_id: number;
  sku?: string | null;
  description?: string | null;
  price?: number | null;
  stock_quantity?: number | null;
}

export interface ManufacturerWithItems extends Manufacturer {
  items: InventoryItem[];
  item_count: number;
}

export interface InventoryStats {
  total_manufacturers: number;
  active_manufacturers: number;
  total_items: number;
  active_items: number;
  total_inventory_value: number;
  low_stock_items: InventoryItem[];
  top_manufacturers: Array<{
    manufacturer: Manufacturer;
    item_count: number;
    total_value: number;
  }>;
}

// MANUFACTURER FUNCTIONS

/**
 * Get all active manufacturers
 */
export async function getAllManufacturers(): Promise<Manufacturer[]> {
  const { data, error } = await supabase
    .from('manufacturers')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) {
    throw new Error(`Failed to fetch manufacturers: ${error.message}`);
  }

  return data || [];
}

/**
 * Get manufacturer by ID
 */
export async function getManufacturerById(id: number): Promise<Manufacturer | null> {
  const { data, error } = await supabase
    .from('manufacturers')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // No rows returned
    }
    throw new Error(`Failed to fetch manufacturer: ${error.message}`);
  }

  return data;
}

/**
 * Create a new manufacturer
 */
export async function createManufacturer(manufacturerData: ManufacturerFormData): Promise<Manufacturer> {
  const { data, error } = await supabase
    .from('manufacturers')
    .insert([{
      ...manufacturerData,
      is_active: true
    }])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create manufacturer: ${error.message}`);
  }

  return data;
}

/**
 * Update an existing manufacturer
 */
export async function updateManufacturer(id: number, manufacturerData: Partial<ManufacturerFormData>): Promise<Manufacturer> {
  const { data, error } = await supabase
    .from('manufacturers')
    .update(manufacturerData)
    .eq('id', id)
    .eq('is_active', true)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update manufacturer: ${error.message}`);
  }

  return data;
}

/**
 * Soft delete a manufacturer (set is_active to false)
 * Also soft deletes all associated inventory items
 */
export async function deleteManufacturer(id: number): Promise<void> {
  // First, soft delete all associated inventory items
  const { error: itemsError } = await supabase
    .from('inventory_items')
    .update({ is_active: false })
    .eq('manufacturer_id', id);

  if (itemsError) {
    throw new Error(`Failed to delete manufacturer's inventory items: ${itemsError.message}`);
  }

  // Then soft delete the manufacturer
  const { error } = await supabase
    .from('manufacturers')
    .update({ is_active: false })
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete manufacturer: ${error.message}`);
  }
}

/**
 * Search manufacturers by company name
 */
export async function searchManufacturers(searchTerm: string): Promise<Manufacturer[]> {
  const { data, error } = await supabase
    .from('manufacturers')
    .select('*')
    .eq('is_active', true)
    .ilike('name', `%${searchTerm}%`)
    .order('name');

  if (error) {
    throw new Error(`Failed to search manufacturers: ${error.message}`);
  }

  return data || [];
}

// INVENTORY ITEM FUNCTIONS

/**
 * Get all active inventory items
 */
export async function getAllInventoryItems(): Promise<InventoryItem[]> {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) {
    throw new Error(`Failed to fetch inventory items: ${error.message}`);
  }

  return data || [];
}

/**
 * Get inventory items by manufacturer
 */
export async function getInventoryItemsByManufacturer(manufacturerId: number): Promise<InventoryItem[]> {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*')
    .eq('is_active', true)
    .eq('manufacturer_id', manufacturerId)
    .order('name');

  if (error) {
    throw new Error(`Failed to fetch inventory items by manufacturer: ${error.message}`);
  }

  return data || [];
}

/**
 * Get inventory item by ID
 */
export async function getInventoryItemById(id: number): Promise<InventoryItem | null> {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // No rows returned
    }
    throw new Error(`Failed to fetch inventory item: ${error.message}`);
  }

  return data;
}

/**
 * Create a new inventory item
 */
export async function createInventoryItem(itemData: InventoryItemFormData): Promise<InventoryItem> {
  const { data, error } = await supabase
    .from('inventory_items')
    .insert([{
      ...itemData,
      is_active: true
    }])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create inventory item: ${error.message}`);
  }

  return data;
}

/**
 * Update an existing inventory item
 */
export async function updateInventoryItem(id: number, itemData: Partial<InventoryItemFormData>): Promise<InventoryItem> {
  const { data, error } = await supabase
    .from('inventory_items')
    .update(itemData)
    .eq('id', id)
    .eq('is_active', true)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update inventory item: ${error.message}`);
  }

  return data;
}

/**
 * Soft delete an inventory item (set is_active to false)
 */
export async function deleteInventoryItem(id: number): Promise<void> {
  const { error } = await supabase
    .from('inventory_items')
    .update({ is_active: false })
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete inventory item: ${error.message}`);
  }
}

/**
 * Search inventory items by name, SKU, or description
 */
export async function searchInventoryItems(searchTerm: string): Promise<InventoryItem[]> {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*')
    .eq('is_active', true)
    .or(`name.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
    .order('name');

  if (error) {
    throw new Error(`Failed to search inventory items: ${error.message}`);
  }

  return data || [];
}

// COMBINED FUNCTIONS

/**
 * Get manufacturers with their inventory item counts
 */
export async function getManufacturersWithItemCounts(): Promise<Array<Manufacturer & { item_count: number }>> {
  const { data, error } = await supabase
    .from('manufacturers')
    .select(`
      *,
      inventory_items!inner(id)
    `)
    .eq('is_active', true)
    .eq('inventory_items.is_active', true);

  if (error) {
    throw new Error(`Failed to fetch manufacturers with item counts: ${error.message}`);
  }

  // Transform the data to include item count
  const manufacturersMap = new Map();
  
  data?.forEach((item: any) => {
    const manufacturerId = item.id;
    if (!manufacturersMap.has(manufacturerId)) {
      manufacturersMap.set(manufacturerId, {
        id: item.id,
        name: item.name,
        contact_info: item.contact_info,
        is_active: item.is_active,
        created_at: item.created_at,
        updated_at: item.updated_at,
        item_count: 0
      });
    }
    manufacturersMap.get(manufacturerId).item_count++;
  });

  return Array.from(manufacturersMap.values()).sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Get inventory statistics
 */
export async function getInventoryStats(): Promise<InventoryStats> {
  const [manufacturers, items] = await Promise.all([
    getAllManufacturers(),
    getAllInventoryItems()
  ]);
  
  const totalValue = items.reduce((sum, item) => {
    const price = item.price || 0;
    const quantity = item.stock_quantity || 0;
    return sum + (price * quantity);
  }, 0);

  const totalStock = items.reduce((sum, item) => sum + (item.stock_quantity || 0), 0);
  
  const lowStockItems = items.filter(item => 
    item.stock_quantity !== null && item.stock_quantity > 0 && item.stock_quantity <= 10
  ).length;
  
  const noStockItems = items.filter(item => 
    item.stock_quantity === null || item.stock_quantity === 0
  ).length;
  
  return {
    total_manufacturers: manufacturers.length,
    active_manufacturers: manufacturers.filter(m => m.is_active).length,
    total_items: items.length,
    active_items: items.filter(i => i.is_active).length,
    total_inventory_value: totalValue,
    low_stock_items: items.filter(item => typeof item.stock_quantity === 'number' && item.stock_quantity <= 10),
    top_manufacturers: []
  };
}

// VALIDATION FUNCTIONS

/**
 * Validate manufacturer data
 */
export function validateManufacturerData(data: ManufacturerFormData): string[] {
  const errors: string[] = [];

  if (!data.name?.trim()) {
    errors.push('Company name is required');
  }

  if (data.contact_info) {
    try {
      if (typeof data.contact_info === 'string') {
        JSON.parse(data.contact_info);
      }
    } catch (e) {
      errors.push('Contact info must be valid JSON');
    }
  }

  return errors;
}

/**
 * Validate inventory item data
 */
export function validateInventoryItemData(data: InventoryItemFormData): string[] {
  const errors: string[] = [];

  if (!data.name?.trim()) {
    errors.push('Item name is required');
  }

  if (!data.manufacturer_id) {
    errors.push('Manufacturer is required');
  }

  if (data.price !== null && data.price !== undefined) {
    if (data.price < 0) {
      errors.push('Price cannot be negative');
    }
  }

  if (data.stock_quantity !== null && data.stock_quantity !== undefined) {
    if (data.stock_quantity < 0) {
      errors.push('Stock quantity cannot be negative');
    }
    if (!Number.isInteger(data.stock_quantity)) {
      errors.push('Stock quantity must be a whole number');
    }
  }

  return errors;
}

/**
 * Check if SKU is unique
 */
export async function isSkuUnique(sku: string, excludeId?: number): Promise<boolean> {
  if (!sku?.trim()) return true; // Empty SKUs are allowed

  let query = supabase
    .from('inventory_items')
    .select('id')
    .eq('sku', sku.trim())
    .eq('is_active', true);

  if (excludeId) {
    query = query.neq('id', excludeId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to check SKU uniqueness: ${error.message}`);
  }

  return !data || data.length === 0;
}

/**
 * Format price for display
 */
export function formatPrice(price: number | null): string {
  if (price === null || price === undefined) return '-';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price);
}

/**
 * Format stock quantity for display
 */
export function formatStockQuantity(quantity: number | null): string {
  if (quantity === null || quantity === undefined) return '-';
  
  return quantity.toLocaleString();
}

/**
 * Get stock status for an item
 */
export function getStockStatus(quantity: number | null): {
  status: string;
  color: string;
} {
  if (quantity === null || quantity === undefined) {
    return { status: 'Unknown', color: 'text-gray-400' };
  }
  
  if (quantity === 0) {
    return { status: 'Out of Stock', color: 'text-red-400' };
  }
  
  if (quantity <= 10) {
    return { status: 'Low Stock', color: 'text-yellow-400' };
  }
  
  return { status: 'In Stock', color: 'text-green-400' };
} 