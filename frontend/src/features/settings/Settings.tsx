import { Button, Card, Input, Label, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components";

import { useState } from "react";
import {
  Settings as SettingsIcon,
  Sparkles,
  Key,
  ShieldAlert,
  Webhook,
  Sliders,
  CheckCircle,
  HelpCircle,
  Plus,
  Trash2,
  Lock,
  Globe
} from "lucide-react";
import { toast } from "sonner";

export default function Settings() {
  const [activeSubTab, setActiveSubTab] = useState("general");

  // --- GENERAL STATE ---
  const [generalSettings, setGeneralSettings] = useState({
    portalName: "VarnueVedAI Admin Platform",
    timezone: "UTC+05:30 (IST)",
    defaultLanguage: "English",
    supportEmail: "support@varnuevedai.com"
  });

  // --- AI ENGINE CONFIG STATE ---
  const [aiSettings, setAiSettings] = useState({
    defaultProvider: "gemini",
    defaultModel: "gemini-1.5-pro",
    geminiApiKey: "••••••••••••••••••••••••",
    openaiApiKey: "",
    anthropicApiKey: "",
    temperature: 0.2,
    maxTokens: 4096
  });

  // --- SECURITY STATE ---
  const [securitySettings, setSecuritySettings] = useState({
    mfaEnforced: true,
    sessionTimeout: 30, // minutes
    passwordLength: 12,
    requireSpecialChars: true
  });

  // --- DEVELOPER API STATE ---
  const [apiKeys, setApiKeys] = useState([
    { id: "key_1", name: "RAG sync webhook token", value: "ved_live_4a1f...9b2c", created: "2026-05-15", status: "Active" },
    { id: "key_2", name: "Slack bot integration", value: "ved_live_7e8d...2a1f", created: "2026-05-20", status: "Active" }
  ]);
  const [newKeyName, setNewKeyName] = useState("");

  const handleCreateApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName) return;
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    const newKey = {
      id: `key_${Date.now()}`,
      name: newKeyName,
      value: `ved_live_${randomSuffix}c...${randomSuffix}a`,
      created: new Date().toISOString().split("T")[0],
      status: "Active"
    };
    setApiKeys([...apiKeys, newKey]);
    toast.success("API Key generated successfully!");
    setNewKeyName("");
  };

  const handleDeleteKey = (id: string) => {
    setApiKeys(apiKeys.filter(k => k.id !== id));
    toast.success("API Key revoked successfully.");
  };

  const handleSaveSettings = (tabName: string) => {
    toast.success(`${tabName} configurations updated!`);
  };

  return (
    <div className="w-full h-full">
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-[#1F2937] mb-1">Global System Settings</h2>
        <p className="text-sm text-[#6B7280]">Configure platform parameters, default AI LLM endpoints, security restrictions, and API bindings</p>
      </div>

      {/* Tabs Layout */}
      <Tabs defaultValue="general" className="w-full" onValueChange={setActiveSubTab}>
        <TabsList className="bg-white border border-[#E5E7EB] p-1 rounded-xl mb-6 flex overflow-x-auto">
          <TabsTrigger value="general" className="rounded-lg data-[state=active]:bg-[#0F766E] data-[state=active]:text-white flex items-center gap-1.5">
            <Globe className="w-4 h-4" /> General
          </TabsTrigger>
          <TabsTrigger value="ai" className="rounded-lg data-[state=active]:bg-[#0F766E] data-[state=active]:text-white flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" /> AI Engine Setup
          </TabsTrigger>
          <TabsTrigger value="security" className="rounded-lg data-[state=active]:bg-[#0F766E] data-[state=active]:text-white flex items-center gap-1.5">
            <Lock className="w-4 h-4" /> Security
          </TabsTrigger>
          <TabsTrigger value="apis" className="rounded-lg data-[state=active]:bg-[#0F766E] data-[state=active]:text-white flex items-center gap-1.5">
            <Webhook className="w-4 h-4" /> Developer APIs
          </TabsTrigger>
        </TabsList>

        {/* GENERAL SETTINGS TAB */}
        <TabsContent value="general">
          <Card className="bg-white border-[#E5E7EB] p-6 shadow-sm">
            <div className="border-b border-[#E5E7EB] pb-4 mb-5">
              <h3 className="text-base font-semibold text-[#1F2937]">General Administration Settings</h3>
              <p className="text-xs text-[#6B7280]">Manage dashboard branding, default language settings, and contact information</p>
            </div>
            
            <div className="space-y-4 max-w-xl">
              <div className="space-y-1.5">
                <Label htmlFor="portalName">Admin Portal Name</Label>
                <Input
                  id="portalName"
                  value={generalSettings.portalName}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, portalName: e.target.value })}
                  className="bg-[#F9FAFB] border-[#E5E7EB]"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="portalTimezone">Default System Timezone</Label>
                <select
                  id="portalTimezone"
                  value={generalSettings.timezone}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, timezone: e.target.value })}
                  className="w-full h-10 px-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-sm text-[#374151]"
                >
                  <option value="UTC+05:30 (IST)">UTC+05:30 (IST)</option>
                  <option value="UTC+00:00 (GMT)">UTC+00:00 (GMT)</option>
                  <option value="UTC-08:00 (PST)">UTC-08:00 (PST)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="supportEmail">Technical Support Address</Label>
                <Input
                  id="supportEmail"
                  value={generalSettings.supportEmail}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, supportEmail: e.target.value })}
                  className="bg-[#F9FAFB] border-[#E5E7EB]"
                />
              </div>
              <div className="pt-4 border-t border-[#E5E7EB] flex justify-end">
                <Button onClick={() => handleSaveSettings("General Profile")} className="bg-[#0F766E] text-white hover:bg-[#0D5B54]">Save Changes</Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* AI ENGINE SETUP TAB */}
        <TabsContent value="ai">
          <Card className="bg-white border-[#E5E7EB] p-6 shadow-sm">
            <div className="border-b border-[#E5E7EB] pb-4 mb-5">
              <h3 className="text-base font-semibold text-[#1F2937]">LLM & AI Engine Configuration</h3>
              <p className="text-xs text-[#6B7280]">Connect custom model providers to execute document summary and semantic search RAG algorithms</p>
            </div>

            <div className="space-y-6 max-w-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="defaultProvider">Default LLM Provider</Label>
                  <select
                    id="defaultProvider"
                    value={aiSettings.defaultProvider}
                    onChange={(e) => setAiSettings({ ...aiSettings, defaultProvider: e.target.value })}
                    className="w-full h-10 px-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-sm"
                  >
                    <option value="gemini">Google Gemini (Recommended)</option>
                    <option value="openai">OpenAI (GPT-4)</option>
                    <option value="anthropic">Anthropic (Claude)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="defaultModel">Default System Model</Label>
                  <select
                    id="defaultModel"
                    value={aiSettings.defaultModel}
                    onChange={(e) => setAiSettings({ ...aiSettings, defaultModel: e.target.value })}
                    className="w-full h-10 px-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-sm"
                  >
                    <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                    <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                    <option value="gpt-4o">GPT-4o</option>
                    <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                  </select>
                </div>
              </div>

              {/* API Credentials */}
              <div className="space-y-4 p-4 border border-[#E5E7EB] bg-[#F9FAFB]/50 rounded-xl">
                <h4 className="text-xs font-bold text-[#1F2937] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-[#0F766E]" /> API Provider Credentials
                </h4>
                
                <div className="space-y-1.5">
                  <Label className="text-xs">Google Gemini API Key</Label>
                  <Input
                    type="password"
                    value={aiSettings.geminiApiKey}
                    onChange={(e) => setAiSettings({ ...aiSettings, geminiApiKey: e.target.value })}
                    placeholder="AIzaSy..."
                    className="bg-white border-[#E5E7EB] h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">OpenAI API Key (Optional)</Label>
                  <Input
                    type="password"
                    value={aiSettings.openaiApiKey}
                    onChange={(e) => setAiSettings({ ...aiSettings, openaiApiKey: e.target.value })}
                    placeholder="sk-..."
                    className="bg-white border-[#E5E7EB] h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Anthropic API Key (Optional)</Label>
                  <Input
                    type="password"
                    value={aiSettings.anthropicApiKey}
                    onChange={(e) => setAiSettings({ ...aiSettings, anthropicApiKey: e.target.value })}
                    placeholder="sk-ant-..."
                    className="bg-white border-[#E5E7EB] h-9 text-xs"
                  />
                </div>
              </div>

              {/* Temperature & Token Settings */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <Label className="font-semibold">RAG Prompt Temperature</Label>
                    <span className="font-bold text-[#0F766E]">{aiSettings.temperature} (Focus / Precise)</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={aiSettings.temperature}
                    onChange={(e) => setAiSettings({ ...aiSettings, temperature: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-[#E5E7EB] rounded-lg appearance-none cursor-pointer accent-[#0F766E]"
                  />
                  <div className="flex justify-between text-[10px] text-[#9CA3AF]">
                    <span>0.0 (Precise)</span>
                    <span>1.0 (Creative)</span>
                  </div>
                </div>

                <div className="space-y-1.5 max-w-xs">
                  <Label className="text-xs">Max Output Token Limit</Label>
                  <Input
                    type="number"
                    value={aiSettings.maxTokens}
                    onChange={(e) => setAiSettings({ ...aiSettings, maxTokens: parseInt(e.target.value) || 0 })}
                    className="bg-[#F9FAFB] border-[#E5E7EB] h-9 text-xs"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#E5E7EB] flex justify-end">
                <Button onClick={() => handleSaveSettings("AI Models Config")} className="bg-[#0F766E] text-white hover:bg-[#0D5B54]">Save LLM Engine</Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* SECURITY TAB */}
        <TabsContent value="security">
          <Card className="bg-white border-[#E5E7EB] p-6 shadow-sm">
            <div className="border-b border-[#E5E7EB] pb-4 mb-5">
              <h3 className="text-base font-semibold text-[#1F2937]">Corporate Security Protocols</h3>
              <p className="text-xs text-[#6B7280]">Configure session timeout periods, enforce Multi-factor authentication, and govern policy compliance</p>
            </div>

            <div className="space-y-5 max-w-xl">
              {/* MFA Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB]/50">
                <div>
                  <h4 className="text-xs font-semibold text-[#1F2937]">Enforce MFA for Admins</h4>
                  <p className="text-[10px] text-[#6B7280]">Require Microsoft Authenticator or Google Authenticator codes at sign in</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={securitySettings.mfaEnforced}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, mfaEnforced: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-[#E5E7EB] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0F766E]"></div>
                </label>
              </div>

              {/* Timeout Limit */}
              <div className="space-y-1.5">
                <Label htmlFor="sessionTimeout">Session Inactivity Timeout (Minutes)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={securitySettings.sessionTimeout}
                  onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: parseInt(e.target.value) || 0 })}
                  className="bg-[#F9FAFB] border-[#E5E7EB]"
                />
              </div>

              {/* Password limit */}
              <div className="space-y-1.5">
                <Label htmlFor="passLength">Minimum Password Characters</Label>
                <Input
                  id="passLength"
                  type="number"
                  value={securitySettings.passwordLength}
                  onChange={(e) => setSecuritySettings({ ...securitySettings, passwordLength: parseInt(e.target.value) || 0 })}
                  className="bg-[#F9FAFB] border-[#E5E7EB]"
                />
              </div>

              <div className="pt-4 border-t border-[#E5E7EB] flex justify-end">
                <Button onClick={() => handleSaveSettings("Security Settings")} className="bg-[#0F766E] text-white hover:bg-[#0D5B54]">Update Policy</Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* DEVELOPER APIS TAB */}
        <TabsContent value="apis" className="space-y-6">
          
          {/* API Key Generation */}
          <Card className="bg-white border-[#E5E7EB] p-6 shadow-sm">
            <div className="border-b border-[#E5E7EB] pb-4 mb-5">
              <h3 className="text-base font-semibold text-[#1F2937]">Developer Access Tokens</h3>
              <p className="text-xs text-[#6B7280]">Manage active API keys to index client data via command line pipelines or external script webhooks</p>
            </div>

            <div className="space-y-4">
              <form onSubmit={handleCreateApiKey} className="max-w-md flex gap-2">
                <Input
                  placeholder="e.g. Sales CRM Vector Sync"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="bg-[#F9FAFB] border-[#E5E7EB] h-9 text-xs"
                  required
                />
                <Button type="submit" className="bg-[#0F766E] text-white hover:bg-[#0D5B54] text-xs h-9 shrink-0">
                  <Plus className="w-4 h-4 mr-1" /> Generate Token
                </Button>
              </form>

              <Table>
                <TableHeader>
                  <TableRow className="border-b border-[#F3F4F6]">
                    <TableHead className="text-xs text-[#6B7280] py-3 pl-4">Token Identifier</TableHead>
                    <TableHead className="text-xs text-[#6B7280]">Token Secret Value</TableHead>
                    <TableHead className="text-xs text-[#6B7280]">Created On</TableHead>
                    <TableHead className="text-xs text-[#6B7280]">Status</TableHead>
                    <TableHead className="text-xs text-[#6B7280] text-right pr-4">Revoke</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.map((k) => (
                    <TableRow key={k.id} className="border-b border-[#F9FAFB]">
                      <TableCell className="text-xs font-semibold text-[#1F2937] py-3.5 pl-4">{k.name}</TableCell>
                      <TableCell className="text-xs font-mono text-[#6B7280] py-3">{k.value}</TableCell>
                      <TableCell className="text-xs text-[#6B7280] py-3">{k.created}</TableCell>
                      <TableCell className="py-3">
                        <span className="px-2 py-0.5 bg-[#D1FAE5] text-[#059669] rounded text-[10px] font-semibold">
                          {k.status}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 pr-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteKey(k.id)}
                          className="text-[#DC2626] hover:bg-[#FEE2E2] h-7 w-7 p-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
