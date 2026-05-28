import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { useAppSelector, useAppDispatch } from "@/app/store";
import { updateOrganizationConfig } from "./store/organizationsSlice";
import { Button, Card, Input, Label, Slider, Calendar, Popover, PopoverContent, PopoverTrigger } from "@/shared/components";
import { format } from "date-fns";
import {
  ChevronLeft,
  Database,
  Cloud,
  Globe,
  HardDrive,
  Upload,
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
  Server,
  Settings as SettingsIcon,
  Sliders,
  CalendarDays,
  FileText,
  Sparkles,
  ToggleLeft
} from "lucide-react";
import { toast } from "sonner";

interface ConnectorConfig {
  enabled: boolean;
  status: "connected" | "failed" | "pending" | "disabled";
  lastTested?: string;
}

interface DatabaseConfig extends ConnectorConfig {
  dbType: string;
  host: string;
  port: string;
  dbName: string;
  username: string;
  password: string;
  ssl: boolean;
  timeout: string;
}

interface CloudConfig extends ConnectorConfig {
  provider: string;
  accessKey: string;
  secretKey: string;
  bucket: string;
  region: string;
}

interface ApiConfig extends ConnectorConfig {
  baseUrl: string;
  apiKey: string;
  authType: string;
  headers: string;
  rateLimit: string;
}

interface FileUploadConfig extends ConnectorConfig {
  allowedTypes: string[];
  maxUploadSize: number;
  autoIndexing: boolean;
  storageLimit: number;
}

interface OrgConfigProps {
  defaultTab?: "general" | "limits" | "access" | "features" | "connectors";
}

export default function OrganizationConfig({ defaultTab = "connectors" }: OrgConfigProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { id } = useParams();

  const { organizations } = useAppSelector((state) => state.organizations);

  const [activeSection, setActiveSection] = useState<string>(defaultTab);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("Connection test successful!");

  // Find organization from Redux
  const org = useMemo(() => {
    return (organizations || []).find((o) => o.id === id) || organizations?.[0];
  }, [organizations, id]);

  // --- GENERAL INFO STATE ---
  const [generalInfo, setGeneralInfo] = useState({
    name: "",
    email: "",
    contactPerson: "",
    plan: "enterprise",
    status: "active"
  });

  // --- RESOURCE LIMITS STATE ---
  const [resourceLimits, setResourceLimits] = useState({
    userLimit: 250,
    storageLimit: 500, // GB
    queryLimit: 10000,
    tokenAllocation: 50,
  });

  // --- ACCESS PERIOD STATE ---
  const [accessPeriod, setAccessPeriod] = useState({
    accessFrom: new Date(),
    accessTo: new Date(),
  });

  // Load from Redux
  useEffect(() => {
    if (org) {
      setGeneralInfo({
        name: org.name,
        email: org.email || "admin@acme.com",
        contactPerson: org.contactPerson || "John Doe",
        plan: org.plan.toLowerCase(),
        status: org.status
      });
      setResourceLimits({
        userLimit: org.userLimit || 250,
        storageLimit: org.storageLimit || 500,
        queryLimit: 10000,
        tokenAllocation: 50
      });
    }
  }, [org]);

  // --- FEATURE TOGGLES STATE ---
  const [featureToggles, setFeatureToggles] = useState({
    autoIndexing: true,
    sslEnforced: true,
    ocrProcessing: true,
    translationPipeline: false,
    smartRouting: true,
    customPrompting: true
  });

  // --- CONNECTORS STATE ---
  const [databaseConfig, setDatabaseConfig] = useState<DatabaseConfig>({
    enabled: true,
    status: "connected",
    dbType: "postgresql",
    host: "db.example.com",
    port: "5432",
    dbName: "production_db",
    username: "admin",
    password: "",
    ssl: true,
    timeout: "30",
    lastTested: "2026-05-26 10:30 AM"
  });

  const [cloudConfig, setCloudConfig] = useState<CloudConfig>({
    enabled: false,
    status: "disabled",
    provider: "s3",
    accessKey: "",
    secretKey: "",
    bucket: "",
    region: "us-east-1"
  });

  const [apiConfig, setApiConfig] = useState<ApiConfig>({
    enabled: true,
    status: "pending",
    baseUrl: "https://api.example.com/v1",
    apiKey: "",
    authType: "bearer",
    headers: "",
    rateLimit: "1000"
  });

  const [localStorageConfig, setLocalStorageConfig] = useState<ConnectorConfig>({
    enabled: false,
    status: "disabled"
  });

  const [fileUploadConfig, setFileUploadConfig] = useState<FileUploadConfig>({
    enabled: true,
    status: "connected",
    allowedTypes: ["PDF", "DOCX", "XLSX"],
    maxUploadSize: 100,
    autoIndexing: true,
    storageLimit: 500
  });

  const handleTestConnection = (type: string) => {
    setSuccessMessage(`${type.charAt(0).toUpperCase() + type.slice(1)} connection verified successfully!`);
    setShowSuccess(true);
    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} connector test passed!`);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleSaveGeneral = () => {
    dispatch(
      updateOrganizationConfig({
        id: org.id,
        name: generalInfo.name,
        email: generalInfo.email,
        contactPerson: generalInfo.contactPerson,
        plan: generalInfo.plan.charAt(0).toUpperCase() + generalInfo.plan.slice(1),
      })
    );
    toast.success("General settings saved successfully!");
  };

  const handleSaveLimits = () => {
    dispatch(
      updateOrganizationConfig({
        id: org.id,
        userLimit: resourceLimits.userLimit,
        storageLimit: resourceLimits.storageLimit,
      })
    );
    toast.success("Resource Limits saved successfully!");
  };

  const handleSaveWorkspace = (sectionName: string) => {
    toast.success(`${sectionName} saved successfully!`);
    setSuccessMessage(`${sectionName} configurations saved.`);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const activeConnectorsCount = [
    databaseConfig,
    cloudConfig,
    apiConfig,
    localStorageConfig,
    fileUploadConfig
  ].filter(c => c.enabled && c.status === "connected").length;

  const getStatusBadge = (status: string) => {
    const styles = {
      connected: { bg: "bg-[#D1FAE5]", text: "text-[#059669]", icon: CheckCircle2 },
      failed: { bg: "bg-[#FEE2E2]", text: "text-[#DC2626]", icon: XCircle },
      pending: { bg: "bg-[#FEF3C7]", text: "text-[#D97706]", icon: Clock },
      disabled: { bg: "bg-[#F3F4F6]", text: "text-[#6B7280]", icon: XCircle }
    };
    return styles[status as keyof typeof styles] || styles.disabled;
  };

  const fileTypes = ["PDF", "DOCX", "XLSX", "PPTX", "CSV", "TXT", "MD"];

  const toggleFileType = (type: string) => {
    setFileUploadConfig({
      ...fileUploadConfig,
      allowedTypes: fileUploadConfig.allowedTypes.includes(type)
        ? fileUploadConfig.allowedTypes.filter(t => t !== type)
        : [...fileUploadConfig.allowedTypes, type]
    });
  };

  const navigationItems = [
    {
      id: "general",
      title: "General Info",
      description: "Organization profile, subscription and details",
      icon: SettingsIcon,
      color: "text-[#0F766E]",
      bg: "bg-[#CCFBF1]"
    },
    {
      id: "limits",
      title: "Resource Limits",
      description: "Users limit, storage size, and query quotas",
      icon: Sliders,
      color: "text-[#ffbd59]",
      bg: "bg-[#FEF3C7]"
    },
    {
      id: "access",
      title: "Access Period",
      description: "Service window, start/end dates, and state",
      icon: CalendarDays,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      id: "features",
      title: "Feature Toggles",
      description: "Toggle indexing, translation, OCR and semantic RAG",
      icon: ToggleLeft,
      color: "text-purple-600",
      bg: "bg-purple-50"
    },
    {
      id: "connectors",
      title: "Data Connectors",
      description: "Configure integrations, sync frequencies, and files",
      icon: Database,
      color: "text-[#14B8A6]",
      bg: "bg-[#99F6E4]"
    }
  ];

  return (
    <div className="w-full h-full">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/admin/organizations")}
          className="mb-4 text-[#6B7280] hover:text-[#0F766E] -ml-2"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Organizations
        </Button>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-[#1F2937] mb-1">
              {org?.name} — Settings & Configuration
            </h2>
            <p className="text-sm text-[#6B7280]">
              Orchestrate AI resource governance, models, limits and enterprise data sync pipelines
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-[#EEF2FF] text-[#4F46E5] border border-[#C7D2FE] rounded-full text-xs font-semibold uppercase tracking-wider">
              {org?.plan}
            </span>
            <span className="px-3 py-1 bg-[#D1FAE5] text-[#059669] border border-[#A7F3D0] rounded-full text-xs font-semibold capitalize">
              {org?.status}
            </span>
          </div>
        </div>
      </div>

      {/* Success Alert */}
      {showSuccess && (
        <div className="mb-6 p-4 bg-[#D1FAE5] border border-[#059669] rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle2 className="w-5 h-5 text-[#059669]" />
          <p className="text-sm font-medium text-[#059669]">{successMessage}</p>
        </div>
      )}

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT PANEL */}
        <div className="lg:col-span-4 space-y-4">
          <div className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2 px-1">
            Configuration Areas
          </div>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <Card
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`p-4 border cursor-pointer transition-all duration-200 hover:shadow-md ${
                  isActive
                    ? "border-[#0F766E] bg-gradient-to-r from-[#F9FAFB] to-[#CCFBF1]/20 shadow-sm"
                    : "border-[#E5E7EB] bg-white hover:border-[#9CA3AF]"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 ${item.bg} rounded-lg flex items-center justify-center shadow-sm shrink-0`}>
                    <Icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-[#1F2937] mb-0.5">{item.title}</h4>
                    <p className="text-xs text-[#6B7280] leading-relaxed line-clamp-2">{item.description}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* RIGHT PANEL */}
        <div className="lg:col-span-8">
          
          {/* GENERAL INFO WORKSPACE */}
          {activeSection === "general" && (
            <Card className="bg-white border-[#E5E7EB] p-6 shadow-sm">
              <div className="border-b border-[#E5E7EB] pb-4 mb-6">
                <h3 className="text-lg font-semibold text-[#1F2937]">General Organization Details</h3>
                <p className="text-xs text-[#6B7280]">Edit contact details and plan levels for VarnueVedAI</p>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="orgName">Organization Name *</Label>
                    <Input
                      id="orgName"
                      value={generalInfo.name}
                      onChange={(e) => setGeneralInfo({ ...generalInfo, name: e.target.value })}
                      className="bg-[#F9FAFB] border-[#E5E7EB]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="orgEmail">Billing Email Address *</Label>
                    <Input
                      id="orgEmail"
                      type="email"
                      value={generalInfo.email}
                      onChange={(e) => setGeneralInfo({ ...generalInfo, email: e.target.value })}
                      className="bg-[#F9FAFB] border-[#E5E7EB]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="orgContact">Primary Admin Contact *</Label>
                    <Input
                      id="orgContact"
                      value={generalInfo.contactPerson}
                      onChange={(e) => setGeneralInfo({ ...generalInfo, contactPerson: e.target.value })}
                      className="bg-[#F9FAFB] border-[#E5E7EB]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="orgPlan">Subscription Level</Label>
                    <select
                      id="orgPlan"
                      value={generalInfo.plan}
                      onChange={(e) => setGeneralInfo({ ...generalInfo, plan: e.target.value })}
                      className="w-full h-10 px-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-sm"
                    >
                      <option value="starter">Starter - $99/mo</option>
                      <option value="professional">Professional - $299/mo</option>
                      <option value="enterprise">Enterprise - SLA</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E5E7EB] flex justify-end">
                  <Button
                    onClick={handleSaveGeneral}
                    className="bg-gradient-to-r from-[#0F766E] to-[#14B8A6] hover:from-[#0D5B54] hover:to-[#0F766E] text-white"
                  >
                    Save General Settings
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* RESOURCE LIMITS WORKSPACE */}
          {activeSection === "limits" && (
            <Card className="bg-white border-[#E5E7EB] p-6 shadow-sm">
              <div className="border-b border-[#E5E7EB] pb-4 mb-6">
                <h3 className="text-lg font-semibold text-[#1F2937]">Resource Quotas & Allocation</h3>
                <p className="text-xs text-[#6B7280]">Configure maximum usage sizes and AI compute allocations</p>
              </div>

              <div className="space-y-6">
                {/* User Limit */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-semibold">Maximum User Accounts</Label>
                    <span className="text-sm font-bold text-[#0F766E]">{resourceLimits.userLimit} users</span>
                  </div>
                  <Slider
                    value={[resourceLimits.userLimit]}
                    onValueChange={(val) => setResourceLimits({ ...resourceLimits, userLimit: val[0] })}
                    min={10}
                    max={1000}
                    step={10}
                  />
                  <div className="flex justify-between text-xxs text-[#9CA3AF]">
                    <span>10 Users</span>
                    <span>1000 Users</span>
                  </div>
                </div>

                {/* Storage Limit */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-semibold">Total Allocated Storage</Label>
                    <span className="text-sm font-bold text-[#0F766E]">{resourceLimits.storageLimit} GB</span>
                  </div>
                  <Slider
                    value={[resourceLimits.storageLimit]}
                    onValueChange={(val) => setResourceLimits({ ...resourceLimits, storageLimit: val[0] })}
                    min={50}
                    max={5000}
                    step={50}
                  />
                  <div className="flex justify-between text-xxs text-[#9CA3AF]">
                    <span>50 GB</span>
                    <span>5 TB</span>
                  </div>
                </div>

                {/* Query & Tokens */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-1.5">
                    <Label className="text-sm">Queries limit (queries / month)</Label>
                    <Input
                      type="number"
                      value={resourceLimits.queryLimit}
                      onChange={(e) => setResourceLimits({ ...resourceLimits, queryLimit: parseInt(e.target.value) || 0 })}
                      className="bg-[#F9FAFB] border-[#E5E7EB]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm">AI token allocation (million tokens / mo)</Label>
                    <Input
                      type="number"
                      value={resourceLimits.tokenAllocation}
                      onChange={(e) => setResourceLimits({ ...resourceLimits, tokenAllocation: parseInt(e.target.value) || 0 })}
                      className="bg-[#F9FAFB] border-[#E5E7EB]"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E5E7EB] flex justify-end">
                  <Button
                    onClick={handleSaveLimits}
                    className="bg-gradient-to-r from-[#0F766E] to-[#14B8A6] hover:from-[#0D5B54] hover:to-[#0F766E] text-white"
                  >
                    Save Resource Limits
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Other tabs remain static or simulated */}
          {activeSection === "access" && (
            <Card className="bg-white border-[#E5E7EB] p-6 shadow-sm">
              <div className="border-b border-[#E5E7EB] pb-4 mb-6">
                <h3 className="text-lg font-semibold text-[#1F2937]">Service Validity Window</h3>
                <p className="text-xs text-[#6B7280]">Set the start/end dates during which organization resources remain live</p>
              </div>
              <div className="space-y-6">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <h4 className="text-xs font-bold text-amber-800 mb-1 flex items-center gap-1.5">
                    <Clock className="w-4 h-4" /> Policy Reminder
                  </h4>
                  <p className="text-xxs text-amber-700 leading-normal">
                    This organization will lock and prompt renewal immediately upon crossing the expiration date. Auto-purge protocols will begin 30 days after expiry.
                  </p>
                </div>
                <div className="pt-4 border-t border-[#E5E7EB] flex justify-end">
                  <Button
                    onClick={() => handleSaveWorkspace("Access Period")}
                    className="bg-gradient-to-r from-[#0F766E] to-[#14B8A6] hover:from-[#0D5B54] hover:to-[#0F766E] text-white"
                  >
                    Save Period Configurations
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {activeSection === "features" && (
            <Card className="bg-white border-[#E5E7EB] p-6 shadow-sm">
              <div className="border-b border-[#E5E7EB] pb-4 mb-6">
                <h3 className="text-lg font-semibold text-[#1F2937]">Enterprise Capability Toggles</h3>
                <p className="text-xs text-[#6B7280]">Enable or disable RAG pipelines and custom overrides</p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB]/50">
                  <div>
                    <h4 className="text-sm font-semibold text-[#1F2937]">Realtime Data Auto-Indexing</h4>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-[#E5E7EB] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0F766E]"></div>
                  </label>
                </div>
                <div className="pt-4 border-t border-[#E5E7EB] flex justify-end">
                  <Button
                    onClick={() => handleSaveWorkspace("Feature Toggles")}
                    className="bg-gradient-to-r from-[#0F766E] to-[#14B8A6] hover:from-[#0D5B54] hover:to-[#0F766E] text-white"
                  >
                    Save Feature Configurations
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {activeSection === "connectors" && (
            <div className="space-y-4">
              {/* Database Connector Card */}
              <Card className="bg-white border-[#E5E7EB] p-5 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <Database className="w-6 h-6 text-[#0F766E]" />
                    <h3 className="text-base font-semibold">Database Connector</h3>
                  </div>
                  <span className="px-2.5 py-0.5 bg-[#D1FAE5] text-[#059669] rounded-full text-xxs font-semibold">Connected</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleTestConnection("database")} className="text-xs">Test Connection</Button>
                  <Button size="sm" onClick={() => handleSaveWorkspace("Database Connector")} className="bg-[#0F766E] text-white hover:bg-[#0D5B54]">Save</Button>
                </div>
              </Card>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
