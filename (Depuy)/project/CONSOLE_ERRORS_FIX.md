# Console Errors Fix Guide

## Issue 1: npm start from wrong directory

**Error:**
```
npm error code ENOENT
npm error path C:\Users\Erict\Downloads\DEPUY FINAL\package.json
```

**Solution:**
You need to run the command from the correct project directory.

**For PowerShell (Windows):**
```powershell
cd "(Depuy)/project"
npm run dev
```

**For Command Prompt:**
```cmd
cd "(Depuy)/project" && npm run dev
```

**Not:** `npm start` from the root folder
**Use:** `npm run dev` from the `(Depuy)/project` folder

## Issue 2: AI Insights Duplicate Constraint Error

**Error:**
```
duplicate key value violates unique constraint "ai_insights_title_unique"
ERROR: 42P17: functions in index expression must be marked IMMUTABLE
```

**Solution Options:**

### Option 1: Corrected Fix (Recommended)
Run `ai_insights_duplicate_fix_corrected.sql` in your Supabase SQL Editor:
- Adds a proper date column
- Creates efficient indexes
- Handles the IMMUTABLE function error

### Option 2: Simple Fix (Easiest)
Run `ai_insights_simple_fix.sql` in your Supabase SQL Editor:
- Removes all constraints
- Allows duplicate titles
- Just works without restrictions

### Option 3: Manual Quick Fix
```sql
-- Remove all constraints (copy-paste into Supabase SQL Editor)
ALTER TABLE ai_insights DROP CONSTRAINT IF EXISTS ai_insights_title_unique;
DROP INDEX IF EXISTS ai_insights_title_date_unique;
```

## Issue 3: Edge Function 500 Error

**Possible Causes:**
1. OpenAI API key not set or invalid
2. Database constraint violations
3. Edge Function not deployed properly

**Solutions:**

### Check OpenAI API Key
1. Go to Supabase Dashboard → Edge Functions → Settings
2. Verify `OPENAI_API_KEY` environment variable is set
3. Test the key at https://platform.openai.com/

### Redeploy Edge Function
```bash
supabase functions deploy generate-ai-insights
```

### Test Edge Function Directly
```bash
curl -X POST 'https://your-project.supabase.co/functions/v1/generate-ai-insights' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{}'
```

## Quick Start Commands

```bash
# Navigate to correct directory
cd "(Depuy)/project"

# Install dependencies (if needed)
npm install

# Start development server
npm run dev
```

## Verification Steps

1. ✅ Run `npm run dev` from `(Depuy)/project` directory
2. ✅ Execute the duplicate fix SQL script
3. ✅ Check Supabase Edge Function logs for errors
4. ✅ Verify OpenAI API key is set correctly
5. ✅ Test AI Insights tab in the browser

## Still Having Issues?

Check the browser console for specific error messages and:
1. Verify all SQL schema updates have been applied
2. Check Supabase Edge Function logs
3. Ensure your OpenAI API key has sufficient credits
4. Try clearing browser cache and refreshing 