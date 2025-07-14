import React from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { CheckCircle, CreditCard, X } from "lucide-react";
import { queryClient, apiRequest } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";
import PayPalButton from "../components/PayPalButton";
import { BusinessLead, GeneratedSite } from "@shared/schema";
function PaymentForm({ leadId, amount, leadIdString }: { leadId: number; amount: number; leadIdString: string }) {
  const { toast } = useToast();

  const paymentMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/create-payment", {
        leadId,
        amount,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({
        title: "Payment Initiated",
        description: "Complete your payment using PayPal below.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Payment Setup Failed",
        description: error.message || "Payment setup failed",
        variant: "destructive",
      });
    },
  });

  const handlePayPalSuccess = async (transactionId: string) => {
    try {
      await apiRequest("POST", "/api/update-payment-status", {
        leadId,
        transactionId,
        status: "completed",
      });

      queryClient.invalidateQueries({ queryKey: [`/api/leads/${leadIdString}`] });
      toast({
        title: "Payment Successful",
        description: "Your deposit has been processed successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Payment Update Failed",
        description: "Payment succeeded but status update failed. Contact support.",
        variant: "destructive",
      });
    }
  };

  // Make the success handler available globally for PayPal component
  React.useEffect(() => {
    (window as any).handlePayPalSuccess = handlePayPalSuccess;
    return () => {
      delete (window as any).handlePayPalSuccess;
    };
  }, [leadId, leadIdString]);

  return (
    <div className="space-y-4">
      <div className="p-4 border border-border rounded-lg bg-card">
        <h3 className="font-semibold mb-4">Complete Payment with PayPal</h3>
        <div className="space-y-4">
          <PayPalButton
            amount={amount.toString()}
            currency="USD"
            intent="CAPTURE"
          />
        </div>
      </div>
      <Button
        onClick={() => paymentMutation.mutate()}
        disabled={paymentMutation.isPending}
        className="w-full bg-emerald-600 hover:bg-emerald-700"
      >
        {paymentMutation.isPending ? "Processing..." : `Pay $${amount} Deposit`}
      </Button>
    </div>
  );
}

export default function ClientPortal() {
  const { id } = useParams();
  const { toast } = useToast();

  const { data: lead, isLoading } = useQuery<BusinessLead>({
    queryKey: [`/api/leads/${id}`],
  });

  const { data: sites } = useQuery<GeneratedSite[]>({
    queryKey: [`/api/sites/${id}`],
    enabled: !!id,
  });

  const approveMutation = useMutation({
    mutationFn: async (siteId: number) => {
      const response = await apiRequest("PUT", `/api/sites/${siteId}/approve`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/leads/${id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/sites/${id}`] });
      toast({
        title: "Website Approved",
        description: "Your website has been approved successfully!",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <X className="h-8 w-8 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Not Found</h1>
            <p className="text-gray-600">The requested business page was not found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const site = sites?.[0];
  const depositAmount = 459; // 60% of typical $765 website cost

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">W</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">WebPulse AI</h1>
              <p className="text-xs text-muted-foreground">Website Preview Portal</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">{lead.name}</h2>
          <p className="text-muted-foreground">Review your custom website design</p>
          <Badge className="mt-2" variant={
            lead.status === "approved" ? "default" :
            lead.status === "generated" ? "secondary" :
            lead.status === "paid" ? "default" : "outline"
          }>
            {lead.status}
          </Badge>
        </div>

        {site && lead.status === "generated" && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Website Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Sample website preview */}
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white p-8 text-center">
                  <h1 className="text-4xl font-bold mb-2">{lead.name}</h1>
                  <p className="text-xl text-amber-100">{lead.description}</p>
                  <Button className="mt-4 bg-white text-amber-700 hover:bg-amber-50">
                    Learn More
                  </Button>
                </div>

                <div className="p-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div>
                      <h2 className="text-3xl font-bold mb-4">Welcome to {lead.name}</h2>
                      <p className="text-muted-foreground mb-6">{lead.description}</p>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <span className="text-amber-600">📍</span>
                          <span>{lead.address}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-amber-600">📞</span>
                          <span>{lead.phone}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-amber-600">📧</span>
                          <span>{lead.email}</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-muted rounded-lg h-64 flex items-center justify-center">
                      <span className="text-muted-foreground">Business Image</span>
                    </div>
                  </div>

                  <div className="bg-muted rounded-lg p-6">
                    <h3 className="text-2xl font-bold mb-4 text-center">Contact Us</h3>
                    <div className="max-w-md mx-auto space-y-4">
                      <input
                        type="text"
                        placeholder="Your Name"
                        className="w-full border border-border rounded-lg px-4 py-3"
                        disabled
                      />
                      <input
                        type="email"
                        placeholder="Your Email"
                        className="w-full border border-border rounded-lg px-4 py-3"
                        disabled
                      />
                      <textarea
                        placeholder="Your Message"
                        rows={4}
                        className="w-full border border-border rounded-lg px-4 py-3"
                        disabled
                      />
                      <Button className="w-full bg-amber-600 hover:bg-amber-700" disabled>
                        Send Message
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-6 border-t border-border flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  <p>Ready to approve? <span className="font-medium">60% deposit (${depositAmount}) required to proceed</span></p>
                </div>
                <div className="flex items-center space-x-3">
                  <Button variant="outline">
                    Request Changes
                  </Button>
                  <Button
                    onClick={() => approveMutation.mutate(site.id)}
                    disabled={approveMutation.isPending}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <CheckCircle className="mr-2 w-4 h-4" />
                    Approve Design
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {lead.status === "approved" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="mr-2 w-5 h-5" />
                Complete Your Payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <p className="text-muted-foreground mb-4">
                  Your website design has been approved! Complete your 60% deposit payment to proceed with development.
                </p>
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Deposit Amount:</span>
                    <span className="text-2xl font-bold text-primary">${depositAmount}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Final payment of ${765 - depositAmount} due upon website completion
                  </p>
                </div>
              </div>
              <PaymentForm leadId={parseInt(id!)} amount={depositAmount} leadIdString={id!} />
              </CardContent>
          </Card>
        )}

        {lead.status === "paid" && (
          <Card>
            <CardContent className="pt-6 text-center">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Payment Received!</h3>
              <p className="text-muted-foreground">
                Thank you for your payment. Your website is now in development and will be completed within 24 hours.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
