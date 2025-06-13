-- Populate Sales Data for Dashboard Testing
-- Run this SQL in your Supabase SQL Editor

-- First, let's insert some hospitals if they don't exist
INSERT INTO hospitals (name, address, city, state, zip_code, phone, type, status) 
VALUES 
  ('Mayo Clinic', '200 First Street SW', 'Rochester', 'MN', '55905', '507-284-2511', 'academic', 'active'),
  ('Cleveland Clinic', '9500 Euclid Avenue', 'Cleveland', 'OH', '44195', '216-444-2200', 'academic', 'active'),
  ('Johns Hopkins Hospital', '1800 Orleans St', 'Baltimore', 'MD', '21287', '410-955-5000', 'academic', 'active'),
  ('Mass General Hospital', '55 Fruit Street', 'Boston', 'MA', '02114', '617-726-2000', 'academic', 'active'),
  ('UCSF Medical Center', '505 Parnassus Ave', 'San Francisco', 'CA', '94143', '415-476-1000', 'academic', 'active'),
  ('Houston Methodist', '6565 Fannin St', 'Houston', 'TX', '77030', '713-790-3311', 'private', 'active'),
  ('Cedars-Sinai Medical Center', '8700 Beverly Blvd', 'Los Angeles', 'CA', '90048', '310-423-3277', 'private', 'active'),
  ('NewYork-Presbyterian Hospital', '525 E 68th St', 'New York', 'NY', '10065', '212-746-5454', 'academic', 'active')
ON CONFLICT (name) DO NOTHING;

-- Insert some surgeons if they don't exist
INSERT INTO surgeons (first_name, last_name, specialization, hospital_id, email, phone, license_number, years_experience, status)
SELECT 
  first_name, last_name, specialization, 
  h.id as hospital_id,
  LOWER(first_name || '.' || last_name || '@' || REPLACE(LOWER(h.name), ' ', '') || '.com') as email,
  '555-' || LPAD((ROW_NUMBER() OVER())::text, 3, '0') || '-' || LPAD((ROW_NUMBER() OVER() + 1000)::text, 4, '0') as phone,
  'MD' || LPAD((ROW_NUMBER() OVER() + 10000)::text, 6, '0') as license_number,
  years_experience, 'active' as status
FROM (
  VALUES 
    ('John', 'Martinez', 'Orthopedic Surgery', 15),
    ('Sarah', 'Chen', 'Orthopedic Surgery', 20),
    ('Michael', 'Johnson', 'Orthopedic Surgery', 12),
    ('Emily', 'Davis', 'Joint Replacement', 18),
    ('Robert', 'Wilson', 'Spine Surgery', 25),
    ('Lisa', 'Anderson', 'Orthopedic Surgery', 14),
    ('David', 'Thompson', 'Joint Replacement', 22),
    ('Jennifer', 'Garcia', 'Sports Medicine', 16),
    ('Christopher', 'Miller', 'Trauma Surgery', 19),
    ('Amanda', 'Brown', 'Orthopedic Surgery', 13),
    ('James', 'Taylor', 'Joint Replacement', 17),
    ('Michelle', 'Williams', 'Spine Surgery', 21),
    ('Kevin', 'Jones', 'Orthopedic Surgery', 11),
    ('Rachel', 'Moore', 'Sports Medicine', 15),
    ('Steven', 'Jackson', 'Trauma Surgery', 23)
) AS surgeon_data(first_name, last_name, specialization, years_experience)
CROSS JOIN (
  SELECT id, ROW_NUMBER() OVER() as rn 
  FROM hospitals 
  WHERE status = 'active'
) h
WHERE surgeon_data.first_name = (
  SELECT first_name 
  FROM (
    VALUES 
      ('John', 1), ('Sarah', 2), ('Michael', 3), ('Emily', 4), ('Robert', 5),
      ('Lisa', 6), ('David', 7), ('Jennifer', 8), ('Christopher', 1), ('Amanda', 2),
      ('James', 3), ('Michelle', 4), ('Kevin', 5), ('Rachel', 6), ('Steven', 7)
  ) AS mapping(fname, hospital_rank)
  WHERE mapping.fname = surgeon_data.first_name AND mapping.hospital_rank = h.rn
)
ON CONFLICT (email) DO NOTHING;

-- Now let's create comprehensive opportunities data
WITH date_series AS (
  SELECT 
    generate_series(
      CURRENT_DATE - INTERVAL '6 months',
      CURRENT_DATE,
      INTERVAL '3 days'
    )::date as created_date
),
hospital_list AS (
  SELECT id, name, ROW_NUMBER() OVER() as hospital_rank
  FROM hospitals 
  WHERE status = 'active'
  LIMIT 8
),
surgeon_list AS (
  SELECT id, first_name, last_name, hospital_id, ROW_NUMBER() OVER() as surgeon_rank
  FROM surgeons 
  WHERE status = 'active'
  LIMIT 15
),
stage_weights AS (
  SELECT stage, weight FROM (
    VALUES 
      ('lead', 40),
      ('qualified', 25),
      ('proposal', 20),
      ('negotiation', 10),
      ('closed_won', 3),
      ('closed_lost', 2)
  ) as sw(stage, weight)
),
opportunity_base AS (
  SELECT 
    ds.created_date,
    hl.id as hospital_id,
    hl.name as hospital_name,
    sl.id as surgeon_id,
    sl.first_name || ' ' || sl.last_name as surgeon_name,
    -- Weighted random stage selection
    (ARRAY['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'])[
      CASE 
        WHEN random() < 0.4 THEN 1  -- lead
        WHEN random() < 0.65 THEN 2 -- qualified  
        WHEN random() < 0.85 THEN 3 -- proposal
        WHEN random() < 0.95 THEN 4 -- negotiation
        WHEN random() < 0.98 THEN 5 -- closed_won
        ELSE 6                      -- closed_lost
      END
    ] as stage,
    -- More realistic estimated values
    (ARRAY[25000, 35000, 50000, 75000, 100000, 125000, 150000, 200000, 250000, 350000])[
      CEIL(random() * 10)::int
    ] as estimated_value,
    -- Probability based on stage
    CASE 
      WHEN random() < 0.4 THEN (20 + random() * 30)::int  -- lead: 20-50%
      WHEN random() < 0.65 THEN (40 + random() * 40)::int -- qualified: 40-80%
      WHEN random() < 0.85 THEN (60 + random() * 30)::int -- proposal: 60-90%
      WHEN random() < 0.95 THEN (75 + random() * 20)::int -- negotiation: 75-95%
      WHEN random() < 0.98 THEN 100                        -- closed_won: 100%
      ELSE 0                                               -- closed_lost: 0%
    END as probability_percentage,
    ROW_NUMBER() OVER() as row_num
  FROM date_series ds
  CROSS JOIN hospital_list hl
  CROSS JOIN surgeon_list sl
  WHERE 
    -- Create realistic distribution - not every combination every day
    random() < 0.15  -- Only 15% of possible combinations
    AND (
      -- More opportunities in recent months
      ds.created_date >= CURRENT_DATE - INTERVAL '3 months' OR
      random() < 0.3
    )
),
final_opportunities AS (
  SELECT 
    'DePuy-' || LPAD(row_num::text, 4, '0') || '-' || 
    EXTRACT(year FROM created_date)::text as title,
    
    CASE row_num % 8
      WHEN 0 THEN 'Hip replacement surgery for elderly patient'
      WHEN 1 THEN 'Knee reconstruction for sports injury'
      WHEN 2 THEN 'Spinal fusion procedure'
      WHEN 3 THEN 'Joint replacement for arthritis patient'
      WHEN 4 THEN 'Trauma surgery for accident victim'
      WHEN 5 THEN 'Revision hip surgery'
      WHEN 6 THEN 'Bilateral knee replacement'
      WHEN 7 THEN 'Shoulder replacement procedure'
    END as description,
    
    stage,
    estimated_value,
    probability_percentage,
    
    CASE 
      WHEN stage IN ('closed_won', 'closed_lost') THEN 
        created_date + INTERVAL '30 days' + (random() * INTERVAL '60 days')
      WHEN stage = 'negotiation' THEN 
        CURRENT_DATE + INTERVAL '2 weeks' + (random() * INTERVAL '30 days')
      WHEN stage = 'proposal' THEN 
        CURRENT_DATE + INTERVAL '1 month' + (random() * INTERVAL '45 days')
      WHEN stage = 'qualified' THEN 
        CURRENT_DATE + INTERVAL '2 months' + (random() * INTERVAL '60 days')
      ELSE 
        CURRENT_DATE + INTERVAL '3 months' + (random() * INTERVAL '90 days')
    END as expected_close_date,
    
    hospital_id,
    surgeon_id,
    created_date as created_at,
    
    CASE 
      WHEN stage IN ('closed_won', 'closed_lost') THEN 
        created_date + INTERVAL '30 days' + (random() * INTERVAL '60 days')
      ELSE created_date
    END as updated_at,
    
    -- Contact information
    'Sales Rep ' || (row_num % 5 + 1)::text as primary_contact,
    ARRAY['Email', 'Phone Call', 'Trade Show', 'Referral', 'Website'][(row_num % 5) + 1] as lead_source,
    
    -- Additional fields
    CASE 
      WHEN stage = 'closed_won' THEN estimated_value
      WHEN stage = 'closed_lost' THEN 0
      ELSE NULL
    END as actual_value,
    
    CASE 
      WHEN stage IN ('proposal', 'negotiation', 'closed_won', 'closed_lost') THEN 
        'Proposal sent on ' || (created_date + INTERVAL '15 days')::text
      WHEN stage IN ('qualified') THEN 
        'Initial meeting completed'
      ELSE 'Initial contact made'
    END as notes,
    
    -- Competitive info
    CASE row_num % 4
      WHEN 0 THEN 'Stryker'
      WHEN 1 THEN 'Zimmer Biomet'
      WHEN 2 THEN 'Smith & Nephew'
      ELSE NULL
    END as competitors,
    
    row_num
  FROM opportunity_base
  ORDER BY created_date DESC
  LIMIT 500  -- Create 500 opportunities
)
INSERT INTO opportunities (
  title, description, stage, estimated_value, probability_percentage,
  expected_close_date, hospital_id, surgeon_id, created_at, updated_at,
  primary_contact, lead_source, actual_value, notes, competitors
)
SELECT 
  title, description, stage, estimated_value, probability_percentage,
  expected_close_date, hospital_id, surgeon_id, created_at, updated_at,
  primary_contact, lead_source, actual_value, notes, competitors
FROM final_opportunities
ON CONFLICT DO NOTHING;

-- Update some opportunities to have more recent activity
UPDATE opportunities 
SET 
  updated_at = CURRENT_TIMESTAMP - (random() * INTERVAL '7 days'),
  notes = notes || '. Updated: ' || CURRENT_DATE::text
WHERE id IN (
  SELECT id 
  FROM opportunities 
  WHERE stage NOT IN ('closed_won', 'closed_lost')
  ORDER BY random() 
  LIMIT 50
);

-- Add some monthly progression for closed deals
WITH monthly_closes AS (
  SELECT 
    generate_series(
      date_trunc('month', CURRENT_DATE - INTERVAL '5 months'),
      date_trunc('month', CURRENT_DATE),
      INTERVAL '1 month'
    ) as close_month
),
close_updates AS (
  SELECT 
    o.id,
    mc.close_month + INTERVAL '15 days' + (random() * INTERVAL '10 days') as new_close_date
  FROM opportunities o
  CROSS JOIN monthly_closes mc
  WHERE o.stage = 'closed_won'
  AND random() < 0.2  -- 20% chance per month
  ORDER BY random()
  LIMIT 30
)
UPDATE opportunities 
SET 
  updated_at = cu.new_close_date,
  actual_value = estimated_value
FROM close_updates cu
WHERE opportunities.id = cu.id;

-- Create some activity logs for recent opportunities
INSERT INTO activity_logs (
  table_name, record_id, action, old_values, new_values, 
  user_id, timestamp, ip_address, user_agent
)
SELECT 
  'opportunities',
  o.id,
  CASE 
    WHEN o.stage = 'closed_won' THEN 'opportunity_won'
    WHEN o.stage = 'closed_lost' THEN 'opportunity_lost'
    WHEN o.stage = 'negotiation' THEN 'stage_updated'
    WHEN o.stage = 'proposal' THEN 'proposal_sent'
    ELSE 'opportunity_created'
  END,
  '{}',
  json_build_object(
    'stage', o.stage,
    'estimated_value', o.estimated_value,
    'hospital', h.name,
    'surgeon', s.first_name || ' ' || s.last_name
  ),
  'system',
  o.updated_at,
  '127.0.0.1',
  'Dashboard Data Seeder'
FROM opportunities o
JOIN hospitals h ON o.hospital_id = h.id
JOIN surgeons s ON o.surgeon_id = s.id
WHERE o.updated_at >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY o.updated_at DESC
LIMIT 100;

-- Summary of what we created
SELECT 
  'SUMMARY: Data Population Complete' as status,
  COUNT(*) as total_opportunities,
  COUNT(*) FILTER (WHERE stage = 'lead') as leads,
  COUNT(*) FILTER (WHERE stage = 'qualified') as qualified,
  COUNT(*) FILTER (WHERE stage = 'proposal') as proposals,
  COUNT(*) FILTER (WHERE stage = 'negotiation') as negotiations,
  COUNT(*) FILTER (WHERE stage = 'closed_won') as won,
  COUNT(*) FILTER (WHERE stage = 'closed_lost') as lost,
  SUM(estimated_value) as total_pipeline_value,
  SUM(actual_value) as total_closed_value,
  ROUND(AVG(estimated_value), 0) as avg_deal_size
FROM opportunities;

SELECT 
  'Hospital Distribution' as info,
  h.name as hospital,
  COUNT(o.id) as opportunities,
  SUM(o.estimated_value) as total_value,
  ROUND(AVG(o.estimated_value), 0) as avg_value
FROM hospitals h
LEFT JOIN opportunities o ON h.id = o.hospital_id
GROUP BY h.id, h.name
ORDER BY COUNT(o.id) DESC;

SELECT 
  'Monthly Trends' as info,
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as opportunities_created,
  COUNT(*) FILTER (WHERE stage = 'closed_won') as won_this_month,
  SUM(estimated_value) as total_value
FROM opportunities
WHERE created_at >= CURRENT_DATE - INTERVAL '6 months'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month; 