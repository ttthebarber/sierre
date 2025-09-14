"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Lightbulb, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  Target,
  DollarSign,
  Users,
  Package,
  Brain,
  ChevronDown,
  ChevronUp,
  Star,
  Info
} from 'lucide-react';
import { aiInsightsService, StoreAnalysis, StoreInsight } from '@/lib/services/ai-insights';
import { ShopifyAnalyticsData } from '@/lib/types/shopify-analytics';
import { useApiClientSafe } from '@/lib/hooks/use-api-with-errors';

interface InsightsPanelProps {
  storeId?: string;
  timeRange?: string;
}

export function InsightsPanel({ storeId, timeRange = '30d' }: InsightsPanelProps) {
  const apiClient = useApiClientSafe();
  const [insights, setInsights] = useState<StoreInsight[]>([]);
  const [analysis, setAnalysis] = useState<StoreAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedInsights, setExpandedInsights] = useState<Set<string>>(new Set());

  const fetchInsights = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch store data to generate insights
      const shopifyData = await apiClient.get('/integrations/shopify/status', false) as { connected: boolean, stores?: any[] };
      
      if (shopifyData.connected && shopifyData.stores && shopifyData.stores.length > 0) {
        const store = shopifyData.stores[0];
        
        // Create analytics data based on store summary
        const analyticsData: ShopifyAnalyticsData = {
          grossRevenue: store.revenue || 0,
          netRevenue: (store.revenue || 0) * 0.95,
          revenueChangePercent: store.growth_rate || 0,
          newCustomers: Math.round((store.orders || 0) * 0.7),
          newCustomersChangePercent: (store.growth_rate || 0) * 0.8,
          activeCustomers: Math.round((store.orders || 0) * 0.3),
          activeCustomersChangePercent: (store.growth_rate || 0) * 0.6,
          growthRate: store.growth_rate || 0,
          conversionRate: store.conversion_rate || 0,
          cartAbandonmentRate: 70, // Industry average
          trafficSources: {
            ads: 30,
            organic: 25,
            social: 20,
            referral: 10,
            direct: 10,
            email: 5,
          },
          totalOrders: store.orders || 0,
          averageOrderValue: store.aov || 0,
          totalVisitors: store.orders && store.conversion_rate && store.conversion_rate > 0
            ? Math.round(store.orders / (store.conversion_rate / 100))
            : 0,
          totalSessions: store.orders && store.conversion_rate && store.conversion_rate > 0
            ? Math.round(store.orders / (store.conversion_rate / 100) * 1.2)
            : 0,
        };
        
        // Generate AI analysis
        const storeAnalysis = aiInsightsService.analyzeStore(analyticsData, store.name);
        setAnalysis(storeAnalysis);
        setInsights(storeAnalysis.insights);
      } else {
        // No store data available - show empty state
        setAnalysis(null);
        setInsights([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [storeId, timeRange, apiClient]);

  const filteredInsights = selectedCategory === 'all' 
    ? insights 
    : insights.filter(insight => insight.category === selectedCategory);

  const categories = [
    { id: 'all', label: 'All', icon: <Brain className="h-4 w-4" /> },
    { id: 'revenue', label: 'Revenue', icon: <DollarSign className="h-4 w-4" /> },
    { id: 'conversion', label: 'Conversion', icon: <Target className="h-4 w-4" /> },
    { id: 'customers', label: 'Customers', icon: <Users className="h-4 w-4" /> },
    { id: 'marketing', label: 'Marketing', icon: <TrendingUp className="h-4 w-4" /> },
    { id: 'operations', label: 'Operations', icon: <Package className="h-4 w-4" /> },
  ];

  const toggleInsight = (insightId: string) => {
    const newExpanded = new Set(expandedInsights);
    if (newExpanded.has(insightId)) {
      newExpanded.delete(insightId);
    } else {
      newExpanded.add(insightId);
    }
    setExpandedInsights(newExpanded);
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'excellent': return <Star className="h-4 w-4" />;
      case 'good': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getInsightIcon = (type: string, category: string) => {
    if (type === 'success') return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (type === 'problem') return <AlertTriangle className="h-4 w-4 text-red-600" />;
    
    switch (category) {
      case 'revenue': return <DollarSign className="h-4 w-4 text-green-600" />;
      case 'conversion': return <Target className="h-4 w-4 text-blue-600" />;
      case 'customers': return <Users className="h-4 w-4 text-purple-600" />;
      case 'marketing': return <TrendingUp className="h-4 w-4 text-yellow-600" />;
      case 'operations': return <Package className="h-4 w-4 text-gray-600" />;
      default: return <Lightbulb className="h-4 w-4 text-orange-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-black">AI Insights</CardTitle>
          </div>
          <CardDescription>Analyzing your store data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-red-600" />
            <CardTitle className="text-black">AI Insights</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchInsights} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-black">AI Store Insights</CardTitle>
            <Badge variant="outline" className="text-xs">
              {insights.length} insights
            </Badge>
            {analysis && (
              <Badge className={`${getHealthColor(analysis.overallHealth)} flex items-center space-x-1`}>
                {getHealthIcon(analysis.overallHealth)}
                <span className="capitalize">{analysis.overallHealth}</span>
              </Badge>
            )}
          </div>
          <Button onClick={fetchInsights} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        <CardDescription>
          Intelligent analysis of your store performance with actionable recommendations
        </CardDescription>
        
        {/* Summary */}
        {analysis && (
          <div className="bg-gray-50 rounded-lg p-4 mt-4">
            <h3 className="font-semibold text-gray-900 mb-2">Analysis Summary</h3>
            <p className="text-gray-700 text-sm leading-relaxed">{analysis.summary}</p>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="flex items-center space-x-1"
            >
              {category.icon}
              <span>{category.label}</span>
            </Button>
          ))}
        </div>

        {/* Top Priorities */}
        {analysis && analysis.topPriorities.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
              <Target className="h-4 w-4 mr-2" />
              Top Priorities
            </h3>
            <ol className="space-y-2">
              {analysis.topPriorities.map((priority, index) => (
                <li key={index} className="text-blue-800 text-sm flex items-start">
                  <span className="bg-blue-200 text-blue-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold mr-2 mt-0.5">
                    {index + 1}
                  </span>
                  {priority}
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Insights List */}
        <div className="space-y-3">
          {filteredInsights.length === 0 ? (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Insights Available</h3>
              <p className="text-gray-600 mb-4">
                {insights.length === 0 
                  ? "Connect your Shopify store and start collecting data to generate AI insights."
                  : "No insights available for the selected category."
                }
              </p>
              {insights.length === 0 && (
                <Button asChild variant="outline" size="sm">
                  <a href="/integrations">Connect Store</a>
                </Button>
              )}
            </div>
          ) : (
            filteredInsights.map((insight) => (
                <div
                  key={insight.id}
                className={`cursor-pointer transition-all hover:shadow-md rounded-lg border ${
                  insight.type === 'problem' ? 'border-red-200 hover:border-red-300' :
                  insight.type === 'success' ? 'border-green-200 hover:border-green-300' :
                  'border-yellow-200 hover:border-yellow-300'
                }`}
                onClick={() => toggleInsight(insight.id)}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {getInsightIcon(insight.type, insight.category)}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                          <Badge className={`text-xs ${getSeverityColor(insight.severity)}`}>
                            {insight.severity}
                        </Badge>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{insight.description}</p>
                        
                        {/* Metrics Display */}
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Current: ${insight.metrics.current.toFixed(2)}</span>
                          {insight.metrics.change !== undefined && (
                            <span className={`flex items-center ${
                              insight.metrics.change >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              <TrendingUp className={`h-3 w-3 mr-1 ${
                                insight.metrics.change < 0 ? 'rotate-180' : ''
                              }`} />
                              {Math.abs(insight.metrics.change).toFixed(1)}%
                              </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {expandedInsights.has(insight.id) ? (
                        <ChevronUp className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>
                
                {expandedInsights.has(insight.id) && (
                  <div className="border-t border-gray-200 bg-gray-50 rounded-b-lg">
                    <div className="p-4">
                      <div className="space-y-4">
                        {/* Impact */}
                        <div>
                          <h5 className="font-semibold text-gray-900 mb-1">Impact</h5>
                          <p className="text-gray-700 text-sm">{insight.impact}</p>
                        </div>
                        
                        {/* Recommendation */}
                        <div>
                          <h5 className="font-semibold text-gray-900 mb-1">Recommendation</h5>
                          <p className="text-gray-700 text-sm">{insight.recommendation}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                </div>
            ))
          )}
        </div>

        {/* Insights Count */}
        <div className="text-center text-sm text-gray-500 pt-4 border-t mt-6">
          {insights.length} insight{insights.length !== 1 ? 's' : ''} found • 
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
}