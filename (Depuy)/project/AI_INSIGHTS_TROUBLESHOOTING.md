# AI Insights Database Issue Troubleshooting

## Problem
Edge Function generates insights successfully but they're not being saved to the database.

**Symptoms:**
- Console shows: `✨ Generated insights: {success: true, message: 'Generated and saved 20 AI insights'}`
- But database count remains: `📊 Total insights in database: 0`

## Root Causes & Solutions

### 1. Row Level Security (RLS) Issue ⚠️
**Most Likely Cause**: RLS is blocking the Edge Function from inserting data.

**Solution**: Run `fix_ai_insights_database_issue.sql` in Supabase SQL Editor.

### 2. Edge Function Permissions 🔑
**Cause**: Edge Function using wrong API key (anon vs service role).

**Check**: 
- Go to Supabase Dashboard → Edge Functions → Settings
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set (not anon key)

### 3. Database Schema Issues 🗄️
**Cause**: Missing columns or incorrect data types.

**Solution**: Run the schema fix SQL scripts.

## Quick Fixes

### Option 1: Run the Database Fix (Recommended)
```sql
-- Copy and paste fix_ai_insights_database_issue.sql into Supabase SQL Editor
```

### Option 2: Manual RLS Fix
```sql
-- Disable RLS temporarily
ALTER TABLE ai_insights DISABLE ROW LEVEL SECURITY;

-- Test if insights now save
-- Then create proper RLS policy:
CREATE POLICY "Allow service role" ON ai_insights FOR ALL USING (true);
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
```

### Option 3: Deploy Debug Edge Function
1. Replace your current Edge Function with `generate-ai-insights-debug.ts`
2. Deploy: `supabase functions deploy generate-ai-insights`
3. Check Supabase Edge Function logs for detailed error messages

## Testing Steps

1. **Run the SQL fix script**
2. **Test manual insert**:
   ```sql
   INSERT INTO ai_insights (insight_type, title, description, confidence_score) 
   VALUES ('test', 'Manual Test', 'Testing manual insert', 0.8);
   ```
3. **Check if it appears**:
   ```sql
   SELECT COUNT(*) FROM ai_insights;
   ```
4. **If manual insert works**, the issue is with the Edge Function
5. **If manual insert fails**, the issue is with database permissions/RLS

## Expected Results After Fix

✅ **Before Fix:**
- Edge Function: `success: true, 20 insights`
- Database: `📊 Total insights in database: 0`

✅ **After Fix:**
- Edge Function: `success: true, 20 insights`  
- Database: `📊 Total insights in database: 20`
- UI: Insights appear in the interface

## Verification

After applying fixes:
1. Click "Generate Insights" in the UI
2. Check console logs for database count
3. Verify insights appear in the interface
4. Run debug SQL to confirm database has data

## Support

If issues persist:
1. Check Supabase Edge Function logs
2. Run the debug Edge Function
3. Verify all environment variables are set
4. Check for any constraint violations in logs 