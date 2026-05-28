import { Button, Card, Input, Label, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components";

import { useState } from "react";
import {
  CreditCard,
  Building,
  CheckCircle,
  Clock,
  Download,
  AlertTriangle,
  Settings,
  Sparkles,
  Plus
} from "lucide-react";
import { toast } from "sonner";

interface Invoice {
  id: string;
  date: string;
  amount: string;
  status: "Paid" | "Pending" | "Failed";
  type: string;
}

export default function Billing() {
  const [currentPlan, setCurrentPlan] = useState({
    name: "Enterprise SLA",
    price: "$499/month",
    billingCycle: "Monthly",
    nextPayment: "2026-06-15",
    paymentMethod: "Visa ending in 4242"
  });

  const [invoices, setInvoices] = useState<Invoice[]>([
    { id: "INV-9021", date: "2026-05-15", amount: "$499.00", status: "Paid", type: "Subscription" },
    { id: "INV-8742", date: "2026-04-15", amount: "$499.00", status: "Paid", type: "Subscription" },
    { id: "INV-8419", date: "2026-04-02", amount: "$150.00", status: "Paid", type: "Storage Add-on (+500GB)" },
    { id: "INV-8219", date: "2026-03-15", amount: "$499.00", status: "Paid", type: "Subscription" },
    { id: "INV-7901", date: "2026-02-15", amount: "$499.00", status: "Paid", type: "Subscription" }
  ]);

  const [showAddCard, setShowAddCard] = useState(false);
  const [cardDetails, setCardDetails] = useState({ name: "", number: "", expiry: "", cvc: "" });

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardDetails.name || !cardDetails.number) {
      toast.error("Please fill in card details");
      return;
    }
    setCurrentPlan(prev => ({
      ...prev,
      paymentMethod: `Visa ending in ${cardDetails.number.slice(-4) || "9999"}`
    }));
    toast.success("Payment method updated successfully!");
    setShowAddCard(false);
    setCardDetails({ name: "", number: "", expiry: "", cvc: "" });
  };

  const handleDownloadInvoice = (id: string) => {
    toast.success(`Downloading invoice receipt for ${id}...`);
  };

  return (
    <div className="w-full h-full">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-[#1F2937] mb-1">Billing & Subscription Management</h2>
        <p className="text-sm text-[#6B7280]">Review enterprise licenses, update payment card structures, and inspect billing history</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Plan details and Payment Method */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Active Plan Card */}
          <Card className="bg-gradient-to-br from-[#0F766E] to-[#14B8A6] border-none p-5 text-white shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                <span className="text-xs uppercase tracking-wider font-bold">Active Subscription</span>
              </div>
              <Sparkles className="w-5 h-5 text-[#ffbd59]" />
            </div>

            <h3 className="text-2xl font-bold mb-1">{currentPlan.name}</h3>
            <p className="text-3xl font-extrabold mb-4">{currentPlan.price}</p>
            
            <div className="space-y-2 text-xs border-t border-white/20 pt-4 text-white/90">
              <div className="flex justify-between">
                <span>Billing Frequency:</span>
                <span className="font-semibold">{currentPlan.billingCycle}</span>
              </div>
              <div className="flex justify-between">
                <span>Next Renewal Date:</span>
                <span className="font-semibold">{currentPlan.nextPayment}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Source:</span>
                <span className="font-semibold">{currentPlan.paymentMethod}</span>
              </div>
            </div>
          </Card>

          {/* Payment Method Card */}
          <Card className="bg-white border-[#E5E7EB] p-5 shadow-sm">
            <h4 className="text-sm font-semibold text-[#1F2937] mb-4">Payment Method</h4>
            
            {!showAddCard ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 border border-[#E5E7EB] rounded-xl bg-[#F9FAFB]">
                  <CreditCard className="w-8 h-8 text-[#0F766E] shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-[#1F2937]">{currentPlan.paymentMethod}</p>
                    <p className="text-[10px] text-[#9CA3AF]">Default payment source</p>
                  </div>
                </div>
                <Button
                  onClick={() => setShowAddCard(true)}
                  variant="outline"
                  className="w-full h-10 border-[#E5E7EB] hover:bg-[#F9FAFB] text-xs font-semibold"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Update Payment Method
                </Button>
              </div>
            ) : (
              <form onSubmit={handleAddCard} className="space-y-4 animate-in fade-in duration-300">
                <div className="space-y-1.5">
                  <Label className="text-xs">Cardholder Name</Label>
                  <Input
                    value={cardDetails.name}
                    onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                    placeholder="John Doe"
                    className="bg-[#F9FAFB] border-[#E5E7EB] h-9 text-xs"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Card Number</Label>
                  <Input
                    value={cardDetails.number}
                    onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                    placeholder="4111 2222 3333 4242"
                    className="bg-[#F9FAFB] border-[#E5E7EB] h-9 text-xs"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Expiry Date</Label>
                    <Input
                      value={cardDetails.expiry}
                      onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                      placeholder="MM/YY"
                      className="bg-[#F9FAFB] border-[#E5E7EB] h-9 text-xs"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">CVC</Label>
                    <Input
                      type="password"
                      value={cardDetails.cvc}
                      onChange={(e) => setCardDetails({ ...cardDetails, cvc: e.target.value })}
                      placeholder="•••"
                      className="bg-[#F9FAFB] border-[#E5E7EB] h-9 text-xs"
                      maxLength={4}
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    type="submit"
                    className="flex-1 bg-[#0F766E] text-white hover:bg-[#0D5B54] text-xs h-9"
                  >
                    Save Card
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowAddCard(false)}
                    className="flex-1 text-[#6B7280] text-xs h-9"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </Card>

          {/* Quick SLA Banner */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
            <h4 className="text-xs font-bold text-emerald-800 mb-1 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" /> Enterprise SLA Active
            </h4>
            <p className="text-[10px] text-emerald-700 leading-normal">
              Your contract guarantees 99.99% uptime, 24/7 priority support, and dedicated GPU computing tunnels. Contact account manager to adjust seats.
            </p>
          </div>

        </div>

        {/* Right: Invoices Table */}
        <div className="lg:col-span-8">
          <Card className="bg-white border-[#E5E7EB] shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[#F3F4F6] bg-gradient-to-r from-[#F9FAFB] to-white flex justify-between items-center">
              <h3 className="text-sm font-semibold text-[#1F2937]">Billing History & Invoices</h3>
              <span className="text-xxs text-[#9CA3AF] font-medium">Updated just now</span>
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-[#F3F4F6]">
                    <TableHead className="text-xs text-[#6B7280] py-3 pl-4">Invoice ID</TableHead>
                    <TableHead className="text-xs text-[#6B7280]">Billing Date</TableHead>
                    <TableHead className="text-xs text-[#6B7280]">Description</TableHead>
                    <TableHead className="text-xs text-[#6B7280]">Amount</TableHead>
                    <TableHead className="text-xs text-[#6B7280]">Status</TableHead>
                    <TableHead className="text-xs text-[#6B7280] text-right pr-4">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((inv) => (
                    <TableRow key={inv.id} className="border-b border-[#F9FAFB] hover:bg-[#F9FAFB]/50 transition-colors">
                      <TableCell className="text-sm font-mono font-semibold text-[#1F2937] py-3.5 pl-4">{inv.id}</TableCell>
                      <TableCell className="text-sm text-[#6B7280] py-3">{inv.date}</TableCell>
                      <TableCell className="text-sm text-[#1F2937] py-3">{inv.type}</TableCell>
                      <TableCell className="text-sm font-bold text-[#1F2937] py-3">{inv.amount}</TableCell>
                      <TableCell className="py-3">
                        <span className="px-2 py-0.5 bg-[#D1FAE5] text-[#059669] border border-[#A7F3D0] rounded-full text-xxs font-semibold">
                          {inv.status}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 pr-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadInvoice(inv.id)}
                          className="text-[#0F766E] hover:bg-[#CCFBF1] h-8 text-xs font-semibold"
                        >
                          <Download className="w-3.5 h-3.5 mr-1" />
                          Receipt
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
