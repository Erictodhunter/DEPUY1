-- Basic Schema Update - Run this first to make the pipeline work
-- This adds only essential columns without breaking existing functionality

-- Add basic enhanced columns to opportunities table
ALTER TABLE opportunities 
ADD COLUMN IF NOT EXISTS sales_rep_id INTEGER,
ADD COLUMN IF NOT EXISTS lead_source VARCHAR(100),
ADD COLUMN IF NOT EXISTS profit_margin DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS competitors TEXT,
ADD COLUMN IF NOT EXISTS primary_contact VARCHAR(255),
ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS actual_value DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS close_reason TEXT;

-- Add role column to users table if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'admin',
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Update existing users to have admin role
UPDATE users SET role = 'admin' WHERE role IS NULL OR role = '';
UPDATE users SET is_active = TRUE WHERE is_active IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_opportunities_sales_rep_id ON opportunities(sales_rep_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_lead_source ON opportunities(lead_source);
CREATE INDEX IF NOT EXISTS idx_opportunities_stage_status ON opportunities(stage, status);

-- Add some sample users with different roles
INSERT INTO users (first_name, last_name, email, role, is_active) VALUES
  ('John', 'Smith', 'john.smith@depuy.com', 'sales_manager', true),
  ('Sarah', 'Johnson', 'sarah.johnson@depuy.com', 'sales_rep', true),
  ('Mike', 'Davis', 'mike.davis@depuy.com', 'sales_rep', true),
  ('Lisa', 'Wilson', 'lisa.wilson@depuy.com', 'admin', true),
  ('Tom', 'Brown', 'tom.brown@depuy.com', 'viewer', true)
ON CONFLICT (email) DO UPDATE SET 
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active;

-- Summary
SELECT 
  'Basic Schema Update Complete!' as status,
  'Enhanced columns added to opportunities table' as changes,
  'User roles added and configured' as users_updated,
  'Ready for enhanced pipeline functionality' as next_step; 