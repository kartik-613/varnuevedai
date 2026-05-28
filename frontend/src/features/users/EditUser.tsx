import { Button, Calendar, Card, Input, Label, Popover, PopoverContent, PopoverTrigger } from "@/shared/components";

import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router";
import { ChevronRight, ArrowLeft, Calendar as CalendarIcon, Shield } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/app/store";
import { updateUser } from "./store/usersSlice";

export default function EditUser() {
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const { users } = useAppSelector((state) => state.users);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    accessFrom: new Date(),
    accessTo: new Date(new Date().setMonth(new Date().getMonth() + 6)),
    maxUploadSize: 500, // MB
    queryLimit: 2500,
    tokenAllocation: 25, // Million tokens
    allowedSources: [] as string[],
    organization: "Acme Corporation",
    role: "Developer",
    permissions: {
      canUpload: true,
      canConfigure: true,
      canViewAnalytics: true
    }
  });

  // Load user by id from Redux
  useEffect(() => {
    const match = users.find(u => u.id === id);
    if (match) {
      // Parse accessFrom / accessTo strings if available, or fall back
      const fromDate = match.accessFrom ? new Date(match.accessFrom) : new Date();
      const toDate = match.accessTo ? new Date(match.accessTo) : new Date(new Date().setMonth(new Date().getMonth() + 6));
      
      // Parse maxUploadSize
      const maxUploadSizeNum = parseInt(match.maxDataSize) || 500;

      // Define default permissions based on role
      const defaultPermissions = {
        canUpload: match.role !== "Viewer",
        canConfigure: match.role === "Owner" || match.role === "Developer",
        canViewAnalytics: match.role !== "Viewer"
      };

      setFormData({
        name: match.name,
        email: match.email,
        accessFrom: fromDate,
        accessTo: toDate,
        maxUploadSize: maxUploadSizeNum,
        queryLimit: match.role === "Owner" ? 5000 : match.role === "Developer" ? 3000 : 1000,
        tokenAllocation: match.role === "Owner" ? 40 : match.role === "Developer" ? 30 : 10,
        allowedSources: match.allowedSources,
        organization: match.organization,
        role: match.role,
        permissions: defaultPermissions
      });
    } else {
      // Fallback details if not matched
      setFormData(prev => ({
        ...prev,
        name: "Mock User " + id,
        email: `mock-${id}@example.com`,
        allowedSources: ["PDF", "CSV"]
      }));
    }
  }, [id, users]);



  const handlePermissionToggle = (key: keyof typeof formData.permissions) => {
    setFormData({
      ...formData,
      permissions: {
        ...formData.permissions,
        [key]: !formData.permissions[key]
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast.error("Please fill out all required fields.");
      return;
    }

    dispatch(
      updateUser({
        id: id!,
        name: formData.name,
        email: formData.email,
        accessFrom: format(formData.accessFrom, "yyyy-MM-dd"),
        accessTo: format(formData.accessTo, "yyyy-MM-dd"),
        maxDataSize: "1.0 GB",
        allowedSources: ["PDF", "CSV", "TXT"],
        organization: formData.organization,
        role: formData.role
      })
    );

    toast.success("User details updated successfully!");
    navigate("/admin/users");
  };

  return (
    <div className="w-full h-full">
      {/* Breadcrumb */}
      <div className="mb-4 flex items-center gap-2 text-sm">
        <Link to="/admin" className="text-[#6B7280] hover:text-[#0F766E] transition-colors">
          Dashboard
        </Link>
        <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
        <Link to="/admin/users" className="text-[#6B7280] hover:text-[#0F766E] transition-colors">
          Users
        </Link>
        <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
        <span className="text-[#0F766E] font-medium">Edit User</span>
      </div>

      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate("/admin/users")}
        className="mb-4 text-[#6B7280] hover:text-[#0F766E] -ml-2"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Users
      </Button>

      {/* Page Header */}
      <div className="mb-5">
        <h2 className="text-2xl font-semibold text-[#1F2937] mb-1">Edit User Profile</h2>
        <p className="text-sm text-[#6B7280]">Modify details, validation dates, and resource query allotments</p>
      </div>

      {/* Form */}
      <Card className="bg-white border-[#E5E7EB] p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-[#1F2937] pb-2 border-b border-[#E5E7EB]">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="userName" className="text-sm">Full Name *</Label>
                <Input
                  id="userName"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  className="bg-[#F9FAFB] border-[#E5E7EB] h-10 rounded-lg"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="userEmail" className="text-sm">Email Address *</Label>
                <Input
                  id="userEmail"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                  className="bg-[#F9FAFB] border-[#E5E7EB] h-10 rounded-lg"
                  required
                />
              </div>
            </div>
          </div>

          {/* Access Period */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-[#1F2937] pb-2 border-b border-[#E5E7EB]">
              Access Period
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left bg-[#F9FAFB] border-[#E5E7EB] h-10">
                      <CalendarIcon className="mr-2 h-4 w-4 text-[#0F766E]" />
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
                      <CalendarIcon className="mr-2 h-4 w-4 text-[#0F766E]" />
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
          </div>

          {/* Organization Access & Permissions */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-[#1F2937] pb-2 border-b border-[#E5E7EB]">
              Organization & Permission Access
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="orgSelect" className="text-sm">Assign Organization</Label>
                  <select
                    id="orgSelect"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    className="w-full h-10 px-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-sm text-[#374151]"
                  >
                    <option value="Acme Corporation">Acme Corporation</option>
                    <option value="TechStart Inc">TechStart Inc</option>
                    <option value="Global Solutions">Global Solutions</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="roleSelect" className="text-sm">Assign Role</Label>
                  <select
                    id="roleSelect"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full h-10 px-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-sm text-[#374151]"
                  >
                    <option value="Owner">Owner (Full Admin)</option>
                    <option value="Developer">Developer (Connector Config)</option>
                    <option value="Member">Member (Read & Upload)</option>
                    <option value="Viewer">Viewer (Read Only)</option>
                  </select>
                </div>
              </div>

              {/* Permission Toggles */}
              <div className="space-y-3 p-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl flex flex-col justify-center">
                <h4 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-[#0F766E]" /> Custom Permission Toggles
                </h4>
                
                <label className="flex items-center gap-2 cursor-pointer text-xs text-[#374151]">
                  <input
                    type="checkbox"
                    checked={formData.permissions.canUpload}
                    onChange={() => handlePermissionToggle("canUpload")}
                    className="w-4 h-4 text-[#0F766E] border-[#E5E7EB] rounded"
                  />
                  <span>Allow user to index/upload file structures</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-[#374151]">
                  <input
                    type="checkbox"
                    checked={formData.permissions.canConfigure}
                    onChange={() => handlePermissionToggle("canConfigure")}
                    className="w-4 h-4 text-[#0F766E] border-[#E5E7EB] rounded"
                  />
                  <span>Allow user to configure databases & cloud APIs</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-[#374151]">
                  <input
                    type="checkbox"
                    checked={formData.permissions.canViewAnalytics}
                    onChange={() => handlePermissionToggle("canViewAnalytics")}
                    className="w-4 h-4 text-[#0F766E] border-[#E5E7EB] rounded"
                  />
                  <span>Allow user to inspect usage dashboard charts</span>
                </label>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t border-[#E5E7EB]">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin/users")}
              className="px-6 order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-[#0F766E] to-[#14B8A6] hover:from-[#0D5B54] hover:to-[#0F766E] text-white px-6 order-1 sm:order-2"
              disabled={!formData.name || !formData.email}
            >
              Update User
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
