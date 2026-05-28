import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAppSelector, useAppDispatch } from "@/app/store";
import { deleteOrganization, fetchOrganizations } from "./store/organizationsSlice";
import { Button, Card, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components";
import { Building2, Search, Plus, Eye, Pencil, Settings as SettingsIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function Organizations() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { organizations } = useAppSelector((state) => state.organizations);

  useEffect(() => {
    dispatch(fetchOrganizations());
  }, [dispatch]);

  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const getStatusBadge = (status: string) => {
    const styles = {
      active: "bg-[#D1FAE5] text-[#059669] border-[#A7F3D0]",
      expired: "bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]",
      pending: "bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]",
    };
    return styles[status as keyof typeof styles] || styles.active;
  };

  const getPlanBadge = (plan: string) => {
    const styles = {
      Enterprise: "bg-[#EEF2FF] text-[#4F46E5] border-[#C7D2FE]",
      Professional: "bg-[#CCFBF1] text-[#0F766E] border-[#99F6E4]",
      Starter: "bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB]",
    };
    return styles[plan as keyof typeof styles] || styles.Starter;
  };

  // Filtered organizations
  const filteredOrgs = useMemo(() => {
    return (organizations || []).filter((org) => {
      const matchesSearch = org.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false;
      const matchesPlan = planFilter === "all" || org.plan?.toLowerCase() === planFilter.toLowerCase();
      const matchesStatus = statusFilter === "all" || org.status?.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesPlan && matchesStatus;
    });
  }, [organizations, searchTerm, planFilter, statusFilter]);

  const handleDelete = (id: string) => {
    dispatch(deleteOrganization(id));
    toast.success("Organization deleted successfully!");
  };

  return (
    <div className="w-full h-full">
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-[#1F2937] mb-1">Organizations</h2>
        <p className="text-sm text-[#6B7280]">Manage enterprise organizations and their configurations</p>
      </div>

      {/* Action Bar */}
      <Card className="bg-white border-[#E5E7EB] p-4 mb-4 shadow-sm">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <Input
                type="search"
                placeholder="Search organizations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 bg-[#F9FAFB] border-[#E5E7EB] rounded-lg"
              />
            </div>
          </div>

          {/* Plan Filter */}
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="h-10 px-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-sm text-[#374151] focus:border-[#0F766E] focus:ring-[#0F766E]/20"
          >
            <option value="all">All Plans</option>
            <option value="enterprise">Enterprise</option>
            <option value="professional">Professional</option>
            <option value="starter">Starter</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-sm text-[#374151] focus:border-[#0F766E] focus:ring-[#0F766E]/20"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="pending">Pending</option>
          </select>

          {/* Create Organization Button */}
          <Button
            onClick={() => navigate("/admin/organizations/create")}
            className="bg-gradient-to-r from-[#0F766E] to-[#14B8A6] hover:from-[#0D5B54] hover:to-[#0F766E] text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Organization
          </Button>
        </div>
      </Card>

      {/* Organizations Table */}
      <Card className="bg-white border-[#E5E7EB] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#F3F4F6]">
                <TableHead className="text-[#6B7280] text-xs font-medium min-w-[200px]">Organization</TableHead>
                <TableHead className="text-[#6B7280] text-xs font-medium min-w-[120px]">Plan</TableHead>
                <TableHead className="text-[#6B7280] text-xs font-medium min-w-[100px]">Users</TableHead>
                <TableHead className="text-[#6B7280] text-xs font-medium min-w-[120px]">Expiry</TableHead>
                <TableHead className="text-[#6B7280] text-xs font-medium min-w-[100px]">Status</TableHead>
                <TableHead className="text-[#6B7280] text-xs font-medium min-w-[200px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrgs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-[#6B7280]">
                    No organizations found
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrgs.map((org) => (
                  <TableRow key={org.id} className="border-b border-[#F9FAFB] hover:bg-[#F9FAFB]/50 transition-colors">
                    <TableCell className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#0F766E] to-[#14B8A6] rounded-lg flex items-center justify-center shadow-sm">
                          <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-[#1F2937] text-sm">{org.name}</p>
                          <p className="text-xs text-[#9CA3AF]">ID: {org.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getPlanBadge(org.plan)}`}>
                        {org.plan}
                      </span>
                    </TableCell>
                    <TableCell className="text-[#6B7280] text-sm py-3">{org.users}</TableCell>
                    <TableCell className="text-[#6B7280] text-sm py-3">{org.expiry}</TableCell>
                    <TableCell className="py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadge(org.status)}`}>
                        {org.status.charAt(0).toUpperCase() + org.status.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/admin/organizations/${org.id}`)}
                          className="text-[#6B7280] hover:text-[#0F766E] hover:bg-[#CCFBF1]"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/admin/organizations/${org.id}/edit`)}
                          className="text-[#6B7280] hover:text-[#0F766E] hover:bg-[#CCFBF1]"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(org.id)}
                          className="text-[#DC2626] hover:text-[#B91C1C] hover:bg-[#FEE2E2]"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
