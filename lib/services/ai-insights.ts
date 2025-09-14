import { ShopifyAnalyticsData } from '@/lib/types/shopify-analytics';

export interface StoreInsight {
  id: string;
  type: 'problem' | 'opportunity' | 'success';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: string;
  recommendation: string;
  metrics: {
    current: number;
    previous?: number;
    change?: number;
  };
  category: 'revenue' | 'conversion' | 'traffic' | 'customers' | 'marketing' | 'operations';
}

export interface StoreAnalysis {
  overallHealth: 'excellent' | 'good' | 'warning' | 'critical';
  insights: StoreInsight[];
  summary: string;
  topPriorities: string[];
}

export class AIInsightsService {
  private static instance: AIInsightsService;
  
  static getInstance(): AIInsightsService {
    if (!AIInsightsService.instance) {
      AIInsightsService.instance = new AIInsightsService();
    }
    return AIInsightsService.instance;
  }

  analyzeStore(data: ShopifyAnalyticsData, shopName: string): StoreAnalysis {
    const insights: StoreInsight[] = [];
    
    // Analyze revenue performance
    insights.push(...this.analyzeRevenue(data));
    
    // Analyze conversion metrics
    insights.push(...this.analyzeConversion(data));
    
    // Analyze customer acquisition
    insights.push(...this.analyzeCustomers(data));
    
    // Analyze traffic sources
    insights.push(...this.analyzeTraffic(data));
    
    // Analyze operational metrics
    insights.push(...this.analyzeOperations(data));
    
    // Calculate overall health
    const overallHealth = this.calculateOverallHealth(insights);
    
    // Generate summary
    const summary = this.generateSummary(insights, overallHealth, shopName);
    
    // Get top priorities
    const topPriorities = this.getTopPriorities(insights);
    
    return {
      overallHealth,
      insights,
      summary,
      topPriorities
    };
  }

  private analyzeRevenue(data: ShopifyAnalyticsData): StoreInsight[] {
    const insights: StoreInsight[] = [];
    
    // Revenue decline analysis
    if (data.revenueChangePercent < -10) {
      insights.push({
        id: 'revenue-decline',
        type: 'problem',
        severity: data.revenueChangePercent < -30 ? 'critical' : 'high',
        title: 'Revenue Decline Detected',
        description: `Revenue has decreased by ${Math.abs(data.revenueChangePercent).toFixed(1)}% compared to the previous period.`,
        impact: `This represents a loss of approximately $${Math.abs(data.grossRevenue * data.revenueChangePercent / 100).toFixed(0)} in potential revenue.`,
        recommendation: 'Focus on improving your marketing creatives and ad targeting. Test new ad formats, refresh your creative assets, and optimize your audience targeting to improve conversion rates.',
        metrics: {
          current: data.grossRevenue,
          change: data.revenueChangePercent
        },
        category: 'revenue'
      });
    }
    
    // Low average order value
    if (data.averageOrderValue < 50) {
      insights.push({
        id: 'low-aov',
        type: 'opportunity',
        severity: 'medium',
        title: 'Low Average Order Value',
        description: `Your AOV of $${data.averageOrderValue.toFixed(2)} is below the industry average of $75.`,
        impact: 'Increasing AOV by just $10 could boost revenue by 20% with the same number of orders.',
        recommendation: 'Implement upselling strategies, bundle products, offer free shipping thresholds, and create product recommendations to increase order value.',
        metrics: {
          current: data.averageOrderValue
        },
        category: 'revenue'
      });
    }
    
    // High cart abandonment
    if (data.cartAbandonmentRate > 75) {
      insights.push({
        id: 'high-abandonment',
        type: 'problem',
        severity: 'high',
        title: 'High Cart Abandonment Rate',
        description: `Your cart abandonment rate of ${data.cartAbandonmentRate}% is significantly above the industry average of 70%.`,
        impact: `Reducing abandonment by 10% could recover approximately $${(data.grossRevenue * 0.1).toFixed(0)} in lost revenue.`,
        recommendation: 'Implement cart abandonment email sequences, optimize checkout flow, add trust signals, and offer incentives like free shipping or discounts.',
        metrics: {
          current: data.cartAbandonmentRate
        },
        category: 'conversion'
      });
    }
    
    return insights;
  }

  private analyzeConversion(data: ShopifyAnalyticsData): StoreInsight[] {
    const insights: StoreInsight[] = [];
    
    // Low conversion rate
    if (data.conversionRate < 2) {
      insights.push({
        id: 'low-conversion',
        type: 'problem',
        severity: 'high',
        title: 'Low Conversion Rate',
        description: `Your conversion rate of ${data.conversionRate.toFixed(2)}% is below the industry average of 2.5%.`,
        impact: `Improving conversion by 0.5% could generate ${Math.round(data.totalSessions * 0.005)} additional orders.`,
        recommendation: 'Optimize your product pages, improve site speed, enhance product descriptions and images, and implement social proof elements like reviews and testimonials.',
        metrics: {
          current: data.conversionRate
        },
        category: 'conversion'
      });
    }
    
    // High conversion rate (success)
    if (data.conversionRate > 3.5) {
      insights.push({
        id: 'high-conversion',
        type: 'success',
        severity: 'low',
        title: 'Excellent Conversion Rate',
        description: `Your conversion rate of ${data.conversionRate.toFixed(2)}% is well above the industry average.`,
        impact: 'This indicates strong product-market fit and effective marketing strategies.',
        recommendation: 'Continue current strategies and consider scaling successful campaigns. Document what\'s working to replicate success across other marketing channels.',
        metrics: {
          current: data.conversionRate
        },
        category: 'conversion'
      });
    }
    
    return insights;
  }

  private analyzeCustomers(data: ShopifyAnalyticsData): StoreInsight[] {
    const insights: StoreInsight[] = [];
    
    // Declining new customers
    if (data.newCustomersChangePercent < -15) {
      insights.push({
        id: 'declining-customers',
        type: 'problem',
        severity: 'high',
        title: 'Declining New Customer Acquisition',
        description: `New customer acquisition has decreased by ${Math.abs(data.newCustomersChangePercent).toFixed(1)}%.`,
        impact: 'This trend could lead to long-term revenue decline as customer acquisition is crucial for growth.',
        recommendation: 'Invest in customer acquisition campaigns, expand to new marketing channels, improve your referral program, and enhance your brand presence on social media.',
        metrics: {
          current: data.newCustomers,
          change: data.newCustomersChangePercent
        },
        category: 'customers'
      });
    }
    
    // Low customer retention
    if (data.newCustomers > 0 && data.activeCustomers < data.newCustomers * 0.3) {
      insights.push({
        id: 'low-retention',
        type: 'problem',
        severity: 'medium',
        title: 'Low Customer Retention',
        description: `Only ${((data.activeCustomers / data.newCustomers) * 100).toFixed(1)}% of new customers are making repeat purchases.`,
        impact: 'Customer retention is more cost-effective than acquisition and drives long-term revenue growth.',
        recommendation: 'Implement email marketing campaigns, loyalty programs, personalized product recommendations, and follow-up sequences to encourage repeat purchases.',
        metrics: {
          current: data.activeCustomers,
          previous: data.newCustomers
        },
        category: 'customers'
      });
    }
    
    return insights;
  }

  private analyzeTraffic(data: ShopifyAnalyticsData): StoreInsight[] {
    const insights: StoreInsight[] = [];
    const traffic = data.trafficSources;
    
    // Over-reliance on paid traffic
    if (traffic.ads > 60) {
      insights.push({
        id: 'high-paid-traffic',
        type: 'opportunity',
        severity: 'medium',
        title: 'Over-reliance on Paid Traffic',
        description: `${traffic.ads}% of your traffic comes from paid advertising, which can be expensive and unsustainable.`,
        impact: 'Diversifying traffic sources reduces dependency on ad spend and improves long-term profitability.',
        recommendation: 'Focus on SEO, content marketing, social media engagement, and email marketing to build organic traffic sources.',
        metrics: {
          current: traffic.ads
        },
        category: 'marketing'
      });
    }
    
    // Low organic traffic
    if (traffic.organic < 20) {
      insights.push({
        id: 'low-organic-traffic',
        type: 'opportunity',
        severity: 'medium',
        title: 'Low Organic Traffic',
        description: `Only ${traffic.organic}% of traffic comes from organic search, limiting your reach and increasing acquisition costs.`,
        impact: 'Organic traffic is free and typically converts better than paid traffic.',
        recommendation: 'Invest in SEO, create valuable content, optimize product descriptions, and build quality backlinks to improve organic visibility.',
        metrics: {
          current: traffic.organic
        },
        category: 'marketing'
      });
    }
    
    return insights;
  }

  private analyzeOperations(data: ShopifyAnalyticsData): StoreInsight[] {
    const insights: StoreInsight[] = [];
    
    // Low order volume
    if (data.totalOrders < 50) {
      insights.push({
        id: 'low-orders',
        type: 'opportunity',
        severity: 'medium',
        title: 'Low Order Volume',
        description: `With only ${data.totalOrders} orders, you have room to significantly increase sales volume.`,
        impact: 'Increasing order volume is essential for scaling your business and improving profitability.',
        recommendation: 'Focus on marketing campaigns, product launches, seasonal promotions, and expanding your product catalog to drive more orders.',
        metrics: {
          current: data.totalOrders
        },
        category: 'operations'
      });
    }
    
    // High traffic, low conversion
    const trafficToConversionRatio = data.totalOrders > 0 ? data.totalSessions / data.totalOrders : 0;
    if (trafficToConversionRatio > 50) {
      insights.push({
        id: 'traffic-conversion-gap',
        type: 'problem',
        severity: 'medium',
        title: 'Traffic Not Converting',
        description: `You're getting good traffic (${data.totalSessions} sessions) but low conversion rates.`,
        impact: 'This suggests issues with your sales funnel or product-market fit.',
        recommendation: 'Analyze your sales funnel, improve product-market fit, optimize pricing, and enhance the customer experience to convert more visitors into buyers.',
        metrics: {
          current: trafficToConversionRatio
        },
        category: 'operations'
      });
    }
    
    return insights;
  }

  private calculateOverallHealth(insights: StoreInsight[]): 'excellent' | 'good' | 'warning' | 'critical' {
    const criticalIssues = insights.filter(i => i.severity === 'critical').length;
    const highIssues = insights.filter(i => i.severity === 'high').length;
    const mediumIssues = insights.filter(i => i.severity === 'medium').length;
    const successes = insights.filter(i => i.type === 'success').length;
    
    if (criticalIssues > 0) return 'critical';
    if (highIssues > 2) return 'warning';
    if (highIssues > 0 || mediumIssues > 3) return 'warning';
    if (successes > 2 && highIssues === 0 && mediumIssues <= 1) return 'excellent';
    return 'good';
  }

  private generateSummary(insights: StoreInsight[], health: string, shopName: string): string {
    const problems = insights.filter(i => i.type === 'problem').length;
    const opportunities = insights.filter(i => i.type === 'opportunity').length;
    const successes = insights.filter(i => i.type === 'success').length;
    
    let summary = `${shopName} is showing `;
    
    if (health === 'excellent') {
      summary += 'excellent performance with strong metrics across all areas. ';
    } else if (health === 'good') {
      summary += 'good overall performance with room for optimization. ';
    } else if (health === 'warning') {
      summary += 'concerning trends that need immediate attention. ';
    } else {
      summary += 'critical issues that require urgent intervention. ';
    }
    
    if (problems > 0) {
      summary += `We've identified ${problems} key problem${problems > 1 ? 's' : ''} affecting your store's performance. `;
    }
    
    if (opportunities > 0) {
      summary += `There are also ${opportunities} significant opportunit${opportunities > 1 ? 'ies' : 'y'} for growth. `;
    }
    
    if (successes > 0) {
      summary += `On the positive side, you have ${successes} area${successes > 1 ? 's' : ''} performing exceptionally well. `;
    }
    
    summary += 'Focus on the high-priority recommendations below to improve your store\'s performance.';
    
    return summary;
  }

  private getTopPriorities(insights: StoreInsight[]): string[] {
    // Sort insights by severity and impact
    const sortedInsights = insights
      .filter(i => i.type === 'problem')
      .sort((a, b) => {
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      });
    
    return sortedInsights.slice(0, 3).map(insight => insight.recommendation);
  }
}

export const aiInsightsService = AIInsightsService.getInstance();
