"use client";

import { useState, useEffect } from 'react';
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InsightsPanel } from "@/components/ai/insights-panel";
import { 
  Brain, 
  Settings, 
  BarChart3, 
  TrendingUp,
  CheckCircle,
  Lightbulb,
  RefreshCw,
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
  const [dataSources, setDataSources] = useState<{[key: string]: boolean}>({});
  const [insightCategories, setInsightCategories] = useState<{[key: string]: boolean}>({});
  const [notificationPrefs, setNotificationPrefs] = useState<{[key: string]: boolean}>({});
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    // Fetch insight statistics and app data
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch insights
        try {
          const data = await apiClient.post('/ai/insights', {
            storeId: 'default',
            timeRange,
          }, false) as { insights?: any[] }; // Disable error display for this call
          
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
        try {
          const shopifyData = await apiClient.get('/integrations/shopify/status', false) as { connected: boolean }; // Disable error display
          setDataSources({
            'Shopify Analytics': shopifyData.connected,
            'Google Analytics': false, // Not implemented yet
          });
        } catch (error) {
          // Silently handle errors for data sources
          setDataSources({
            'Shopify Analytics': false,
            'Google Analytics': false,
          });
        }

        // Set default insight categories (all enabled by default)
        setInsightCategories({
          'Revenue': true,
          'Operations': true,
          'Marketing': true,
          'Inventory': true,
          'Customer': true,
        });

        // Set default notification preferences
        setNotificationPrefs({
          'High Impact Insights': true,
          'Weekly Summary': true,
        });

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
        setDataSources({
          'Shopify Analytics': false,
          'Google Analytics': false,
        });
        setInsightCategories({
          'Revenue': true,
          'Operations': true,
          'Marketing': true,
          'Inventory': true,
          'Customer': true,
        });
        setNotificationPrefs({
          'High Impact Insights': true,
          'Weekly Summary': true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  const handleRegenerateInsights = async () => {
    setRegenerating(true);
    try {
      // Trigger insight regeneration
      await apiClient.post('/ai/insights', {
        storeId: 'default',
        timeRange,
        regenerate: true,
      }, true); // Enable error display for user-initiated actions

      // Refresh the page data
      window.location.reload();
    } catch (error) {
      // Error is already handled by the API client
    } finally {
      setRegenerating(false);
    }
  };

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
          <Tabs value={timeRange} onValueChange={(value) => setTimeRange(value as any)}>
            <TabsList className="bg-white border border-gray-200">
              <TabsTrigger value="7d" className="data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900">
                7 days
              </TabsTrigger>
              <TabsTrigger value="30d" className="data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900">
                30 days
              </TabsTrigger>
              <TabsTrigger value="90d" className="data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900">
                90 days
              </TabsTrigger>
            </TabsList>
          </Tabs>
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

        {/* Main Content Tabs */}
        <Tabs defaultValue="insights" className="space-y-6">
          <TabsList className="bg-white border border-gray-200">
            <TabsTrigger value="insights" className="data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900">
              <Brain className="h-4 w-4 mr-2" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="insights" className="space-y-6">
            <InsightsPanel timeRange={timeRange} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
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
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-black">AI Insights Settings</CardTitle>
                <CardDescription>
                  Configure how AI insights are generated and displayed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Insight Categories</h4>
                    <div className="space-y-2">
                      {Object.entries(insightCategories).map(([category, enabled]) => (
                        <div key={category} className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">{category}</span>
                          <Badge 
                            variant={enabled ? "outline" : "secondary"} 
                            className={`text-xs ${enabled ? 'text-green-600 border-green-200' : 'text-gray-500'}`}
                          >
                            {enabled ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Notification Preferences</h4>
                    <div className="space-y-2">
                      {Object.entries(notificationPrefs).map(([pref, enabled]) => (
                        <div key={pref} className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">{pref}</span>
                          <Badge 
                            variant={enabled ? "outline" : "secondary"} 
                            className={`text-xs ${enabled ? 'text-green-600 border-green-200' : 'text-gray-500'}`}
                          >
                            {enabled ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Data Sources</h4>
                    <div className="space-y-2">
                      {Object.entries(dataSources).map(([source, connected]) => (
                        <div key={source} className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">{source}</span>
                          <Badge 
                            variant={connected ? "outline" : "secondary"} 
                            className={`text-xs ${connected ? 'text-green-600 border-green-200' : 'text-gray-500'}`}
                          >
                            {connected ? 'Connected' : 'Not Connected'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <Button 
                    className="bg-black hover:bg-gray-800 text-white"
                    onClick={handleRegenerateInsights}
                    disabled={regenerating}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${regenerating ? 'animate-spin' : ''}`} />
                    {regenerating ? 'Regenerating...' : 'Regenerate Insights'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </div>
      </FadeIn>
    </AppLayout>
  );
}
