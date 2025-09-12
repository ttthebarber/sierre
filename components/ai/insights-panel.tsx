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
  ShoppingCart,
  Brain,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';

interface AIInsight {
  id: string;
  type: 'opportunity' | 'warning' | 'success' | 'recommendation';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  actionable: boolean;
  category: 'revenue' | 'operations' | 'marketing' | 'inventory' | 'customer';
  metrics?: {
    current?: number;
    potential?: number;
    improvement?: string;
  };
  actions?: string[];
}

interface InsightsPanelProps {
  storeId?: string;
  timeRange?: string;
}

const categoryIcons = {
  revenue: DollarSign,
  operations: Target,
  marketing: Users,
  inventory: Package,
  customer: ShoppingCart,
};

const typeConfig = {
  opportunity: {
    icon: TrendingUp,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    badgeColor: 'bg-blue-100 text-blue-800',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    badgeColor: 'bg-orange-100 text-orange-800',
  },
  success: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    badgeColor: 'bg-green-100 text-green-800',
  },
  recommendation: {
    icon: Lightbulb,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    badgeColor: 'bg-purple-100 text-purple-800',
  },
};

const impactConfig = {
  high: { color: 'text-red-600', label: 'High Impact' },
  medium: { color: 'text-yellow-600', label: 'Medium Impact' },
  low: { color: 'text-gray-600', label: 'Low Impact' },
};

export function InsightsPanel({ storeId, timeRange = '30d' }: InsightsPanelProps) {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const fetchInsights = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storeId: storeId || 'default',
          timeRange,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch insights');
      }

      const data = await response.json();
      setInsights(data.insights || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [storeId, timeRange]);

  const filteredInsights = selectedCategory === 'all' 
    ? insights 
    : insights.filter(insight => insight.category === selectedCategory);

  const categories = ['all', ...Array.from(new Set(insights.map(i => i.category)))];

  const getImprovementIcon = (improvement?: string) => {
    if (!improvement) return Minus;
    if (improvement.startsWith('+')) return ArrowUpRight;
    if (improvement.startsWith('-')) return ArrowDownRight;
    return Minus;
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
            <CardTitle className="text-black">AI Insights</CardTitle>
            <Badge variant="outline" className="text-xs">
              {insights.length} insights
            </Badge>
          </div>
          <Button onClick={fetchInsights} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        <CardDescription>
          Intelligent analysis of your store performance with actionable recommendations
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="capitalize"
            >
              {category === 'all' ? 'All' : category}
            </Button>
          ))}
        </div>

        {/* Insights List */}
        <div className="space-y-4">
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
            filteredInsights.map((insight) => {
              const config = typeConfig[insight.type];
              const Icon = config.icon;
              const CategoryIcon = categoryIcons[insight.category];
              const ImprovementIcon = getImprovementIcon(insight.metrics?.improvement);

              return (
                <div
                  key={insight.id}
                  className={`p-4 rounded-lg border ${config.borderColor} ${config.bgColor}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${config.bgColor}`}>
                      <Icon className={`h-5 w-5 ${config.color}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                        <Badge className={config.badgeColor} variant="secondary">
                          {insight.type}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {impactConfig[insight.impact].label}
                        </Badge>
                        <div className="flex items-center gap-1 ml-auto">
                          <CategoryIcon className="h-4 w-4 text-gray-500" />
                          <span className="text-xs text-gray-500 capitalize">
                            {insight.category}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mb-3">{insight.description}</p>
                      
                      {/* Metrics */}
                      {insight.metrics && (
                        <div className="flex items-center gap-4 mb-3">
                          {insight.metrics.current && (
                            <div className="flex items-center gap-1">
                              <span className="text-sm text-gray-600">Current:</span>
                              <span className="font-medium">
                                {typeof insight.metrics.current === 'number' && insight.metrics.current < 10
                                  ? `${insight.metrics.current}%`
                                  : `$${insight.metrics.current.toLocaleString()}`
                                }
                              </span>
                            </div>
                          )}
                          
                          {insight.metrics.potential && (
                            <div className="flex items-center gap-1">
                              <span className="text-sm text-gray-600">Potential:</span>
                              <span className="font-medium">
                                {typeof insight.metrics.potential === 'number' && insight.metrics.potential < 10
                                  ? `${insight.metrics.potential}%`
                                  : `$${insight.metrics.potential.toLocaleString()}`
                                }
                              </span>
                            </div>
                          )}
                          
                          {insight.metrics.improvement && (
                            <div className="flex items-center gap-1">
                              <ImprovementIcon className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium text-green-600">
                                {insight.metrics.improvement}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Actions */}
                      {insight.actions && insight.actions.length > 0 && (
                        <div className="mt-3">
                          <h5 className="text-sm font-medium text-gray-900 mb-2">Recommended Actions:</h5>
                          <ul className="space-y-1">
                            {insight.actions.slice(0, 3).map((action, index) => (
                              <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                                <span className="text-purple-500 mt-1">•</span>
                                {action}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* Confidence Score */}
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-xs text-gray-500">Confidence:</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-20">
                          <div
                            className="bg-purple-500 h-2 rounded-full"
                            style={{ width: `${insight.confidence * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">
                          {Math.round(insight.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
