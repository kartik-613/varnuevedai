import { Button, Card, Input, Label } from "@/shared/components";
import { useState } from "react";
import { useNavigate } from "react-router";
import { Lock, User as UserIcon, AlertCircle, Eye, EyeOff } from "lucide-react";
import logoImage from "@/imports/Group_158.png";
import { apiClient } from "@/shared/api/apiClient";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response: any = await apiClient.post("/admin/auth/login", {
        vv_admin_name: username,
        vv_admin_password: password,
      });

      if (response && response.success) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("refreshToken", response.data.refreshToken);
        localStorage.setItem("adminUser", JSON.stringify(response.data.admin));
        navigate("/admin");
      } else {
        setError(response.message || "Failed to log in");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F766E] via-[#0D9488] to-[#14B8A6] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative floating blur elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/3 rounded-full blur-3xl"></div>
      </div>

      {/* Frosted glass login card */}
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 relative z-10">
        <div className="p-10">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex w-40 h-24 items-center justify-center">
              <img src={logoImage} alt="VarnueVedAI Logo" className="w-full h-full object-contain" />
            </div>
            <p className="text-[#6B7280]">Secure access to Admin Panel</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm text-[#374151]">Admin Username</Label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
                <Input
                  id="username"
                  type="text"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-12 h-12 bg-[#F9FAFB] border-[#E5E7EB] rounded-xl focus:border-[#0F766E] focus:ring-[#0F766E]/20"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm text-[#374151]">Password</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 pr-12 h-12 bg-[#F9FAFB] border-[#E5E7EB] rounded-xl focus:border-[#0F766E] focus:ring-[#0F766E]/20"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#0F766E] transition-colors focus:outline-none"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-[#0F766E] to-[#14B8A6] hover:from-[#0D5B54] hover:to-[#0F766E] text-white rounded-xl shadow-lg shadow-[#0F766E]/30 transition-all duration-200 flex items-center justify-center"
            >
              {loading ? "Signing In..." : "Sign In to Dashboard"}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
