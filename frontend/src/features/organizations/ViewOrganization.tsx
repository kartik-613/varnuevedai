import { useState, useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router";
import { useAppSelector } from "@/app/store";
import { Button, Card, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Tabs, TabsContent, TabsList, TabsTrigger, Input } from "@/shared/components";
import {
  ChevronRight,
  ArrowLeft,
  Building2,
  Users,
  HardDrive,
  Calendar,
  Activity,
  MessageSquare,
  Network,
  CreditCard,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  FileText,
  Clock,
  Settings
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  PieChart,
  Pie,
  Cell
} from "recharts";

export default function ViewOrganization() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("overview");

  const { organizations } = useAppSelector((state) => state.organizations);

  // Load live organization details from Redux
  const orgDetails = useMemo(() => {
    return (organizations || []).find((o) => o.id === id) || organizations?.[0];
  }, [organizations, id]);

  // Mock charts data
  const queriesData = useMemo(() => [
    { day: "Mon", count: 240 },
    { day: "Tue", count: 320 },
    { day: "Wed", count: 480 },
    { day: "Thu", count: 390 },
    { day: "Fri", count: 510 },
    { day: "Sat", count: 180 },
    { day: "Sun", count: 220 },
  ], []);

  const storageDistribution = useMemo(() => [
    { name: "PDFs", value: 340, color: "#0F766E" },
    { name: "CSVs/XLSX", value: 180, color: "#14B8A6" },
    { name: "TXT/MD", value: 90, color: "#ffbd59" },
    { name: "APIs/Data", value: 60, color: "#2DD4BF" },
  ], []);

  // Mock Users in this org
  const orgUsers = [
    { id: "101", name: "Alice Vance", email: "alice@acme.com", role: "Owner", joined: "2026-01-15", status: "Active" },
    { id: "102", name: "Bob Miller", email: "bob@acme.com", role: "Developer", joined: "2026-02-10", status: "Active" },
    { id: "103", name: "Charlie Green", email: "charlie@acme.com", role: "Member", joined: "2026-03-01", status: "Active" },
    { id: "104", name: "Diana Prince", email: "diana@acme.com", role: "Viewer", joined: "2026-04-18", status: "Suspended" },
  ];

  // Mock Query log
  const queryLogs = [
    { id: "q_1", user: "Alice Vance", query: "Summarize Q1 financial results", status: "Success", latency: "245ms", time: "10 mins ago" },
    { id: "q_2", user: "Bob Miller", query: "Search API reference for database config parameters", status: "Success", latency: "189ms", time: "25 mins ago" },
    { id: "q_3", user: "Charlie Green", query: "Compare invoice processing patterns", status: "Success", latency: "410ms", time: "1 hour ago" },
    { id: "q_4", user: "Bob Miller", query: "Analyze cluster index fragmentation limits", status: "Failed", latency: "1.2s", time: "2 hours ago" },
  ];

  // Mock Indexed Files
  const indexedFiles = [
    { name: "Q1_Financial_Report.pdf", size: "4.2 MB", source: "File Upload", date: "2026-05-20", status: "Indexed" },
    { name: "customer_leads_export.csv", size: "12.8 MB", source: "Cloud Storage", date: "2026-05-22", status: "Indexed" },
    { name: "api_endpoints_schema.json", size: "1.1 MB", source: "REST API", date: "2026-05-24", status: "Indexed" },
    { name: "internal_handbook.docx", size: "8.5 MB", source: "File Upload", date: "2026-05-25", status: "Processing" },
  ];

  // Mock Billing invoices
  const billingInvoices = [
    { id: "INV-9021", date: "2026-05-01", amount: "$499.00", status: "Paid" },
    { id: "INV-8742", date: "2026-04-01", amount: "$499.00", status: "Paid" },
    { id: "INV-8219", date: "2026-03-01", amount: "$499.00", status: "Paid" },
  ];

  return (
    <div className="w-full h-full">
      {/* Breadcrumbs */}
      <div className="mb-4 flex items-center gap-2 text-sm">
        <Link to="/admin" className="text-[#6B7280] hover:text-[#0F766E] transition-colors">
          Dashboard
        </Link>
        <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
        <Link to="/admin/organizations" className="text-[#6B7280] hover:text-[#0F766E] transition-colors">
          Organizations
        </Link>
        <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
        <span className="text-[#0F766E] font-medium">{orgDetails?.name}</span>
      </div>

      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate("/admin/organizations")}
        className="mb-4 text-[#6B7280] hover:text-[#0F766E] -ml-2"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Organizations
      </Button>

      {/* Profile Header Card */}
      <Card className="bg-white border-[#E5E7EB] p-6 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-[#0F766E] to-[#14B8A6] rounded-2xl flex items-center justify-center shadow-md">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-[#1F2937]">{orgDetails?.name}</h2>
                <span className="px-2.5 py-0.5 bg-[#EEF2FF] text-[#4F46E5] border border-[#C7D2FE] rounded-full text-xs font-medium">
                  {orgDetails?.plan}
                </span>
                <span className="px-2.5 py-0.5 bg-[#D1FAE5] text-[#059669] border border-[#A7F3D0] rounded-full text-xs font-medium">
                  {orgDetails?.status}
                </span>
              </div>
              <p className="text-sm text-[#6B7280] mt-0.5">ID: {orgDetails?.id} • Created on {orgDetails?.createdAt}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-stretch md:self-auto">
            <Button
              onClick={() => navigate(`/admin/organizations/${orgDetails?.id}/config`)}
              variant="outline"
              className="border-[#0F766E] text-[#0F766E] hover:bg-[#CCFBF1] flex-1 md:flex-none"
            >
              <Settings className="w-4 h-4 mr-2" />
              Configure RAG
            </Button>
            <Button
              onClick={() => navigate(`/admin/organizations/${orgDetails?.id}/edit`)}
              className="bg-gradient-to-r from-[#0F766E] to-[#14B8A6] hover:from-[#0D5B54] hover:to-[#0F766E] text-white flex-1 md:flex-none"
            >
              Edit Details
            </Button>
          </div>
        </div>

        {/* Quick Resource Bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-[#F3F4F6]">
          <div>
            <div className="flex justify-between items-center text-xs font-semibold text-[#6B7280] mb-2">
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-[#0D9488]" /> Users Enrolled</span>
              <span>{orgDetails?.currentUsers} / {orgDetails?.userLimit} Slots</span>
            </div>
            <div className="w-full h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#0D9488] to-[#14B8A6]"
                style={{ width: `${((orgDetails?.currentUsers || 0) / (orgDetails?.userLimit || 1)) * 100}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center text-xs font-semibold text-[#6B7280] mb-2">
              <span className="flex items-center gap-1.5"><HardDrive className="w-4 h-4 text-[#0F766E]" /> Active Disk Space</span>
              <span>{orgDetails?.currentStorage} GB / {orgDetails?.storageLimit} GB</span>
            </div>
            <div className="w-full h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#0F766E] to-[#0D9488]"
                style={{ width: `${((orgDetails?.currentStorage || 0) / (orgDetails?.storageLimit || 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs Menu */}
      <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="bg-white border border-[#E5E7EB] p-1 rounded-xl mb-6 flex overflow-x-auto">
          <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-[#0F766E] data-[state=active]:text-white">Overview</TabsTrigger>
          <TabsTrigger value="users" className="rounded-lg data-[state=active]:bg-[#0F766E] data-[state=active]:text-white">Users</TabsTrigger>
          <TabsTrigger value="queries" className="rounded-lg data-[state=active]:bg-[#0F766E] data-[state=active]:text-white">Queries</TabsTrigger>
          <TabsTrigger value="storage" className="rounded-lg data-[state=active]:bg-[#0F766E] data-[state=active]:text-white">Storage</TabsTrigger>
          <TabsTrigger value="connectors" className="rounded-lg data-[state=active]:bg-[#0F766E] data-[state=active]:text-white">Connectors</TabsTrigger>
          <TabsTrigger value="billing" className="rounded-lg data-[state=active]:bg-[#0F766E] data-[state=active]:text-white">Billing</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 bg-white border-[#E5E7EB] shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-[#6B7280] font-semibold">Queries Handled Today</span>
                <span className="w-8 h-8 rounded-lg bg-[#CCFBF1] flex items-center justify-center"><MessageSquare className="w-4 h-4 text-[#0F766E]" /></span>
              </div>
              <h3 className="text-2xl font-bold text-[#1F2937]">1,452</h3>
              <p className="text-xxs text-[#059669] font-medium mt-1">↑ 12% vs yesterday</p>
            </Card>
            <Card className="p-4 bg-white border-[#E5E7EB] shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-[#6B7280] font-semibold">Avg. System Response</span>
                <span className="w-8 h-8 rounded-lg bg-[#99F6E4] flex items-center justify-center"><Activity className="w-4 h-4 text-[#0D9488]" /></span>
              </div>
              <h3 className="text-2xl font-bold text-[#1F2937]">261ms</h3>
              <p className="text-xxs text-[#059669] font-medium mt-1">✓ Stable performance</p>
            </Card>
            <Card className="p-4 bg-white border-[#E5E7EB] shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-[#6B7280] font-semibold">Total Documents Synced</span>
                <span className="w-8 h-8 rounded-lg bg-[#CCFBF1] flex items-center justify-center"><FileText className="w-4 h-4 text-[#14B8A6]" /></span>
              </div>
              <h3 className="text-2xl font-bold text-[#1F2937]">4,812</h3>
              <p className="text-xxs text-[#6B7280] mt-1">Across 3 active pipelines</p>
            </Card>
            <Card className="p-4 bg-white border-[#E5E7EB] shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-[#6B7280] font-semibold">RAG Pipeline Health</span>
                <span className="w-8 h-8 rounded-lg bg-[#D1FAE5] flex items-center justify-center"><CheckCircle className="w-4 h-4 text-[#059669]" /></span>
              </div>
              <h3 className="text-2xl font-bold text-[#1F2937]">99.98%</h3>
              <p className="text-xxs text-[#059669] font-medium mt-1">All indexes synchronized</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="p-5 bg-white border-[#E5E7EB] shadow-sm lg:col-span-2">
              <h3 className="text-sm font-semibold text-[#1F2937] mb-4">Query History (Last 7 Days)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={queriesData}>
                    <defs>
                      <linearGradient id="colorQueries" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0F766E" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#0F766E" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" stroke="#9CA3AF" fontSize={11} />
                    <YAxis stroke="#9CA3AF" fontSize={11} />
                    <RechartsTooltip />
                    <Area type="monotone" dataKey="count" stroke="#0F766E" strokeWidth={2.5} fillOpacity={1} fill="url(#colorQueries)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-5 bg-white border-[#E5E7EB] shadow-sm">
              <h3 className="text-sm font-semibold text-[#1F2937] mb-4">Activity Timeline</h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-1.5 shrink-0"></div>
                  <div>
                    <p className="text-xs font-semibold text-[#1F2937]">Database connection synced</p>
                    <p className="text-xxs text-[#9CA3AF]">15 mins ago • Sync completed</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Other tabs keep standard rosters */}
        <TabsContent value="users">
          <Card className="bg-white border-[#E5E7EB] shadow-sm overflow-hidden">
            <div className="p-5 border-b border-[#F3F4F6] flex justify-between items-center">
              <h3 className="text-sm font-semibold text-[#1F2937]">Assigned Users List</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Name</TableHead>
                  <TableHead className="text-xs">Email</TableHead>
                  <TableHead className="text-xs">Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orgUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="text-sm font-semibold py-3">{user.name}</TableCell>
                    <TableCell className="text-sm text-[#6B7280] py-3">{user.email}</TableCell>
                    <TableCell className="text-sm text-[#1F2937] py-3">{user.role}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Other tabs like queries, storage, connectors, billing remain the same */}
        <TabsContent value="billing">
          <Card className="bg-white border-[#E5E7EB] p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-[#1F2937] mb-4">Invoice Billing History</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Invoice ID</TableHead>
                  <TableHead className="text-xs">Billing Date</TableHead>
                  <TableHead className="text-xs">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {billingInvoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="text-sm font-mono font-semibold py-3">{inv.id}</TableCell>
                    <TableCell className="text-sm text-[#6B7280] py-3">{inv.date}</TableCell>
                    <TableCell className="text-sm font-semibold py-3">{inv.amount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
