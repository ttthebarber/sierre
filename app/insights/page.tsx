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
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
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
                <ChartContainer config={{
                  insights: {
                    label: "Insights",
                    color: "#8B5CF6",
                  },
                  implemented: {
                    label: "Implemented",
                    color: "#10B981",
                  },
                  impact: {
                    label: "Impact Score",
                    color: "#F59E0B",
                  }
                }} className="h-full">
                  <AreaChart data={[
                    { date: "Week 1", insights: 0, implemented: 0, impact: 0 },
                    { date: "Week 2", insights: 0, implemented: 0, impact: 0 },
                    { date: "Week 3", insights: 0, implemented: 0, impact: 0 },
                    { date: "Week 4", insights: 0, implemented: 0, impact: 0 },
                  ]} margin={{ left: 12, right: 12, top: 10 }}>
                    <CartesianGrid vertical={false} stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="date" 
                      tickLine={false} 
                      axisLine={false} 
                      tickMargin={8} 
                      tick={{ fill: "#374151", fontSize: 12 }} 
                    />
                    <YAxis 
                      tick={{ fill: "#374151", fontSize: 12 }} 
                      tickLine={false}
                      axisLine={false}
                    />
                    <ChartTooltip 
                      content={<ChartTooltipContent />}
                    />
                    <defs>
                      <linearGradient id="fillInsights" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.05}/>
                      </linearGradient>
                      <linearGradient id="fillImplemented" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.05}/>
                      </linearGradient>
                      <linearGradient id="fillImpact" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.05}/>
                      </linearGradient>
                    </defs>
                    <Area 
                      type="monotone" 
                      dataKey="insights" 
                      stroke="#8B5CF6" 
                      strokeWidth={2}
                      fill="url(#fillInsights)"
                      fillOpacity={1}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="implemented" 
                      stroke="#10B981" 
                      strokeWidth={2}
                      fill="url(#fillImplemented)"
                      fillOpacity={1}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="impact" 
                      stroke="#F59E0B" 
                      strokeWidth={2}
                      fill="url(#fillImpact)"
                      fillOpacity={1}
                    />
                  </AreaChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
      </FadeIn>
    </AppLayout>
  );
}
