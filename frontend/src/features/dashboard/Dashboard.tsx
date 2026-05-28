import { useMemo, useState, useEffect } from "react";
import { useAppSelector } from "@/app/store";
import { apiClient } from "@/shared/api/apiClient";
import { Card, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components";
import { Users as UsersIcon, MessageSquare, LayoutDashboard, FileText, Building2, HardDrive } from "lucide-react";
import { QueryTrendChart } from "./components/QueryTrendChart";
import { UsageChart } from "./components/UsageChart";
import { StorageChart } from "./components/StorageChart";

export default function Dashboard() {
  const { organizations } = useAppSelector((state) => state.organizations);
  const { users } = useAppSelector((state) => state.users);
  const [loading, setLoading] = useState(true);
  const [totalOrganizations, setTotalOrganizations] = useState<number | null>(null);
  const [totalQueriesAsked, setTotalQueriesAsked] = useState<number | null>(null);
  const [totalActiveUsers, setTotalActiveUsers] = useState<number | null>(null);
  const [totalDashboardsConfigured, setTotalDashboardsConfigured] = useState<number | null>(null);
  const [totalReportsGenerated, setTotalReportsGenerated] = useState<number | null>(null);
  const [queryTrendData, setQueryTrendData] = useState<{ id: string; month: string; queries: number }[]>([]);
  const [orgSummary, setOrgSummary] = useState<{ id: number; name: string; userCount: number; queryCount: number }[]>([]);
  const [orgSummaryLoading, setOrgSummaryLoading] = useState(true);

  // Fetch live stats from API
  useEffect(() => {
    let active = true;
    apiClient.get("/dashboard/stats")
      .then((response: any) => {
        if (active && response && response.success) {
          setTotalOrganizations(response.data.totalOrganizations);
          setTotalQueriesAsked(response.data.totalQueries);
          setTotalActiveUsers(response.data.totalActiveUsers);
          setTotalDashboardsConfigured(response.data.totalDashboards);
          setTotalReportsGenerated(response.data.totalReports);
          if (Array.isArray(response.data.queryTrend)) {
            setQueryTrendData(response.data.queryTrend);
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch dashboard stats:", err);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // Fetch organization summary (name + user count + query count)
  useEffect(() => {
    let active = true;
    apiClient.get("/dashboard/org-summary")
      .then((response: any) => {
        if (active && response && response.success && Array.isArray(response.data)) {
          setOrgSummary(response.data);
        }
        if (active) setOrgSummaryLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch org summary:", err);
        if (active) setOrgSummaryLoading(false);
      });
    return () => { active = false; };
  }, []);

  // Compute live KPIs from Redux/API
  const totalOrgs = totalOrganizations !== null ? totalOrganizations : organizations.length;
  const totalUsersCount = totalActiveUsers !== null ? totalActiveUsers : users.length;
  const totalStorage = organizations.reduce((acc, org) => acc + (org.currentStorage || 0), 0);
  const formattedStorage = totalStorage >= 1000 ? `${(totalStorage / 1000).toFixed(1)} TB` : `${totalStorage} GB`;

  const kpis = [
    {
      title: "Total Organizations",
      value: loading ? "..." : String(totalOrgs),
      icon: Building2,
      bgLight: "bg-[#CCFBF1]",
      color: "#0F766E",
    },
    {
      title: "Active Users",
      value: loading ? "..." : String(totalUsersCount),
      icon: UsersIcon,
      bgLight: "bg-[#99F6E4]",
      color: "#0D9488",
    },
    {
      title: "Queries Asked",
      value: loading ? "..." : (totalQueriesAsked !== null ? totalQueriesAsked.toLocaleString() : "0"),
      icon: MessageSquare,
      bgLight: "bg-[#A7F3D0]",
      color: "#14B8A6",
    },
    {
      title: "Dashboards Configured",
      value: loading ? "..." : (totalDashboardsConfigured !== null ? String(totalDashboardsConfigured) : "0"),
      icon: LayoutDashboard,
      bgLight: "bg-[#99F6E4]",
      color: "#2DD4BF",
    },
    {
      title: "Reports Generated",
      value: loading ? "..." : (totalReportsGenerated !== null ? String(totalReportsGenerated) : "0"),
      icon: FileText,
      bgLight: "bg-[#CCFBF1]",
      color: "#0F766E",
    },
    {
      title: "Storage Consumption",
      value: formattedStorage,
      icon: HardDrive,
      bgLight: "bg-[#99F6E4]",
      color: "#0D9488",
    },
  ];



  const usageData = useMemo(() => [
    { id: "u1", month: "Jan", usage: 65 },
    { id: "u2", month: "Feb", usage: 70 },
    { id: "u3", month: "Mar", usage: 75 },
    { id: "u4", month: "Apr", usage: 78 },
    { id: "u5", month: "May", usage: 82 },
  ], []);

  // Compute storage chart data dynamically from Redux
  const storageData = useMemo(() => {
    return organizations.map(org => ({
      id: `s-${org.id}`,
      org: org.name.split(" ")[0],
      storage: org.currentStorage || 0,
    }));
  }, [organizations]);

  const recentRequests = [
    { id: "1", organization: "Acme Corporation", type: "Storage Increase", amount: "+500 GB", date: "2026-05-25", status: "pending" },
    { id: "2", organization: "TechStart Inc", type: "User Limit", amount: "+50 users", date: "2026-05-24", status: "pending" },
    { id: "3", organization: "Global Solutions", type: "API Access", amount: "Premium", date: "2026-05-23", status: "approved" },
  ];

  // organizationSummary comes from live API (orgSummary state)

  return (
    <div className="w-full h-full">
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-[#1F2937] mb-1">Dashboard Overview</h2>
        <p className="text-sm text-[#6B7280]">Monitor your enterprise AI platform performance and usage</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          const isGray = kpi.title === "Storage Consumption";
          return (
            <Card
              key={`kpi-${index}-${kpi.title}`}
              className={`bg-white border-[#E5E7EB] p-4 shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer${isGray ? " grayscale opacity-50 pointer-events-none select-none" : ""}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-12 h-12 ${kpi.bgLight} rounded-lg flex items-center justify-center shadow-sm`}>
                  <Icon className="w-6 h-6" style={{ color: kpi.color }} />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#1F2937] mb-1">{kpi.value}</h3>
                <p className="text-xs text-[#6B7280] font-medium">{kpi.title}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="bg-white border-[#E5E7EB] p-5 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-sm font-semibold text-[#1F2937] mb-4">Query Trend</h3>
          {loading ? (
            <div className="h-[200px] flex items-center justify-center text-sm text-[#9CA3AF] animate-pulse">
              Loading trend...
            </div>
          ) : (
            <QueryTrendChart data={queryTrendData} />
          )}
        </Card>

        {/* Usage (%) — grayscale */}
        <Card className="bg-white border-[#E5E7EB] p-5 shadow-sm grayscale opacity-50 pointer-events-none select-none">
          <h3 className="text-sm font-semibold text-[#1F2937] mb-4">Usage (%)</h3>
          <UsageChart data={usageData} />
        </Card>

        {/* Storage (GB) — grayscale */}
        <Card className="bg-white border-[#E5E7EB] p-5 shadow-sm grayscale opacity-50 pointer-events-none select-none">
          <h3 className="text-sm font-semibold text-[#1F2937] mb-4">Storage (GB)</h3>
          <StorageChart data={storageData} />
        </Card>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Requests — grayscale */}
        <Card className="bg-white border-[#E5E7EB] shadow-sm grayscale opacity-50 pointer-events-none select-none">
          <div className="px-5 py-3 border-b border-[#E5E7EB] bg-gradient-to-r from-[#F9FAFB] to-white">
            <h3 className="text-sm font-semibold text-[#1F2937]">Recent Requests</h3>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-[#F3F4F6]">
                  <TableHead className="text-[#6B7280] text-xs font-medium">Organization</TableHead>
                  <TableHead className="text-[#6B7280] text-xs font-medium">Type</TableHead>
                  <TableHead className="text-[#6B7280] text-xs font-medium">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentRequests.map((request) => (
                  <TableRow key={request.id} className="border-b border-[#F9FAFB] hover:bg-[#F9FAFB]/50 transition-colors">
                    <TableCell className="font-medium text-[#1F2937] text-sm py-3">{request.organization}</TableCell>
                    <TableCell className="text-[#6B7280] text-sm py-3">{request.type}</TableCell>
                    <TableCell className="py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        request.status === "pending" ? "bg-[#FEF3C7] text-[#D97706]" : "bg-[#D1FAE5] text-[#059669]"
                      }`}>
                        {request.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        <Card className="bg-white border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow">
          <div className="px-5 py-3 border-b border-[#E5E7EB] bg-gradient-to-r from-[#F9FAFB] to-white">
            <h3 className="text-sm font-semibold text-[#1F2937]">Organization Summary</h3>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-[#F3F4F6]">
                  <TableHead className="text-[#6B7280] text-xs font-medium">Organization</TableHead>
                  <TableHead className="text-[#6B7280] text-xs font-medium">Users</TableHead>
                  <TableHead className="text-[#6B7280] text-xs font-medium">Queries</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orgSummaryLoading ? (
                  [1, 2, 3].map((i) => (
                    <TableRow key={`skel-${i}`} className="border-b border-[#F9FAFB]">
                      <TableCell className="py-3"><div className="h-4 w-36 bg-[#F3F4F6] rounded animate-pulse" /></TableCell>
                      <TableCell className="py-3"><div className="h-4 w-10 bg-[#F3F4F6] rounded animate-pulse" /></TableCell>
                      <TableCell className="py-3"><div className="h-4 w-14 bg-[#F3F4F6] rounded animate-pulse" /></TableCell>
                    </TableRow>
                  ))
                ) : orgSummary.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-sm text-[#9CA3AF] py-6">No organizations found</TableCell>
                  </TableRow>
                ) : (
                  orgSummary.map((org) => (
                    <TableRow key={org.id} className="border-b border-[#F9FAFB] hover:bg-[#F9FAFB]/50 transition-colors">
                      <TableCell className="font-medium text-[#1F2937] text-sm py-3">{org.name}</TableCell>
                      <TableCell className="text-[#6B7280] text-sm py-3">{org.userCount.toLocaleString()}</TableCell>
                      <TableCell className="text-[#0F766E] font-semibold text-sm py-3">{org.queryCount.toLocaleString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

    </div>
  );
}
