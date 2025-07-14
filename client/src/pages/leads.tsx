import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Plus, Download, Eye, Zap, MoreHorizontal } from "lucide-react";
import { queryClient, apiRequest } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";
import LeadForm from "../components/forms/lead-form";

export default function Leads() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [industryFilter, setIndustryFilter] = useState("");
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const { toast } = useToast();

  const { data: leadsRaw, isLoading } = useQuery({
    queryKey: ["/api/leads"],
  });
  const leads: any[] = Array.isArray(leadsRaw) ? leadsRaw : [];
  const generateSiteMutation = useMutation({
    mutationFn: async (leadId: number) => {
      const lead = leads.find((l: any) => l.id === leadId) || {};
      const response = await apiRequest("POST", "/api/sites/generate", {
        leadId,
        template: "professional",
        customizations: {
          businessName: lead.name || "",
          businessDescription: lead.description || "",
          industry: lead.industry || "",
          email: lead.email || "",
          phone: lead.phone || "",
          address: lead.address || "",
          primaryColor: "#3B82F6",
          secondaryColor: "#10B981",
          includeContactForm: true,
          includeMaps: true,
          includeSocial: false,
          includeSEO: true,
        },
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({
        title: "Website Generated",
        description: "Website has been generated successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate website",
        variant: "destructive",
      });
    },
  });
  const filteredLeads = leads.filter((lead: any) => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || lead.status === statusFilter;
    const matchesIndustry = !industryFilter || lead.industry === industryFilter;
    
    return matchesSearch && matchesStatus && matchesIndustry;
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-32 bg-muted rounded-xl"></div>
          <div className="h-96 bg-muted rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Business Leads</h2>
          <p className="text-muted-foreground">Manage and track your lead generation pipeline</p>
        </div>
        <div className="flex items-center space-x-3">
          <Dialog open={isAddLeadOpen} onOpenChange={setIsAddLeadOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="mr-2 w-4 h-4" />
                Add Leads
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Lead</DialogTitle>
              </DialogHeader>
              <LeadForm onSuccess={() => setIsAddLeadOpen(false)} />
            </DialogContent>
          </Dialog>
          <Button variant="outline">
            <Download className="mr-2 w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Search</label>
              <Input
                placeholder="Search businesses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="generated">Generated</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Industry</label>
              <Select value={industryFilter} onValueChange={setIndustryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Industries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Industries</SelectItem>
                  <SelectItem value="restaurant">Restaurant</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="professional">Professional Services</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="automotive">Automotive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Date Range</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Last 30 days" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Added</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No leads found
                  </TableCell>
                </TableRow>
              ) : (
                filteredLeads.map((lead: any) => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                          <span className="font-semibold">{lead.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-medium">{lead.name}</p>
                          <p className="text-sm text-muted-foreground">{lead.address}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{lead.email}</p>
                        <p className="text-sm text-muted-foreground">{lead.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{lead.industry}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        lead.status === "approved" ? "default" :
                        lead.status === "generated" ? "secondary" :
                        lead.status === "paid" ? "default" :
                        lead.status === "delivered" ? "default" : "outline"
                      }>
                        {lead.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{new Date(lead.createdAt).toLocaleDateString()}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        {lead.status === "pending" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => generateSiteMutation.mutate(lead.id)}
                            disabled={generateSiteMutation.isPending}
                          >
                            <Zap className="w-4 h-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
