import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import ConversionChart from "../components/charts/conversion-chart";
import IndustryChart from "../components/charts/industry-chart";
import { TrendingUp, TrendingDown, Users, Globe, Percent, DollarSign, Search, Mail, BarChart3, Palette } from "lucide-react";

type Analytics = {
  totalLeads: number;
  sitesGenerated: number;
  conversionRate: number;
  totalRevenue: number;
  monthlyStats: any[];
  industryBreakdown: any[];
};

type Lead = {
  id: string | number;
  name: string;
  industry: string;
  status: string;
  createdAt: string;
};

export default function Dashboard() {
  const { data: analytics, isLoading: analyticsLoading } = useQuery<Analytics>({
    queryKey: ["/api/analytics"],
  });

  const { data: recentLeads, isLoading: leadsLoading } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
  });

  if (analyticsLoading || leadsLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-muted rounded-xl animate-pulse"></div>
          <div className="h-96 bg-muted rounded-xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  const stats = analytics || {
    totalLeads: 0,
    sitesGenerated: 0,
    conversionRate: 0,
    totalRevenue: 0,
  };

  const leads = recentLeads?.slice(0, 3) || [];

  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Leads</p>
                <p className="text-3xl font-bold">{stats.totalLeads.toLocaleString()}</p>
                <p className="text-sm text-green-600 mt-1 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +12.5% this month
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="text-blue-600 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sites Generated</p>
                <p className="text-3xl font-bold">{stats.sitesGenerated.toLocaleString()}</p>
                <p className="text-sm text-green-600 mt-1 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +8.2% this month
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Globe className="text-emerald-600 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                <p className="text-3xl font-bold">{stats.conversionRate.toFixed(1)}%</p>
                <p className="text-sm text-amber-600 mt-1 flex items-center">
                  <TrendingDown className="w-4 h-4 mr-1" />
                  -2.1% this month
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Percent className="text-amber-600 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                <p className="text-3xl font-bold">${stats.totalRevenue.toLocaleString()}</p>
                <p className="text-sm text-green-600 mt-1 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +15.3% this month
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="text-green-600 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Lead Generation & Conversion</CardTitle>
              <select className="text-sm border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            <ConversionChart data={analytics?.monthlyStats || []} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Industry Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <IndustryChart data={analytics?.industryBreakdown || []} />
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Leads</CardTitle>
              <Button variant="link" size="sm">
                View all
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leads.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No recent leads</p>
              ) : (
                leads.map((lead: any) => (
                  <div key={lead.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary/30 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                        <span className="text-lg font-semibold">{lead.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-medium">{lead.name}</p>
                        <p className="text-sm text-muted-foreground">{lead.industry}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={
                        lead.status === "approved" ? "default" :
                        lead.status === "generated" ? "secondary" :
                        lead.status === "paid" ? "default" : "outline"
                      }>
                        {lead.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button className="w-full brand-gradient text-white p-4 h-auto justify-start" variant="default">
                <Search className="mr-3 w-5 h-5" />
                <div className="text-left">
                  <p className="font-semibold">Scrape New Leads</p>
                  <p className="text-sm text-blue-100">Find businesses without websites</p>
                </div>
              </Button>

              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-4 h-auto justify-start">
                <Mail className="mr-3 w-5 h-5" />
                <div className="text-left">
                  <p className="font-semibold">Send Bulk Emails</p>
                  <p className="text-sm text-emerald-100">Reach out to pending leads</p>
                </div>
              </Button>

              <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white p-4 h-auto justify-start">
                <BarChart3 className="mr-3 w-5 h-5" />
                <div className="text-left">
                  <p className="font-semibold">View Analytics</p>
                  <p className="text-sm text-amber-100">Detailed performance insights</p>
                </div>
              </Button>

              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white p-4 h-auto justify-start">
                <Palette className="mr-3 w-5 h-5" />
                <div className="text-left">
                  <p className="font-semibold">Create Template</p>
                  <p className="text-sm text-purple-100">Design new website themes</p>
                </div>
              </Button>
            </div>

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">System Status</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Email Service</span>
                  <span className="flex items-center text-green-600">
                    <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                    Operational
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Payment Gateway</span>
                  <span className="flex items-center text-green-600">
                    <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                    Operational
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Site Generator</span>
                  <span className="flex items-center text-green-600">
                    <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                    Operational
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
