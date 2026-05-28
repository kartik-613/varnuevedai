import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { useAppSelector, useAppDispatch } from "@/app/store";
import { fetchOrganizations } from "@/features/organizations/store/organizationsSlice";
import { addResource } from "./store/resourcesSlice";
import { Button, Card, Input, Label } from "@/shared/components";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function AddResource() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { organizations } = useAppSelector((state) => state.organizations);
  const { loading: resourcesLoading } = useAppSelector((state) => state.resources);

  useEffect(() => {
    dispatch(fetchOrganizations());
  }, [dispatch]);

  const [formData, setFormData] = useState({
    organisationId: "",
    subscriptionPlan: "Starter",
    storageLimitGB: "1.0",
    userLimit: 50,
    accessStart: new Date().toISOString().split("T")[0],
    accessEnd: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split("T")[0],
    dataSourceOrgId: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.organisationId) {
      toast.error("Please select an organization");
      return;
    }

    const payload = {
      organisationId: parseInt(formData.organisationId, 10),
      subscriptionPlan: formData.subscriptionPlan,
      storageLimitGB: formData.storageLimitGB,
      userLimit: Number(formData.userLimit),
      accessStart: formData.accessStart,
      accessEnd: formData.accessEnd,
      dataSourceOrgId: formData.dataSourceOrgId ? parseInt(formData.dataSourceOrgId, 10) : null,
    };

    dispatch(addResource(payload))
      .unwrap()
      .then(() => {
        toast.success("Resources allocated successfully!");
        navigate("/admin/resources");
      })
      .catch((err) => {
        toast.error(err || "Failed to allocate resources");
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
        <Link to="/admin/resources" className="text-[#6B7280] hover:text-[#0F766E] transition-colors">
          Resource Allocations
        </Link>
        <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
        <span className="text-[#0F766E] font-medium">Allocate Resources</span>
      </div>

      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate("/admin/resources")}
        className="mb-4 text-[#6B7280] hover:text-[#0F766E] -ml-2"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Resources
      </Button>

      {/* Page Header */}
      <div className="mb-5">
        <h2 className="text-2xl font-semibold text-[#1F2937] mb-1">Allocate New Resources</h2>
        <p className="text-sm text-[#6B7280]">Establish storage capacity limits, plans, and access periods for an organization.</p>
      </div>

      {/* Form Card */}
      <Card className="bg-white border-[#E5E7EB] p-6 shadow-sm max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-[#1F2937] pb-2 border-b border-[#E5E7EB]">
              Allocation Target & Plan
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Organization Select */}
              <div className="space-y-1.5">
                <Label htmlFor="organisationId" className="text-sm font-medium text-[#374151]">
                  Organization *
                </Label>
                <select
                  id="organisationId"
                  value={formData.organisationId}
                  onChange={(e) => setFormData({ ...formData, organisationId: e.target.value })}
                  className="w-full h-10 px-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-sm text-[#374151] focus:border-[#0F766E] focus:ring-[#0F766E]/20"
                  required
                >
                  <option value="">Select an organization...</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Plan Select */}
              <div className="space-y-1.5">
                <Label htmlFor="subscriptionPlan" className="text-sm font-medium text-[#374151]">
                  Subscription Plan *
                </Label>
                <select
                  id="subscriptionPlan"
                  value={formData.subscriptionPlan}
                  onChange={(e) => setFormData({ ...formData, subscriptionPlan: e.target.value })}
                  className="w-full h-10 px-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-sm text-[#374151] focus:border-[#0F766E] focus:ring-[#0F766E]/20"
                  required
                >
                  <option value="Starter">Starter - 50 Users</option>
                  <option value="Professional">Professional - 250 Users</option>
                  <option value="Enterprise">Enterprise - Unlimited / Custom</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-base font-semibold text-[#1F2937] pb-2 border-b border-[#E5E7EB]">
              Limits & Thresholds
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Storage Limit */}
              <div className="space-y-1.5">
                <Label htmlFor="storageLimitGB" className="text-sm font-medium text-[#374151]">
                  Storage Limit (GB) *
                </Label>
                <Input
                  id="storageLimitGB"
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={formData.storageLimitGB}
                  onChange={(e) => setFormData({ ...formData, storageLimitGB: e.target.value })}
                  className="bg-[#F9FAFB] border-[#E5E7EB] h-10 rounded-lg text-sm"
                  required
                />
              </div>

              {/* User Limit */}
              <div className="space-y-1.5">
                <Label htmlFor="userLimit" className="text-sm font-medium text-[#374151]">
                  Active User Limit *
                </Label>
                <Input
                  id="userLimit"
                  type="number"
                  min="1"
                  value={formData.userLimit}
                  onChange={(e) => setFormData({ ...formData, userLimit: parseInt(e.target.value, 10) })}
                  className="bg-[#F9FAFB] border-[#E5E7EB] h-10 rounded-lg text-sm"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-base font-semibold text-[#1F2937] pb-2 border-b border-[#E5E7EB]">
              Access Window & Integration
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Access Start Date */}
              <div className="space-y-1.5">
                <Label htmlFor="accessStart" className="text-sm font-medium text-[#374151]">
                  Access Start Date *
                </Label>
                <Input
                  id="accessStart"
                  type="date"
                  value={formData.accessStart}
                  onChange={(e) => setFormData({ ...formData, accessStart: e.target.value })}
                  className="bg-[#F9FAFB] border-[#E5E7EB] h-10 rounded-lg text-sm"
                  required
                />
              </div>

              {/* Access End Date */}
              <div className="space-y-1.5">
                <Label htmlFor="accessEnd" className="text-sm font-medium text-[#374151]">
                  Access Expiration Date *
                </Label>
                <Input
                  id="accessEnd"
                  type="date"
                  value={formData.accessEnd}
                  onChange={(e) => setFormData({ ...formData, accessEnd: e.target.value })}
                  className="bg-[#F9FAFB] border-[#E5E7EB] h-10 rounded-lg text-sm"
                  required
                />
              </div>

              {/* DataSource Organization ID */}
              <div className="space-y-1.5">
                <Label htmlFor="dataSourceOrgId" className="text-sm font-medium text-[#374151]">
                  Data Source Organization ID (Optional)
                </Label>
                <Input
                  id="dataSourceOrgId"
                  type="number"
                  placeholder="e.g. 142"
                  value={formData.dataSourceOrgId}
                  onChange={(e) => setFormData({ ...formData, dataSourceOrgId: e.target.value })}
                  className="bg-[#F9FAFB] border-[#E5E7EB] h-10 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t border-[#E5E7EB]">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin/resources")}
              className="px-6 order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-[#0F766E] to-[#14B8A6] hover:from-[#0D5B54] hover:to-[#0F766E] text-white px-6 order-1 sm:order-2 flex items-center justify-center gap-2"
              disabled={resourcesLoading || !formData.organisationId || !formData.storageLimitGB || !formData.userLimit}
            >
              {resourcesLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Allocating...
                </>
              ) : (
                "Allocate Resources"
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
