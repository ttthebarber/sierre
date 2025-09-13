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
        // Fetch insights
        try {
          const data = await apiClient.get('/ai/insights', false) as { insights?: any[] }; // Disable error display for this call
          
          const insights = data.insights || [];
          
          // Calculate statistics from actual insights
          setInsightStats({
            total: insights.length,
            opportunities: insights.filter((i: any) => i.type === 'opportunity').length,
            warnings: insights.filter((i: any) => i.type === 'warning').length,
            recommendations: insights.filter((i: any) => i.type === 'recommendation').length,
            successes: insights.filter((i: any) => i.type === 'success').length,
            highImpact: insights.filter((i: any) => i.impact === 'high').length,
            actionable: insights.filter((i: any) => i.actionable).length,
          });
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
                <CardContent className="p-6">
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
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Analytics Coming Soon
                </h3>
                <p className="text-gray-600">
                  Track insight performance, implementation rates, and ROI metrics
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
      </FadeIn>
    </AppLayout>
  );
}
