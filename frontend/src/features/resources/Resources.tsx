import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAppSelector, useAppDispatch } from "@/app/store";
import { fetchResources, deleteResource, Resource } from "./store/resourcesSlice";
import { Button, Card, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components";
import { Trash2, Pencil, Search, Filter, HardDrive, ShieldCheck, Plus } from "lucide-react";
import { toast } from "sonner";

export default function Resources() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { resources, loading, error } = useAppSelector((state) => state.resources);

  useEffect(() => {
    dispatch(fetchResources());
  }, [dispatch]);

  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [orgFilter, setOrgFilter] = useState("all");

  // Dynamic list of unique organization names for filtering
  const organizations = useMemo(() => {
    const orgs = new Set<string>();
    resources.forEach((r) => {
      if (r.organisationName) {
        orgs.add(r.organisationName);
      }
    });
    return Array.from(orgs).sort();
  }, [resources]);

  const getPlanBadge = (plan: string) => {
    const styles = {
      Enterprise: "bg-purple-50 text-purple-700 border-purple-200",
      Professional: "bg-teal-50 text-teal-700 border-teal-200",
      Starter: "bg-gray-50 text-gray-600 border-gray-200",
    };
    return styles[plan as keyof typeof styles] || "bg-gray-50 text-gray-600 border-gray-200";
  };

  // Filtered resources
  const filteredResources = useMemo(() => {
    return resources.filter((r) => {
      const matchesSearch =
        r.organisationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.subscriptionPlan.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPlan =
        planFilter === "all" || r.subscriptionPlan.toLowerCase() === planFilter.toLowerCase();

      const matchesOrg =
        orgFilter === "all" || r.organisationName.toLowerCase() === orgFilter.toLowerCase();

      return matchesSearch && matchesPlan && matchesOrg;
    });
  }, [resources, searchTerm, planFilter, orgFilter]);

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to remove this resource allocation?")) {
      dispatch(deleteResource(id))
        .unwrap()
        .then(() => {
          toast.success("Resource allocation deleted successfully");
        })
        .catch((err) => {
          toast.error(err || "Failed to delete resource allocation");
        });
    }
  };

  return (
    <div className="w-full h-full">
      {/* Page Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-[#1F2937] mb-1">Resource Allocations</h2>
          <p className="text-sm text-[#6B7280]">
            Manage enterprise storage quotas, subscription plans, active user counts, and expiration dates.
          </p>
        </div>

        <Button
          onClick={() => navigate("/admin/resources/add")}
          className="bg-gradient-to-r from-[#0F766E] to-[#14B8A6] hover:from-[#0D5B54] hover:to-[#0F766E] text-white flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Allocate Resources
        </Button>
      </div>

      {/* Filter Card */}
      <Card className="bg-white border-[#E5E7EB] p-4 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <Input
                type="search"
                placeholder="Search allocations by organization or plan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 bg-[#F9FAFB] border-[#E5E7EB] rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#9CA3AF]" />
              <select
                value={orgFilter}
                onChange={(e) => setOrgFilter(e.target.value)}
                className="h-10 px-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-sm text-[#374151] focus:border-[#0F766E]"
              >
                <option value="all">All Organizations</option>
                {organizations.map((org) => (
                  <option key={org} value={org.toLowerCase()}>
                    {org}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="h-10 px-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-sm text-[#374151] focus:border-[#0F766E]"
            >
              <option value="all">All Plans</option>
              <option value="enterprise">Enterprise</option>
              <option value="professional">Professional</option>
              <option value="starter">Starter</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Main Table */}
      <Card className="bg-white border-[#E5E7EB] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#F3F4F6]">
                <TableHead className="text-[#6B7280] text-xs font-semibold min-w-[200px]">Organization</TableHead>
                <TableHead className="text-[#6B7280] text-xs font-semibold min-w-[120px]">Subscription Plan</TableHead>
                <TableHead className="text-[#6B7280] text-xs font-semibold min-w-[120px]">Storage Quota</TableHead>
                <TableHead className="text-[#6B7280] text-xs font-semibold min-w-[100px]">User Limit</TableHead>
                <TableHead className="text-[#6B7280] text-xs font-semibold min-w-[180px]">Access Window</TableHead>
                <TableHead className="text-[#6B7280] text-xs font-semibold min-w-[100px] text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-[#6B7280]">
                    <div className="flex flex-col items-center gap-2 justify-center">
                      <div className="w-8 h-8 border-4 border-[#0F766E] border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-sm">Loading allocations...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-red-500 font-medium">
                    Error loading resources: {error}
                  </TableCell>
                </TableRow>
              ) : filteredResources.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-[#6B7280]">
                    <HardDrive className="w-10 h-10 text-[#9CA3AF] mx-auto mb-2" />
                    No resource allocations found
                  </TableCell>
                </TableRow>
              ) : (
                filteredResources.map((res) => (
                  <TableRow key={res.id} className="border-b border-[#F9FAFB] hover:bg-[#F9FAFB]/50 transition-colors">
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-[#0F766E] to-[#14B8A6] rounded-lg flex items-center justify-center shadow-sm">
                          <ShieldCheck className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-[#1F2937] text-sm leading-tight">
                            {res.organisationName}
                          </p>
                          <p className="text-xs text-[#9CA3AF] leading-tight">ID: {res.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getPlanBadge(res.subscriptionPlan)}`}>
                        {res.subscriptionPlan}
                      </span>
                    </TableCell>
                    <TableCell className="text-[#1F2937] text-sm font-semibold py-4">
                      {res.storageLimitGB}
                    </TableCell>
                    <TableCell className="text-[#374151] text-sm py-4">
                      {res.userLimit} Users
                    </TableCell>
                    <TableCell className="text-[#6B7280] text-xs py-4">
                      <span className="font-medium text-[#374151]">{res.accessStart}</span>
                      <span className="mx-1 text-[#9CA3AF]">to</span>
                      <span className="font-medium text-[#374151]">{res.accessEnd}</span>
                    </TableCell>
                    <TableCell className="py-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/admin/resources/edit/${res.id}`)}
                          className="text-[#0F766E] hover:text-[#0D5B54] hover:bg-[#CCFBF1] h-8 w-8 p-0"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(res.id)}
                          className="text-[#DC2626] hover:text-[#B91C1C] hover:bg-[#FEE2E2] h-8 w-8 p-0"
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
