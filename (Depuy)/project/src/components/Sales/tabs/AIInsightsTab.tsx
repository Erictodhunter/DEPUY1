import React, { useState, useEffect } from 'react';
import { Brain, RefreshCw, Clock, Settings, TrendingUp, AlertTriangle, Target, Package, Zap, Calendar, Play, Pause } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface AIInsight {
  id: number;
  insight_type: string;
  title: string;
  description: string;
  confidence_score: number;
  data_points: any;
  recommendations: string[];
  is_actionable: boolean;
  is_viewed: boolean;
  created_at: string;
  expires_at: string;
}

interface ScheduleOption {
  value: string;
  label: string;
  cron: string;
}

const scheduleOptions: ScheduleOption[] = [
  { value: 'manual', label: 'Manual Only', cron: '' },
  { value: 'daily', label: 'Daily at 5:00 AM', cron: '0 5 * * *' },
  { value: '6hours', label: 'Every 6 Hours', cron: '0 */6 * * *' },
  { value: 'weekly', label: 'Weekly (Mondays)', cron: '0 5 * * 1' },
  { value: 'custom', label: 'Custom Schedule', cron: '' }
];

const categoryIcons = {
  operations: TrendingUp,
  sales: Target,
  inventory: Package,
  general_business: Zap
};

const categoryColors = {
  operations: 'bg-blue-500',
  sales: 'bg-green-500', 
  inventory: 'bg-purple-500',
  general_business: 'bg-orange-500'
};

export default function AIInsightsTab() {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [schedule, setSchedule] = useState('manual');
  const [customCron, setCustomCron] = useState('');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      setLoading(true);
      setError(null);

      // Debug: Check total count first
      const { count } = await supabase
        .from('ai_insights')
        .select('*', { count: 'exact', head: true });
      
      console.log(`📊 Total insights in database: ${count}`);

      const { data, error: fetchError } = await supabase
        .from('ai_insights')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (fetchError) throw fetchError;

      console.log(`📋 Loaded ${data?.length || 0} insights from database`);
      console.log('Sample insight:', data?.[0]);

      setInsights(data || []);
      setLastRefresh(new Date());
    } catch (err: any) {
      console.error('Error loading AI insights:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const manualRefresh = async () => {
    try {
      setRefreshing(true);
      setError(null);

      // Use Supabase functions invoke method instead of direct fetch
      const { data, error: functionError } = await supabase.functions.invoke('generate-ai-insights', {
        body: {}
      });

      if (functionError) {
        // Handle specific error types
        let errorMessage = functionError.message;
        
        if (errorMessage.includes('duplicate key value violates unique constraint')) {
          errorMessage = 'Insights were recently generated. Please wait a few minutes before generating new insights, or run the duplicate fix SQL script.';
        } else if (errorMessage.includes('OpenAI')) {
          errorMessage = 'AI service temporarily unavailable. Please check your OpenAI API key and try again.';
        } else if (errorMessage.includes('timeout')) {
          errorMessage = 'Request timed out. The system may be processing a large amount of data. Please try again in a few minutes.';
        }
        
        throw new Error(errorMessage);
      }

      console.log('✨ Generated insights:', data);

      // Small delay to ensure database is updated
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Reload insights from database with force refresh
      await loadInsights();
      
      // If still no insights, try again after another delay
      setTimeout(async () => {
        const currentCount = insights.length;
        await loadInsights();
        if (insights.length === currentCount) {
          console.log('🔄 Retrying insights load...');
          await loadInsights();
        }
      }, 3000);
      
    } catch (err: any) {
      console.error('Error refreshing insights:', err);
      setError(err.message || 'An unexpected error occurred while generating insights.');
    } finally {
      setRefreshing(false);
    }
  };

  const updateSchedule = async () => {
    try {
      const selectedOption = scheduleOptions.find(opt => opt.value === schedule);
      if (!selectedOption) return;

      // Here you would call your backend to update the cron schedule
      // For now, we'll just show a success message
      console.log('Schedule updated:', selectedOption);
      setShowScheduleModal(false);
      
      // You could call a function to update the pg_cron schedule here
      
    } catch (err: any) {
      console.error('Error updating schedule:', err);
      setError(err.message);
    }
  };

  const markAsViewed = async (insightId: number) => {
    try {
      const { error } = await supabase
        .from('ai_insights')
        .update({ is_viewed: true, viewed_at: new Date().toISOString() })
        .eq('id', insightId);

      if (error) throw error;

      setInsights(prev => prev.map(insight => 
        insight.id === insightId 
          ? { ...insight, is_viewed: true }
          : insight
      ));
    } catch (err: any) {
      console.error('Error marking insight as viewed:', err);
    }
  };

  const filteredInsights = selectedCategory === 'all' 
    ? insights 
    : insights.filter(insight => insight.insight_type === selectedCategory);

  const insightsByCategory = insights.reduce((acc, insight) => {
    acc[insight.insight_type] = (acc[insight.insight_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getPriorityColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-red-400 bg-red-500/10 border-red-500/20';
    if (confidence >= 0.6) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    return 'text-green-400 bg-green-500/10 border-green-500/20';
  };

  const getPriorityLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'High Priority';
    if (confidence >= 0.6) return 'Medium Priority';
    return 'Low Priority';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2 text-gray-400">
          <Brain className="w-6 h-6 animate-pulse" />
          <span>Loading AI insights...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Brain className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">AI Insights</h2>
            <p className="text-sm text-gray-400">
              {lastRefresh ? `Last updated: ${lastRefresh.toLocaleString()}` : 'Never updated'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowScheduleModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>Schedule</span>
          </button>
          
          <button
            onClick={manualRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Generating...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span className="text-red-400 font-medium">Error</span>
          </div>
          <p className="text-red-300 mt-1">{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Insights</p>
              <p className="text-2xl font-bold text-white">{insights.length}</p>
            </div>
            <Brain className="w-8 h-8 text-purple-400" />
          </div>
        </div>

        {Object.entries(insightsByCategory).map(([category, count]) => {
          const Icon = categoryIcons[category as keyof typeof categoryIcons] || Zap;
          const colorClass = categoryColors[category as keyof typeof categoryColors] || 'bg-gray-500';
          
          return (
            <div key={category} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 capitalize">{category.replace('_', ' ')}</p>
                  <p className="text-2xl font-bold text-white">{count}</p>
                </div>
                <div className={`p-2 ${colorClass}/20 rounded-lg`}>
                  <Icon className={`w-6 h-6 text-white`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            selectedCategory === 'all'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          All Categories
        </button>
        
        {Object.keys(insightsByCategory).map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg transition-colors capitalize ${
              selectedCategory === category
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {category.replace('_', ' ')} ({insightsByCategory[category]})
          </button>
        ))}
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        {filteredInsights.length === 0 ? (
          <div className="text-center py-12">
            <Brain className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">No insights available</h3>
            <p className="text-gray-500 mb-4">Click "Refresh" to generate new AI insights</p>
            <button
              onClick={manualRefresh}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Generate Insights
            </button>
          </div>
        ) : (
          filteredInsights.map((insight) => {
            const Icon = categoryIcons[insight.insight_type as keyof typeof categoryIcons] || Zap;
            const colorClass = categoryColors[insight.insight_type as keyof typeof categoryColors] || 'bg-gray-500';
            
            return (
              <div
                key={insight.id}
                className={`bg-gray-800 rounded-lg p-6 border transition-all duration-200 hover:border-purple-500/50 ${
                  insight.is_viewed ? 'border-gray-700 opacity-75' : 'border-gray-600'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 ${colorClass}/20 rounded-lg`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{insight.title}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-sm text-gray-400 capitalize">
                          {insight.insight_type.replace('_', ' ')}
                        </span>
                        <span className="text-gray-600">•</span>
                        <span className={`text-xs px-2 py-1 rounded border ${getPriorityColor(insight.confidence_score)}`}>
                          {getPriorityLabel(insight.confidence_score)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-400">
                      {new Date(insight.created_at).toLocaleDateString()}
                    </span>
                    {!insight.is_viewed && (
                      <button
                        onClick={() => markAsViewed(insight.id)}
                        className="text-xs px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-gray-300 mb-4">{insight.description}</p>

                {insight.recommendations && insight.recommendations.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-400">Recommendations:</h4>
                    <ul className="space-y-1">
                      {insight.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-purple-400 mt-1">•</span>
                          <span className="text-gray-300 text-sm">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {insight.data_points && Object.keys(insight.data_points).length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <details className="group">
                      <summary className="text-sm text-gray-400 cursor-pointer hover:text-gray-300">
                        View Data Points
                      </summary>
                      <div className="mt-2 text-xs text-gray-500 bg-gray-900/50 rounded p-2">
                        <pre>{JSON.stringify(insight.data_points, null, 2)}</pre>
                      </div>
                    </details>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Schedule AI Insights</h3>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Generation Schedule
                </label>
                <select
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                >
                  {scheduleOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {schedule === 'custom' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Custom Cron Expression
                  </label>
                  <input
                    type="text"
                    value={customCron}
                    onChange={(e) => setCustomCron(e.target.value)}
                    placeholder="0 5 * * *"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Format: minute hour day month weekday
                  </p>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={updateSchedule}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  Save Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 