import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { DollarSign, Clock, Calendar, CheckCircle, Plus, Download, Eye, MoreHorizontal } from "lucide-react";

type Payment = {
  id: number;
  leadId: number;
  amount: string;
  paymentType: string;
  gateway: string;
  status: string;
  createdAt: string;
};

export default function Payments() {
  const { data: payments, isLoading } = useQuery<Payment[]>({
    queryKey: ["/api/payments"],
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-xl"></div>
            ))}
          </div>
          <div className="h-96 bg-muted rounded-xl"></div>
        </div>
      </div>
    );
  }

  const completedPayments = payments?.filter((p: any) => p.status === "completed") || [];
  const pendingPayments = payments?.filter((p: any) => p.status === "pending") || [];
  
  const totalRevenue = completedPayments.reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0);
  const pendingAmount = pendingPayments.reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0);
  const monthlyRevenue = completedPayments
    .filter((p: any) => new Date(p.createdAt).getMonth() === new Date().getMonth())
    .reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0);
  
  const successRate = payments && payments.length > 0 ? (completedPayments.length / payments.length) * 100 : 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Payment Management</h2>
          <p className="text-muted-foreground">Track deposits, invoices, and payment status</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button>
            <Plus className="mr-2 w-4 h-4" />
            Manual Payment
          </Button>
          <Button variant="outline">
            <Download className="mr-2 w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Payment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-3xl font-bold">${totalRevenue.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="text-green-600 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Payments</p>
                <p className="text-3xl font-bold">${pendingAmount.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="text-amber-600 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Month</p>
                <p className="text-3xl font-bold">${monthlyRevenue.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Calendar className="text-primary w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-3xl font-bold">{successRate.toFixed(1)}%</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-emerald-600 w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            <Select>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Payments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Payments</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Gateway</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!payments || payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No payments found
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment: any) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                          <span className="font-semibold">B</span>
                        </div>
                        <div>
                          <p className="font-medium">Business #{payment.leadId}</p>
                          <p className="text-sm text-muted-foreground">TXN-{payment.id.toString().padStart(6, '0')}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">${parseFloat(payment.amount).toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">{payment.paymentType} Payment</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-primary/10 rounded flex items-center justify-center">
                          <span className="text-xs font-bold text-primary">
                            {payment.gateway === "stripe" ? "S" : "P"}
                          </span>
                        </div>
                        <span className="text-sm capitalize">{payment.gateway}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        payment.status === "completed" ? "default" :
                        payment.status === "pending" ? "secondary" :
                        "destructive"
                      }>
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{new Date(payment.createdAt).toLocaleDateString()}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(payment.createdAt).toLocaleTimeString()}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
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
