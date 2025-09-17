"use client";

import { useState, useEffect } from 'react';
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InsightsPanel } from "@/components/ai/insights-panel";
import { 
  Brain, 
  BarChart3, 
  TrendingUp,
  CheckCircle,
  Lightbulb,
  Download,
  Filter
} from "lucide-react";
import { FadeIn } from "@/components/ui/fade-in";
import { useApiClientSafe } from "@/lib/hooks/use-api-with-errors";

interface InsightStats {
  total: number;
  opportunities: number;
  warnings: number;
  recommendations: number;
  successes: number;
  highImpact: number;
  actionable: number;
}

export default function AIInsightsPage() {
  const apiClient = useApiClientSafe();
  const [insightStats, setInsightStats] = useState<InsightStats>({
    total: 0,
    opportunities: 0,
    warnings: 0,
    recommendations: 0,
    successes: 0,
    highImpact: 0,
    actionable: 0,
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    // Fetch insight statistics and app data
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch insights from the new AI insights service
        try {
          // Get store data to calculate insights stats
          const shopifyData = await apiClient.get('/integrations/shopify/status', false) as { connected: boolean, stores?: any[] };
          
          if (shopifyData.connected && shopifyData.stores && shopifyData.stores.length > 0) {
            // Calculate stats based on connected stores
            // The actual insights are generated in the InsightsPanel component
            setInsightStats({
              total: 0, // Will be calculated by the InsightsPanel
              opportunities: 0,
              warnings: 0,
              recommendations: 0,
              successes: 0,
              highImpact: 0,
              actionable: 0,
            });
          } else {
            // No store connected
            setInsightStats({
              total: 0,
              opportunities: 0,
              warnings: 0,
              recommendations: 0,
              successes: 0,
              highImpact: 0,
              actionable: 0,
            });
          }
        } catch (error) {
          // Silently handle errors for insights
          setInsightStats({
            total: 0,
            opportunities: 0,
            warnings: 0,
            recommendations: 0,
            successes: 0,
            highImpact: 0,
            actionable: 0,
          });
        }

        // Fetch data source connections

      } catch (error) {
        console.error('Failed to fetch data:', error);
        setInsightStats({
          total: 0,
          opportunities: 0,
          warnings: 0,
          recommendations: 0,
          successes: 0,
          highImpact: 0,
          actionable: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);


  const statCards = [
    {
      title: 'Total Insights',
      value: insightStats.total,
      icon: Brain,
      color: 'text-purple-600',
    },
    {
      title: 'High Impact',
      value: insightStats.highImpact,
      icon: TrendingUp,
      color: 'text-red-600',
    },
    {
      title: 'Actionable',
      value: insightStats.actionable,
      icon: CheckCircle,
      color: 'text-green-600',
    },
    {
      title: 'Opportunities',
      value: insightStats.opportunities,
      icon: Lightbulb,
      color: 'text-blue-600',
    },
  ];

  return (
    <AppLayout title="Insights">
      <FadeIn>
        <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              AI-Powered Insights
            </h1>
            <p className="text-gray-600">
              Intelligent analysis of your store performance with actionable recommendations
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Time Range:</span>
          <div className="flex bg-white border border-gray-200 rounded-lg p-1">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <Button
                key={range}
                variant="ghost"
                size="sm"
                className={`text-xs px-3 py-1 ${
                  timeRange === range 
                    ? 'bg-gray-100 text-gray-900' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setTimeRange(range)}
              >
                {range === '7d' ? '7 days' : range === '30d' ? '30 days' : '90 days'}
              </Button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="border-gray-200 shadow-sm">
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {loading ? '...' : stat.value}
                      </p>
                    </div>
                    <div>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Insights Panel */}
          <InsightsPanel timeRange={timeRange} />
          
          {/* Analytics Section */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-black">Insight Analytics</CardTitle>
              <CardDescription>
                Track the performance and impact of AI insights over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Analytics Coming Soon
                    </h3>
                    <p className="text-gray-600">
                      Track insight performance, implementation rates, and ROI metrics
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
      </FadeIn>
    </AppLayout>
  );
}
