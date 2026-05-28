import { Button, Card, Input, Label, Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components";

import { useState } from "react";
import { Check, X, Eye, FileCheck, HelpCircle, AlertCircle, Clock } from "lucide-react";
import { toast } from "sonner";

interface RequestItem {
  id: string;
  organization: string;
  type: string;
  amount: string;
  date: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "approved" | "rejected";
  requester: string;
  reason: string;
}

export default function Requests() {
  const [requests, setRequests] = useState<RequestItem[]>([
    {
      id: "REQ-001",
      organization: "Acme Corporation",
      type: "Storage Increase",
      amount: "+500 GB",
      date: "2026-05-25",
      priority: "high",
      status: "pending",
      requester: "John Doe (IT Director)",
      reason: "We are onboarding a new marketing ingestion feed that uploads 50GB of visual documents daily. Need additional RAG memory disk space immediately."
    },
    {
      id: "REQ-002",
      organization: "TechStart Inc",
      type: "User Limit",
      amount: "+50 users",
      date: "2026-05-24",
      priority: "medium",
      status: "pending",
      requester: "Sarah Connor (HR Manager)",
      reason: "Adding the sales department to our custom LLM prompt system. Need to increase active user seating limits."
    },
    {
      id: "REQ-003",
      organization: "Global Solutions",
      type: "API Access Increase",
      amount: "Premium Tier",
      date: "2026-05-23",
      priority: "medium",
      status: "approved",
      requester: "Bruce Wayne (CTO)",
      reason: "Need premium rate limits for custom ERP CRM data integrations."
    }
  ]);

  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(null);
  const [adminComment, setAdminComment] = useState("");

  const handleAction = (id: string, action: "approved" | "rejected") => {
    setRequests(prev =>
      prev.map(req => (req.id === id ? { ...req, status: action } : req))
    );
    toast.success(`Request ${id} has been ${action}.`);
    setSelectedRequest(null);
    setAdminComment("");
  };

  const getPriorityBadge = (priority: string) => {
    const styles = {
      high: "bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]",
      medium: "bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]",
      low: "bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB]"
    };
    return styles[priority as keyof typeof styles] || styles.low;
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]",
      approved: "bg-[#D1FAE5] text-[#059669] border-[#A7F3D0]",
      rejected: "bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]"
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  return (
    <div className="w-full h-full">
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-[#1F2937] mb-1">Requests Approval Workflow</h2>
        <p className="text-sm text-[#6B7280]">Govern resource requests, storage limits, and license tier escalations</p>
      </div>

      {/* Requests Table Card */}
      <Card className="bg-white border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#F3F4F6]">
                <TableHead className="text-[#6B7280] text-xs font-semibold py-3 pl-4">Request ID</TableHead>
                <TableHead className="text-[#6B7280] text-xs font-semibold">Organization</TableHead>
                <TableHead className="text-[#6B7280] text-xs font-semibold">Request Type</TableHead>
                <TableHead className="text-[#6B7280] text-xs font-semibold">Amount</TableHead>
                <TableHead className="text-[#6B7280] text-xs font-semibold">Date</TableHead>
                <TableHead className="text-[#6B7280] text-xs font-semibold">Priority</TableHead>
                <TableHead className="text-[#6B7280] text-xs font-semibold">Status</TableHead>
                <TableHead className="text-[#6B7280] text-xs font-semibold text-right pr-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id} className="border-b border-[#F9FAFB] hover:bg-[#F9FAFB]/50 transition-colors">
                  <TableCell className="font-semibold text-xs text-[#0F766E] font-mono py-3.5 pl-4">{request.id}</TableCell>
                  <TableCell className="font-semibold text-[#1F2937] text-sm py-3">{request.organization}</TableCell>
                  <TableCell className="text-[#6B7280] text-sm py-3">{request.type}</TableCell>
                  <TableCell className="font-bold text-[#0F766E] text-sm py-3">{request.amount}</TableCell>
                  <TableCell className="text-[#6B7280] text-sm py-3">{request.date}</TableCell>
                  <TableCell className="py-3">
                    <span className={`px-2 py-0.5 border rounded-full text-xxs font-semibold ${getPriorityBadge(request.priority)}`}>
                      {request.priority}
                    </span>
                  </TableCell>
                  <TableCell className="py-3">
                    <span className={`px-2.5 py-0.5 border rounded-full text-xxs font-semibold ${getStatusBadge(request.status)}`}>
                      {request.status}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 pr-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedRequest(request);
                          setAdminComment("");
                        }}
                        className="text-[#0F766E] hover:bg-[#CCFBF1] h-8 text-xs font-semibold"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        Details
                      </Button>
                      
                      {request.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleAction(request.id, "approved")}
                            className="bg-[#059669] hover:bg-[#047857] text-white h-8 text-xs font-semibold"
                          >
                            <Check className="w-3.5 h-3.5 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAction(request.id, "rejected")}
                            className="border-[#DC2626] text-[#DC2626] hover:bg-[#FEE2E2] h-8 text-xs font-semibold"
                          >
                            <X className="w-3.5 h-3.5 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Expandable details drawer */}
      <Sheet open={selectedRequest !== null} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        {selectedRequest && (
          <SheetContent className="w-[400px] sm:w-[540px] bg-white border-l border-[#E5E7EB] p-6 overflow-y-auto">
            <SheetHeader className="border-b border-[#F3F4F6] pb-4 mb-5">
              <SheetTitle className="text-lg font-bold text-[#1F2937] flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-[#0F766E]" />
                Request Details — {selectedRequest.id}
              </SheetTitle>
              <SheetDescription className="text-xs text-[#6B7280]">
                Review limits request from {selectedRequest.organization}
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-6">
              {/* Basic Info Panel */}
              <div className="grid grid-cols-2 gap-4 bg-[#F9FAFB] p-4 rounded-xl border border-[#E5E7EB]">
                <div>
                  <span className="text-[10px] text-[#9CA3AF] uppercase font-bold block mb-0.5">Organization</span>
                  <span className="text-sm font-semibold text-[#1F2937]">{selectedRequest.organization}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#9CA3AF] uppercase font-bold block mb-0.5">Requester</span>
                  <span className="text-sm font-semibold text-[#1F2937]">{selectedRequest.requester}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#9CA3AF] uppercase font-bold block mb-0.5">Request Type</span>
                  <span className="text-sm font-semibold text-[#1F2937]">{selectedRequest.type}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#9CA3AF] uppercase font-bold block mb-0.5">Requested Amount</span>
                  <span className="text-sm font-bold text-[#0F766E]">{selectedRequest.amount}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#9CA3AF] uppercase font-bold block mb-0.5">Submission Date</span>
                  <span className="text-xs font-semibold text-[#6B7280]">{selectedRequest.date}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#9CA3AF] uppercase font-bold block mb-0.5">Priority Level</span>
                  <span className={`inline-block px-2 py-0.25 border rounded-full text-[10px] font-semibold ${getPriorityBadge(selectedRequest.priority)}`}>
                    {selectedRequest.priority}
                  </span>
                </div>
              </div>

              {/* Justification Text */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-[#1F2937] block">Business Justification Note</span>
                <div className="p-4 bg-white border border-[#E5E7EB] rounded-xl text-xs text-[#6B7280] leading-relaxed shadow-inner">
                  {selectedRequest.reason}
                </div>
              </div>

              {/* Status Alert */}
              <div className="p-4 rounded-xl border flex gap-3 items-start bg-blue-50 border-blue-200">
                <Clock className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-blue-800">Review Guidelines</h4>
                  <p className="text-[11px] text-blue-700 leading-normal mt-0.5">
                    Before approving storage limits, verify that the organization's tier has matching payment credits. User upgrades are billed prorated.
                  </p>
                </div>
              </div>

              {/* Action State / Text Area */}
              {selectedRequest.status === "pending" ? (
                <div className="space-y-4 pt-4 border-t border-[#F3F4F6]">
                  <div className="space-y-1.5">
                    <Label htmlFor="adminComment" className="text-xs font-bold">Administrator Review Comment (Optional)</Label>
                    <textarea
                      id="adminComment"
                      value={adminComment}
                      onChange={(e) => setAdminComment(e.target.value)}
                      placeholder="Add an internal log note or feedback for the client..."
                      className="w-full h-24 p-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-xs resize-none"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleAction(selectedRequest.id, "approved")}
                      className="flex-1 bg-[#059669] hover:bg-[#047857] text-white font-semibold"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Approve Request
                    </Button>
                    <Button
                      onClick={() => handleAction(selectedRequest.id, "rejected")}
                      variant="outline"
                      className="flex-1 border-[#DC2626] text-[#DC2626] hover:bg-[#FEE2E2] font-semibold"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Reject Request
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="pt-4 border-t border-[#F3F4F6] text-center">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F3F4F6] border border-[#E5E7EB] rounded-full text-xs font-semibold text-[#6B7280]">
                    This request has been marked as <span className="underline font-bold capitalize">{selectedRequest.status}</span>
                  </div>
                </div>
              )}

            </div>
          </SheetContent>
        )}
      </Sheet>
    </div>
  );
}
