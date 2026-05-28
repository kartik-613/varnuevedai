import { Button, Calendar, Card, Input, Label, Popover, PopoverContent, PopoverTrigger, Slider } from "@/shared/components";

import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useAppDispatch } from "@/app/store";
import { createOrganization } from "./store/organizationsSlice";
import { ChevronRight, ArrowLeft, Database, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function CreateOrganization() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contactPerson: "",
    plan: "professional",
    userLimit: 50,
    storageLimit: 100, // in GB
    accessFrom: new Date(),
    accessTo: new Date(new Date().setMonth(new Date().getMonth() + 6)),
    maxDataSize: 5, // in MB, starts at 5MB
    allowedSources: [] as string[],
  });

  const dataSources = ["PDF", "CSV", "TXT", "JSON", "DOCX", "XLSX"];

  const toggleDataSource = (source: string) => {
    setFormData({
      ...formData,
      allowedSources: formData.allowedSources.includes(source)
        ? formData.allowedSources.filter(s => s !== source)
        : [...formData.allowedSources, source],
    });
  };

  const formatDataSize = (mb: number) => {
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(2)} GB`;
    }
    return `${mb} MB`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      name: formData.name,
      email: formData.email,
      contactPerson: formData.contactPerson,
      plan: formData.plan,
      userLimit: Number(formData.userLimit),
      storageLimit: Number(formData.storageLimit),
      status: "active" as const,
      expiry: formData.accessTo.toISOString().split("T")[0],
      accessFrom: formData.accessFrom.toISOString().split("T")[0],
      accessTo: formData.accessTo.toISOString().split("T")[0],
    };

    dispatch(createOrganization(payload))
      .unwrap()
      .then(() => {
        toast.success("Organization created successfully!");
        navigate("/admin/organizations");
      })
      .catch((err) => {
        toast.error(err || "Failed to create organization");
      });
  };

  return (
    <div className="w-full h-full">
      {/* Breadcrumb */}
      <div className="mb-4 flex items-center gap-2 text-sm">
        <Link to="/admin" className="text-[#6B7280] hover:text-[#0F766E] transition-colors">
          Dashboard
        </Link>
        <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
        <Link to="/admin/organizations" className="text-[#6B7280] hover:text-[#0F766E] transition-colors">
          Organizations
        </Link>
        <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
        <span className="text-[#0F766E] font-medium">Create Organization</span>
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

      {/* Page Header */}
      <div className="mb-5">
        <h2 className="text-2xl font-semibold text-[#1F2937] mb-1">Create New Organization</h2>
        <p className="text-sm text-[#6B7280]">Set up a new enterprise organization with resource allocations</p>
      </div>

      {/* Form */}
      <Card className="bg-white border-[#E5E7EB] p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Organization Details */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-[#1F2937] pb-2 border-b border-[#E5E7EB]">
              Organization Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-sm">Organization Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Acme Corporation"
                  className="bg-[#F9FAFB] border-[#E5E7EB] h-10 rounded-lg"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm">Organization Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="admin@acme.com"
                  className="bg-[#F9FAFB] border-[#E5E7EB] h-10 rounded-lg"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="contactPerson" className="text-sm">Contact Person *</Label>
                <Input
                  id="contactPerson"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  placeholder="John Doe"
                  className="bg-[#F9FAFB] border-[#E5E7EB] h-10 rounded-lg"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="plan" className="text-sm">Subscription Plan *</Label>
                <select
                  id="plan"
                  value={formData.plan}
                  onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                  className="w-full h-10 px-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-sm text-[#374151] focus:border-[#0F766E] focus:ring-[#0F766E]/20"
                  required
                >
                  <option value="starter">Starter - $99/month</option>
                  <option value="professional">Professional - $299/month</option>
                  <option value="enterprise">Enterprise - Custom</option>
                </select>
              </div>
            </div>
          </div>

          {/* Resource Allocation */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-[#1F2937] pb-2 border-b border-[#E5E7EB]">
              Resource Allocation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="userLimit" className="text-sm">User Limit</Label>
                <Input
                  id="userLimit"
                  type="number"
                  value={formData.userLimit}
                  onChange={(e) => setFormData({ ...formData, userLimit: parseInt(e.target.value) })}
                  min="1"
                  className="bg-[#F9FAFB] border-[#E5E7EB] h-10 rounded-lg"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="storageLimit" className="text-sm">Storage Limit (GB)</Label>
                <Input
                  id="storageLimit"
                  type="number"
                  value={formData.storageLimit}
                  onChange={(e) => setFormData({ ...formData, storageLimit: parseInt(e.target.value) })}
                  min="1"
                  className="bg-[#F9FAFB] border-[#E5E7EB] h-10 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Access Period */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-[#1F2937] pb-2 border-b border-[#E5E7EB]">
              Temporary Access Period
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left bg-[#F9FAFB] border-[#E5E7EB] h-10">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(formData.accessFrom, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.accessFrom}
                      onSelect={(date) => date && setFormData({ ...formData, accessFrom: date })}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm">End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left bg-[#F9FAFB] border-[#E5E7EB] h-10">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(formData.accessTo, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.accessTo}
                      onSelect={(date) => date && setFormData({ ...formData, accessTo: date })}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <p className="text-xs text-[#9CA3AF]">
              Organization will be automatically deleted after the end date
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t border-[#E5E7EB]">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin/organizations")}
              className="px-6 order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-[#0F766E] to-[#14B8A6] hover:from-[#0D5B54] hover:to-[#0F766E] text-white px-6 order-1 sm:order-2"
              disabled={!formData.name || !formData.email || !formData.contactPerson}
            >
              Create Organization
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
