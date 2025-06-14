# AI Insights Setup Guide

## Overview
The AI Insights tab provides intelligent analysis of your DePuy Synthes sales pipeline data using OpenAI's GPT models. It generates actionable business insights across Operations, Sales Performance, Business Strategy, and Inventory & Manufacturers.

## Features
- **Manual Refresh**: Generate insights on-demand
- **Scheduling Options**: Set automatic generation (daily, 6-hourly, weekly, custom)
- **Category Filtering**: View insights by type (Operations, Sales, Inventory, Business)
- **Priority Levels**: High/Medium/Low priority based on confidence scores
- **Mark as Read**: Track which insights you've reviewed
- **Data Points**: View underlying data used for analysis

## Setup Instructions

### 1. Database Schema
The AI insights functionality requires the `ai_insights` table. If you haven't already, run:

```sql
-- Run the cleanup and final fix SQL files
\i ai_insights_cleanup_fix.sql
\i ai_insights_final_fix.sql
```

### 2. Edge Function
Ensure your `generate-ai-insights` Edge Function is deployed with the updated code:

```typescript
// File: supabase/functions/generate-ai-insights/index.ts
// Use the generate-ai-insights-updated.ts version
```

### 3. Environment Variables
Set these in your Supabase Edge Function environment:

```bash
OPENAI_API_KEY=your_openai_api_key_here
RESEND_API_KEY=your_resend_api_key_here  # Optional for email notifications
```

### 4. Supabase Configuration
Make sure your `lib/supabase.ts` file is properly configured with your project URL and anon key.

## Usage

### Manual Generation
1. Navigate to Sales Management → AI Insights tab
2. Click the "Refresh" button to generate new insights
3. Wait for the analysis to complete (usually 10-30 seconds)

### Scheduling
1. Click the "Schedule" button
2. Choose from preset options:
   - **Manual Only**: No automatic generation
   - **Daily at 5:00 AM**: Once per day
   - **Every 6 Hours**: 4 times per day
   - **Weekly (Mondays)**: Once per week
   - **Custom Schedule**: Enter your own cron expression

### Viewing Insights
- **Filter by Category**: Use the category buttons to focus on specific types
- **Priority Levels**: 
  - 🔴 High Priority (80%+ confidence)
  - 🟡 Medium Priority (60-79% confidence)
  - 🟢 Low Priority (<60% confidence)
- **Mark as Read**: Click to track reviewed insights
- **Data Points**: Expand to see underlying analysis data

## Insight Categories

### Operations
- Process efficiency analysis
- Resource utilization insights
- Workflow optimization recommendations

### Sales Performance
- Win rate analysis
- Pipeline health assessment
- Performance trends and patterns

### Business Strategy
- Market opportunity identification
- Competitive positioning insights
- Growth strategy recommendations

### Inventory & Manufacturers
- Stock level optimization
- Supplier performance analysis
- Product demand forecasting

## Data Sources
The AI analyzes real data from your database:
- Sales opportunities and pipeline stages
- Hospital and surgeon relationships
- Product performance and inventory
- Manufacturer partnerships
- Historical sales patterns

## Troubleshooting

### Common Issues

**"No insights available"**
- Click "Refresh" to generate new insights
- Check that you have data in your opportunities table
- Verify Edge Function is deployed and working

**"Failed to generate insights" error**
- Check OpenAI API key is set correctly
- Verify Supabase Edge Function is deployed
- Check browser console for detailed error messages

**Scheduling not working**
- Ensure pg_cron extension is enabled in Supabase
- Run the setup_ai_insights_cron.sql file
- Check Supabase logs for cron job execution

### Manual Testing
Test the Edge Function directly:

```bash
curl -X POST 'https://your-project.supabase.co/functions/v1/generate-ai-insights' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{}'
```

## Performance Notes
- Insights are cached for 30 days to avoid redundant analysis
- Each generation analyzes up to 1000 recent opportunities
- Processing time depends on data volume (typically 10-30 seconds)
- OpenAI API costs approximately $0.01-0.05 per generation

## Security
- All data is processed securely through Supabase Edge Functions
- No sensitive data is stored in OpenAI logs
- Insights automatically expire after 30 days
- Row Level Security (RLS) protects access to insights

## Support
If you encounter issues:
1. Check the browser console for error messages
2. Review Supabase Edge Function logs
3. Verify your OpenAI API key has sufficient credits
4. Ensure all SQL schema updates have been applied 