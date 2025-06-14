-- Enhanced Sales Pipeline Schema
-- Run this SQL in your Supabase SQL Editor to add the enhanced functionality

-- First, let's add the missing columns to the opportunities table
ALTER TABLE opportunities 
ADD COLUMN IF NOT EXISTS sales_rep_id INTEGER REFERENCES users(id),
ADD COLUMN IF NOT EXISTS lead_source VARCHAR(100),
ADD COLUMN IF NOT EXISTS profit_margin DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS competitors TEXT,
ADD COLUMN IF NOT EXISTS primary_contact VARCHAR(255),
ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS actual_value DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS close_reason TEXT;

-- Create opportunity_products table for multiple products per opportunity
CREATE TABLE IF NOT EXISTS opportunity_products (
  id SERIAL PRIMARY KEY,
  opportunity_id INTEGER NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(15,2) NOT NULL DEFAULT 0,
  total_price DECIMAL(15,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(opportunity_id, product_id)
);

-- Create opportunity_manufacturers table for manufacturer relationships
CREATE TABLE IF NOT EXISTS opportunity_manufacturers (
  id SERIAL PRIMARY KEY,
  opportunity_id INTEGER NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  manufacturer_id INTEGER NOT NULL REFERENCES manufacturers(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(opportunity_id, manufacturer_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_opportunities_sales_rep_id ON opportunities(sales_rep_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_lead_source ON opportunities(lead_source);
CREATE INDEX IF NOT EXISTS idx_opportunities_stage_status ON opportunities(stage, status);
CREATE INDEX IF NOT EXISTS idx_opportunity_products_opportunity_id ON opportunity_products(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_products_product_id ON opportunity_products(product_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_manufacturers_opportunity_id ON opportunity_manufacturers(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_manufacturers_manufacturer_id ON opportunity_manufacturers(manufacturer_id);

-- Add updated_at trigger for opportunity_products
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_opportunity_products_updated_at 
    BEFORE UPDATE ON opportunity_products 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_opportunity_manufacturers_updated_at 
    BEFORE UPDATE ON opportunity_manufacturers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add role column to users table if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'viewer',
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Update existing users to have admin role (you can modify this as needed)
UPDATE users SET role = 'admin' WHERE role IS NULL OR role = '';

-- Create a view for opportunity details with all relationships
CREATE OR REPLACE VIEW opportunity_details AS
SELECT 
  o.*,
  h.name as hospital_name,
  h.city as hospital_city,
  h.state as hospital_state,
  s.first_name as surgeon_first_name,
  s.last_name as surgeon_last_name,
  s.specialization as surgeon_specialization,
  u.first_name as sales_rep_first_name,
  u.last_name as sales_rep_last_name,
  u.role as sales_rep_role,
  -- Aggregate product information
  COALESCE(
    (SELECT json_agg(
      json_build_object(
        'id', op.id,
        'product_id', op.product_id,
        'product_name', p.name,
        'product_model', p.model,
        'quantity', op.quantity,
        'unit_price', op.unit_price,
        'total_price', op.total_price,
        'notes', op.notes
      )
    ) FROM opportunity_products op
    JOIN products p ON op.product_id = p.id
    WHERE op.opportunity_id = o.id), 
    '[]'::json
  ) as products,
  -- Aggregate manufacturer information
  COALESCE(
    (SELECT json_agg(
      json_build_object(
        'id', om.id,
        'manufacturer_id', om.manufacturer_id,
        'manufacturer_name', m.name,
        'is_primary', om.is_primary
      )
    ) FROM opportunity_manufacturers om
    JOIN manufacturers m ON om.manufacturer_id = m.id
    WHERE om.opportunity_id = o.id), 
    '[]'::json
  ) as manufacturers,
  -- Calculate total product value
  COALESCE(
    (SELECT SUM(op.total_price) 
     FROM opportunity_products op 
     WHERE op.opportunity_id = o.id), 
    0
  ) as total_product_value
FROM opportunities o
LEFT JOIN hospitals h ON o.hospital_id = h.id
LEFT JOIN surgeons s ON o.surgeon_id = s.id
LEFT JOIN users u ON o.sales_rep_id = u.id;

-- Create function to get pipeline metrics
CREATE OR REPLACE FUNCTION get_pipeline_metrics(
  start_date DATE DEFAULT CURRENT_DATE - INTERVAL '3 months',
  end_date DATE DEFAULT CURRENT_DATE,
  sales_rep_id_filter INTEGER DEFAULT NULL
)
RETURNS TABLE (
  total_opportunities BIGINT,
  total_value DECIMAL,
  weighted_value DECIMAL,
  avg_deal_size DECIMAL,
  win_rate DECIMAL,
  conversion_rate DECIMAL,
  active_pipeline BIGINT,
  closed_this_month BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH filtered_opportunities AS (
    SELECT *
    FROM opportunities o
    WHERE o.created_at::date BETWEEN start_date AND end_date
    AND (sales_rep_id_filter IS NULL OR o.sales_rep_id = sales_rep_id_filter)
  ),
  metrics AS (
    SELECT 
      COUNT(*) as total_opps,
      COALESCE(SUM(estimated_value), 0) as total_val,
      COALESCE(SUM(estimated_value * probability_percentage / 100.0), 0) as weighted_val,
      CASE WHEN COUNT(*) > 0 THEN COALESCE(SUM(estimated_value), 0) / COUNT(*) ELSE 0 END as avg_deal,
      COUNT(*) FILTER (WHERE stage = 'closed_won') as won_count,
      COUNT(*) FILTER (WHERE stage IN ('closed_won', 'closed_lost')) as closed_count,
      COUNT(*) FILTER (WHERE stage NOT IN ('closed_won', 'closed_lost')) as active_count,
      COUNT(*) FILTER (WHERE 
        stage IN ('closed_won', 'closed_lost') 
        AND DATE_TRUNC('month', updated_at) = DATE_TRUNC('month', CURRENT_DATE)
      ) as closed_this_month_count
    FROM filtered_opportunities
  )
  SELECT 
    total_opps,
    total_val,
    weighted_val,
    avg_deal,
    CASE WHEN closed_count > 0 THEN (won_count::DECIMAL / closed_count) * 100 ELSE 0 END,
    CASE WHEN total_opps > 0 THEN (won_count::DECIMAL / total_opps) * 100 ELSE 0 END,
    active_count,
    closed_this_month_count
  FROM metrics;
END;
$$ LANGUAGE plpgsql;

-- Create function to get hospital performance
CREATE OR REPLACE FUNCTION get_hospital_performance(
  start_date DATE DEFAULT CURRENT_DATE - INTERVAL '3 months',
  end_date DATE DEFAULT CURRENT_DATE,
  limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
  hospital_id INTEGER,
  hospital_name VARCHAR,
  opportunities_count BIGINT,
  total_value DECIMAL,
  avg_value DECIMAL,
  win_rate DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    h.id,
    h.name,
    COUNT(o.id) as opps_count,
    COALESCE(SUM(o.estimated_value), 0) as total_val,
    CASE WHEN COUNT(o.id) > 0 THEN COALESCE(SUM(o.estimated_value), 0) / COUNT(o.id) ELSE 0 END as avg_val,
    CASE 
      WHEN COUNT(o.id) FILTER (WHERE o.stage IN ('closed_won', 'closed_lost')) > 0 
      THEN (COUNT(o.id) FILTER (WHERE o.stage = 'closed_won')::DECIMAL / 
            COUNT(o.id) FILTER (WHERE o.stage IN ('closed_won', 'closed_lost'))) * 100 
      ELSE 0 
    END as win_rate_calc
  FROM hospitals h
  LEFT JOIN opportunities o ON h.id = o.hospital_id 
    AND o.created_at::date BETWEEN start_date AND end_date
  WHERE h.status = 'active'
  GROUP BY h.id, h.name
  HAVING COUNT(o.id) > 0
  ORDER BY total_val DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to get surgeon performance
CREATE OR REPLACE FUNCTION get_surgeon_performance(
  start_date DATE DEFAULT CURRENT_DATE - INTERVAL '3 months',
  end_date DATE DEFAULT CURRENT_DATE,
  limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
  surgeon_id INTEGER,
  surgeon_name VARCHAR,
  opportunities_count BIGINT,
  total_value DECIMAL,
  avg_deal_size DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    ('Dr. ' || s.first_name || ' ' || s.last_name)::VARCHAR,
    COUNT(o.id) as opps_count,
    COALESCE(SUM(o.estimated_value), 0) as total_val,
    CASE WHEN COUNT(o.id) > 0 THEN COALESCE(SUM(o.estimated_value), 0) / COUNT(o.id) ELSE 0 END as avg_deal
  FROM surgeons s
  LEFT JOIN opportunities o ON s.id = o.surgeon_id 
    AND o.created_at::date BETWEEN start_date AND end_date
  WHERE s.status = 'active'
  GROUP BY s.id, s.first_name, s.last_name
  HAVING COUNT(o.id) > 0
  ORDER BY total_val DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) policies for role-based access
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_manufacturers ENABLE ROW LEVEL SECURITY;

-- Policy for opportunities - admins and sales managers can see all, sales reps see their own
CREATE POLICY "opportunities_select_policy" ON opportunities
  FOR SELECT USING (
    auth.jwt() ->> 'role' IN ('admin', 'sales_manager') OR
    sales_rep_id = (auth.jwt() ->> 'sub')::INTEGER
  );

CREATE POLICY "opportunities_insert_policy" ON opportunities
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'role' IN ('admin', 'sales_manager', 'sales_rep')
  );

CREATE POLICY "opportunities_update_policy" ON opportunities
  FOR UPDATE USING (
    auth.jwt() ->> 'role' IN ('admin', 'sales_manager') OR
    sales_rep_id = (auth.jwt() ->> 'sub')::INTEGER
  );

CREATE POLICY "opportunities_delete_policy" ON opportunities
  FOR DELETE USING (
    auth.jwt() ->> 'role' IN ('admin', 'sales_manager')
  );

-- Policies for opportunity_products
CREATE POLICY "opportunity_products_select_policy" ON opportunity_products
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM opportunities o 
      WHERE o.id = opportunity_id 
      AND (
        auth.jwt() ->> 'role' IN ('admin', 'sales_manager') OR
        o.sales_rep_id = (auth.jwt() ->> 'sub')::INTEGER
      )
    )
  );

CREATE POLICY "opportunity_products_insert_policy" ON opportunity_products
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM opportunities o 
      WHERE o.id = opportunity_id 
      AND (
        auth.jwt() ->> 'role' IN ('admin', 'sales_manager') OR
        o.sales_rep_id = (auth.jwt() ->> 'sub')::INTEGER
      )
    )
  );

CREATE POLICY "opportunity_products_update_policy" ON opportunity_products
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM opportunities o 
      WHERE o.id = opportunity_id 
      AND (
        auth.jwt() ->> 'role' IN ('admin', 'sales_manager') OR
        o.sales_rep_id = (auth.jwt() ->> 'sub')::INTEGER
      )
    )
  );

CREATE POLICY "opportunity_products_delete_policy" ON opportunity_products
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM opportunities o 
      WHERE o.id = opportunity_id 
      AND (
        auth.jwt() ->> 'role' IN ('admin', 'sales_manager') OR
        o.sales_rep_id = (auth.jwt() ->> 'sub')::INTEGER
      )
    )
  );

-- Similar policies for opportunity_manufacturers
CREATE POLICY "opportunity_manufacturers_select_policy" ON opportunity_manufacturers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM opportunities o 
      WHERE o.id = opportunity_id 
      AND (
        auth.jwt() ->> 'role' IN ('admin', 'sales_manager') OR
        o.sales_rep_id = (auth.jwt() ->> 'sub')::INTEGER
      )
    )
  );

CREATE POLICY "opportunity_manufacturers_insert_policy" ON opportunity_manufacturers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM opportunities o 
      WHERE o.id = opportunity_id 
      AND (
        auth.jwt() ->> 'role' IN ('admin', 'sales_manager') OR
        o.sales_rep_id = (auth.jwt() ->> 'sub')::INTEGER
      )
    )
  );

CREATE POLICY "opportunity_manufacturers_update_policy" ON opportunity_manufacturers
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM opportunities o 
      WHERE o.id = opportunity_id 
      AND (
        auth.jwt() ->> 'role' IN ('admin', 'sales_manager') OR
        o.sales_rep_id = (auth.jwt() ->> 'sub')::INTEGER
      )
    )
  );

CREATE POLICY "opportunity_manufacturers_delete_policy" ON opportunity_manufacturers
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM opportunities o 
      WHERE o.id = opportunity_id 
      AND (
        auth.jwt() ->> 'role' IN ('admin', 'sales_manager') OR
        o.sales_rep_id = (auth.jwt() ->> 'sub')::INTEGER
      )
    )
  );

-- Create some sample data for testing
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
  'Enhanced Sales Pipeline Schema Created Successfully!' as status,
  'Tables: opportunities (enhanced), opportunity_products, opportunity_manufacturers' as tables_created,
  'Functions: get_pipeline_metrics, get_hospital_performance, get_surgeon_performance' as functions_created,
  'Views: opportunity_details' as views_created,
  'RLS Policies: Role-based access control implemented' as security; 