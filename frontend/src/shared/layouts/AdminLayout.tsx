import { Button, Input } from "@/shared/components";
import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Building2,
  Users,
  FileCheck,
  CreditCard,
  Settings,
  LogOut,
  Search,
  Bell,
  Clock,
  ChevronDown,
  User,
  Menu,
  X,
  HardDrive,
} from "lucide-react";
import logoImage from "@/imports/Group_158.png";
import { apiClient } from "@/shared/api/apiClient";

const SIDEBAR_W = 256; // px — w-64

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
  );
  const [adminUser, setAdminUser] = useState<{ id: number; name: string } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("adminUser");
      if (stored) setAdminUser(JSON.parse(stored));
    } catch (e) {
      console.error("Error reading admin user from localStorage:", e);
    }
  }, []);

  // Close mobile sidebar on route change or ESC
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setSidebarOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const handleLogout = async () => {
    try {
      const rt = localStorage.getItem("refreshToken");
      if (rt) await apiClient.post("/admin/auth/logout", { refreshToken: rt }).catch(() => {});
    } catch { /* ignore */ }
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("adminUser");
    navigate("/");
  };

  const navItems = [
    { path: "/admin",               label: "Dashboard",     icon: LayoutDashboard },
    { path: "/admin/organizations", label: "Organizations", icon: Building2 },
    { path: "/admin/users",         label: "Users",         icon: Users },
    { path: "/admin/resources",     label: "Resources",     icon: HardDrive },
    { path: "/admin/requests",      label: "Requests",      icon: FileCheck },
    { path: "/admin/billing",       label: "Billing",       icon: CreditCard },
    { path: "/admin/settings",      label: "Settings",      icon: Settings },
  ];

  const NavLinks = ({ className = "" }: { className?: string }) => (
    <nav className={`flex-1 p-4 space-y-1 overflow-y-auto ${className}`}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          location.pathname === item.path ||
          (item.path !== "/admin" && location.pathname.startsWith(item.path));
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
              isActive
                ? "bg-gradient-to-r from-[#0F766E] to-[#14B8A6] text-white shadow-md shadow-[#0F766E]/20"
                : "text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#1F2937]"
            }`}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FC] flex">

      {/* ════════════════════════════════════════
          DESKTOP SIDEBAR — full-height left panel
          Logo at top, nav below — one unified strip
          ════════════════════════════════════════ */}
      <aside
        id="desktop-sidebar"
        className="hidden lg:flex flex-col fixed inset-y-0 left-0 z-30 bg-white shadow-sm"
        style={{ width: SIDEBAR_W }}
      >
        {/* Logo zone — same height as the topbar (73px) */}
        <div className="flex items-center justify-center h-[73px] border-b border-[#E5E7EB] px-4 flex-shrink-0">
          <img src={logoImage} alt="VarnueVedAI Logo" className="h-12 w-auto object-contain" />
        </div>

        {/* Nav links */}
        <NavLinks className="border-r border-[#E5E7EB]" />
      </aside>

      {/* ════════════════════════════════════════
          RIGHT-HAND SHELL  (offset by sidebar width)
          ════════════════════════════════════════ */}
      <div className="flex flex-col flex-1 lg:pl-64 min-h-screen">

        {/* ── Fixed Topbar ── */}
        <header className="bg-white fixed top-0 left-0 lg:left-64 right-0 z-20 shadow-sm h-[73px] flex items-center">
          <div className="flex items-center justify-between gap-4 px-4 md:px-6 py-3 w-full">

            {/* Hamburger — mobile only */}
            <button
              id="sidebar-hamburger"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-lg text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#1F2937] transition-colors"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Global Search */}
            <div className="hidden sm:flex flex-1 max-w-xl">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                <Input
                  type="search"
                  placeholder="Search organizations, users, queries..."
                  className="pl-10 h-9 w-full bg-[#F9FAFB] border-[#E5E7EB] rounded-lg text-sm"
                />
              </div>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2 md:gap-4 flex-shrink-0 ml-auto">
              {/* Clock */}
              <div className="hidden md:flex items-center gap-2 text-sm text-[#6B7280] px-3 py-1.5 bg-[#F9FAFB] rounded-lg">
                <Clock className="w-4 h-4" />
                <span>{currentTime}</span>
              </div>

              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-5 h-5 text-[#6B7280]" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#ffbd59] rounded-full" />
              </Button>

              {/* User profile */}
              <div className="flex items-center gap-2 px-2 md:px-3 py-1.5 bg-[#F9FAFB] rounded-lg cursor-pointer hover:bg-[#F3F4F6] transition-colors">
                <div className="w-8 h-8 bg-gradient-to-br from-[#0F766E] to-[#14B8A6] rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-[#1F2937]">{adminUser?.name || "Admin User"}</p>
                  <p className="text-xs text-[#9CA3AF]">@{adminUser?.name || "admin"}</p>
                </div>
                <ChevronDown className="hidden md:block w-4 h-4 text-[#9CA3AF]" />
              </div>

              {/* Logout */}
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-[#6B7280] hover:text-[#DC2626] hover:bg-[#FEE2E2]"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Mobile-only: logo strip shown in topbar when sidebar is closed */}
          <div className="lg:hidden absolute top-0 left-0 h-full flex items-center pl-14 pointer-events-none">
            <img src={logoImage} alt="VarnueVedAI Logo" className="h-10 w-auto object-contain" />
          </div>
        </header>

        {/* ── Page Content (offset below topbar) ── */}
        <main className="pt-[73px] flex-1">
          <div className="p-6 md:p-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* ════════════════════════════════════════
          MOBILE SIDEBAR (slide-in drawer)
          ════════════════════════════════════════ */}
      {/* Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <aside
        id="mobile-sidebar"
        className={`fixed top-0 left-0 bottom-0 w-72 bg-white shadow-2xl z-50 flex flex-col lg:hidden
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Mobile sidebar top — logo + close */}
        <div className="flex items-center justify-between px-4 h-[73px] border-b border-[#E5E7EB] flex-shrink-0">
          <img src={logoImage} alt="VarnueVedAI Logo" className="h-10 w-auto object-contain" />
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-lg text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#1F2937] transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <NavLinks />
      </aside>
    </div>
  );
}
