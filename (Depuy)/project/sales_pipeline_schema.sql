-- =============================================
-- SALES MANAGEMENT PIPELINE DATABASE SCHEMA
-- =============================================

-- Create ENUM types for better data consistency
CREATE TYPE opportunity_stage AS ENUM (
    'lead',
    'qualified', 
    'proposal',
    'negotiation',
    'closed_won',
    'closed_lost'
);

CREATE TYPE lead_source AS ENUM (
    'website',
    'referral',
    'cold_call',
    'email_campaign',
    'trade_show',
    'partner',
    'direct_inquiry',
    'social_media',
    'other'
);

CREATE TYPE priority_level AS ENUM (
    'low',
    'medium', 
    'high',
    'critical'
);

CREATE TYPE activity_type AS ENUM (
    'call',
    'email',
    'meeting',
    'demo',
    'follow_up',
    'proposal_sent',
    'contract_sent',
    'note',
    'other'
);

-- User Roles and Permissions (if not exists)
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default roles
INSERT INTO user_roles (name, description, permissions) VALUES 
('admin', 'Full system access', '{"opportunities": {"create": true, "read": true, "update": true, "delete": true}, "analytics": {"advanced": true}}'),
('sales_manager', 'Sales team management', '{"opportunities": {"create": true, "read": true, "update": true, "delete": false}, "analytics": {"advanced": true}}'),
('sales_rep', 'Basic sales access', '{"opportunities": {"create": true, "read": true, "update": true, "delete": false}, "analytics": {"advanced": false}}'),
('viewer', 'Read-only access', '{"opportunities": {"create": false, "read": true, "update": false, "delete": false}, "analytics": {"advanced": false}}')
ON CONFLICT (name) DO NOTHING;

-- Users table enhancement (if not exists)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role_id UUID REFERENCES user_roles(id),
    territory VARCHAR(100),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Companies table (for associated companies)
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    website VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'USA',
    phone VARCHAR(20),
    email VARCHAR(255),
    annual_revenue DECIMAL(15,2),
    employee_count INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contacts table (for associated people)
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    title VARCHAR(100),
    company_id UUID REFERENCES companies(id),
    hospital_id UUID REFERENCES hospitals(id),
    email VARCHAR(255),
    phone VARCHAR(20),
    mobile VARCHAR(20),
    department VARCHAR(100),
    is_primary_contact BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Opportunities table (main sales pipeline)
CREATE TABLE opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Stage and Status
    stage opportunity_stage NOT NULL DEFAULT 'lead',
    probability INTEGER CHECK (probability >= 0 AND probability <= 100) DEFAULT 0,
    
    -- Financial Information
    estimated_value DECIMAL(15,2),
    actual_value DECIMAL(15,2),
    cost DECIMAL(15,2),
    profit_margin DECIMAL(5,2),
    quantity INTEGER DEFAULT 1,
    
    -- Dates
    expected_close_date DATE,
    actual_close_date DATE,
    created_date DATE DEFAULT CURRENT_DATE,
    
    -- Lead Information
    lead_source lead_source,
    priority priority_level DEFAULT 'medium',
    
    -- Relationships
    owner_id UUID REFERENCES users(id),
    primary_contact_id UUID REFERENCES contacts(id),
    company_id UUID REFERENCES companies(id),
    hospital_id UUID REFERENCES hospitals(id),
    surgeon_id UUID REFERENCES surgeons(id),
    manufacturer_id UUID REFERENCES manufacturers(id),
    
    -- Additional Information
    territory VARCHAR(100),
    competitor VARCHAR(255),
    next_step TEXT,
    close_reason TEXT,
    tags TEXT[],
    custom_fields JSONB DEFAULT '{}',
    
    -- System fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Opportunity Products (many-to-many relationship)
CREATE TABLE opportunity_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2),
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    total_price DECIMAL(15,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Opportunity Activities (call logs, meetings, notes)
CREATE TABLE opportunity_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
    activity_type activity_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    activity_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    duration_minutes INTEGER,
    outcome TEXT,
    next_action TEXT,
    next_action_date DATE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Opportunity Files/Attachments
CREATE TABLE opportunity_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500),
    file_size INTEGER,
    file_type VARCHAR(50),
    uploaded_by UUID REFERENCES users(id),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Opportunity Stage History (track stage changes)
CREATE TABLE opportunity_stage_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
    from_stage opportunity_stage,
    to_stage opportunity_stage NOT NULL,
    changed_by UUID REFERENCES users(id),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT
);

-- Sales Forecasts
CREATE TABLE sales_forecasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    forecast_period DATE NOT NULL, -- Month/Quarter
    forecasted_amount DECIMAL(15,2),
    committed_amount DECIMAL(15,2),
    actual_amount DECIMAL(15,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX idx_opportunities_stage ON opportunities(stage);
CREATE INDEX idx_opportunities_owner ON opportunities(owner_id);
CREATE INDEX idx_opportunities_close_date ON opportunities(expected_close_date);
CREATE INDEX idx_opportunities_created_at ON opportunities(created_at);
CREATE INDEX idx_opportunities_value ON opportunities(estimated_value);
CREATE INDEX idx_opportunity_activities_opportunity ON opportunity_activities(opportunity_id);
CREATE INDEX idx_opportunity_products_opportunity ON opportunity_products(opportunity_id);
CREATE INDEX idx_contacts_company ON contacts(company_id);
CREATE INDEX idx_contacts_hospital ON contacts(hospital_id);

-- =============================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =============================================

-- Update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER update_opportunities_updated_at BEFORE UPDATE ON opportunities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-track stage changes
CREATE OR REPLACE FUNCTION track_opportunity_stage_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.stage IS DISTINCT FROM NEW.stage THEN
        INSERT INTO opportunity_stage_history (opportunity_id, from_stage, to_stage, changed_by)
        VALUES (NEW.id, OLD.stage, NEW.stage, NEW.updated_by);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER track_opportunity_stage_changes_trigger 
    AFTER UPDATE ON opportunities 
    FOR EACH ROW 
    EXECUTE FUNCTION track_opportunity_stage_changes();

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on opportunities
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_products ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see opportunities they own or if they have admin role
CREATE POLICY "Users can view their own opportunities" ON opportunities
    FOR SELECT USING (
        owner_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM users u 
            JOIN user_roles r ON u.role_id = r.id 
            WHERE u.id = auth.uid() AND r.name IN ('admin', 'sales_manager')
        )
    );

-- Policy: Users can insert opportunities if they have create permission
CREATE POLICY "Users can create opportunities" ON opportunities
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users u 
            JOIN user_roles r ON u.role_id = r.id 
            WHERE u.id = auth.uid() 
            AND (r.permissions->>'opportunities'->>'create')::boolean = true
        )
    );

-- Policy: Users can update their own opportunities or if admin
CREATE POLICY "Users can update opportunities" ON opportunities
    FOR UPDATE USING (
        owner_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM users u 
            JOIN user_roles r ON u.role_id = r.id 
            WHERE u.id = auth.uid() AND r.name IN ('admin', 'sales_manager')
        )
    );

-- =============================================
-- SAMPLE DATA INSERTION
-- =============================================

-- Insert sample companies
INSERT INTO companies (name, industry, website, city, state, phone, annual_revenue, employee_count) VALUES
('Mercy Health System', 'Healthcare', 'www.mercy.com', 'St. Louis', 'MO', '(314) 555-0100', 5000000, 1200),
('University Medical Center', 'Healthcare', 'www.umc.edu', 'Las Vegas', 'NV', '(702) 555-0200', 8000000, 2500),
('Children''s Hospital Network', 'Pediatric Healthcare', 'www.childrens.org', 'Philadelphia', 'PA', '(215) 555-0300', 3000000, 800),
('Regional Orthopedic Group', 'Specialty Healthcare', 'www.orthogroup.com', 'Dallas', 'TX', '(214) 555-0400', 2000000, 150);

-- Insert sample contacts
INSERT INTO contacts (first_name, last_name, title, company_id, email, phone, department) VALUES
('Sarah', 'Johnson', 'Chief of Surgery', (SELECT id FROM companies WHERE name = 'Mercy Health System'), 'sarah.johnson@mercy.com', '(314) 555-0101', 'Surgery'),
('Michael', 'Chen', 'Orthopedic Department Head', (SELECT id FROM companies WHERE name = 'University Medical Center'), 'michael.chen@umc.edu', '(702) 555-0201', 'Orthopedics'),
('Emily', 'Rodriguez', 'Procurement Manager', (SELECT id FROM companies WHERE name = 'Children''s Hospital Network'), 'emily.rodriguez@childrens.org', '(215) 555-0301', 'Procurement'),
('David', 'Thompson', 'Practice Manager', (SELECT id FROM companies WHERE name = 'Regional Orthopedic Group'), 'david.thompson@orthogroup.com', '(214) 555-0401', 'Administration');

-- Insert sample opportunities
INSERT INTO opportunities (
    title, description, stage, estimated_value, probability, expected_close_date, 
    lead_source, priority, territory, next_step, company_id, primary_contact_id
) VALUES
('Hip Replacement Program - Q3', 'Large volume hip replacement program for elderly patients', 'qualified', 450000, 70, '2024-09-30', 'referral', 'high', 'Midwest', 'Schedule demo with surgical team', 
    (SELECT id FROM companies WHERE name = 'Mercy Health System'), 
    (SELECT id FROM contacts WHERE email = 'sarah.johnson@mercy.com')),
    
('Knee Implant Contract Renewal', 'Annual contract renewal for knee implant supplies', 'proposal', 280000, 85, '2024-08-15', 'direct_inquiry', 'high', 'West', 'Finalize pricing and terms',
    (SELECT id FROM companies WHERE name = 'University Medical Center'),
    (SELECT id FROM contacts WHERE email = 'michael.chen@umc.edu')),
    
('Pediatric Orthopedic Expansion', 'New pediatric orthopedic equipment and implants', 'lead', 150000, 30, '2024-10-31', 'trade_show', 'medium', 'East', 'Follow up call scheduled',
    (SELECT id FROM companies WHERE name = 'Children''s Hospital Network'),
    (SELECT id FROM contacts WHERE email = 'emily.rodriguez@childrens.org')),
    
('Spine Surgery Instruments', 'Complete spine surgery instrument package', 'negotiation', 320000, 60, '2024-07-20', 'cold_call', 'critical', 'South', 'Contract review in progress',
    (SELECT id FROM companies WHERE name = 'Regional Orthopedic Group'),
    (SELECT id FROM contacts WHERE email = 'david.thompson@orthogroup.com'));

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- Check all tables and record counts
SELECT 
    schemaname,
    tablename,
    CASE 
        WHEN tablename IN ('opportunities', 'companies', 'contacts', 'user_roles') 
        THEN (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = tablename)
        ELSE 0 
    END as table_exists
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('opportunities', 'opportunity_products', 'opportunity_activities', 'companies', 'contacts', 'user_roles')
ORDER BY tablename;

-- Show sample data
SELECT 'Opportunities' as data_type, COUNT(*) as count FROM opportunities
UNION ALL
SELECT 'Companies', COUNT(*) FROM companies  
UNION ALL
SELECT 'Contacts', COUNT(*) FROM contacts
UNION ALL
SELECT 'User Roles', COUNT(*) FROM user_roles; 