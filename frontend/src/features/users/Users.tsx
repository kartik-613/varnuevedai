import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAppSelector, useAppDispatch } from "@/app/store";
import { deleteUser, fetchUsers } from "./store/usersSlice";
import { Button, Card, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Checkbox } from "@/shared/components";
import { UserPlus, Trash2, Pencil, Search, Users as UsersIcon, Filter } from "lucide-react";
import { toast } from "sonner";

export default function Users() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { users } = useAppSelector((state) => state.users);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const [searchTerm, setSearchTerm] = useState("");
  const [orgFilter, setOrgFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Dynamic list of organizations for filter
  const organizations = useMemo(() => {
    const orgs = new Set<string>();
    users.forEach(user => {
      if (user.organization) {
        orgs.add(user.organization);
      }
    });
    return Array.from(orgs).sort();
  }, [users]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.organization.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesOrg = orgFilter === "all" || user.organization.toLowerCase() === orgFilter.toLowerCase();
      const matchesStatus = statusFilter === "all" || user.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesOrg && matchesStatus;
    });
  }, [users, searchTerm, orgFilter, statusFilter]);

  const handleDeleteUser = (id: string) => {
    dispatch(deleteUser(id));
    toast.success("User deleted successfully");
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id));
    }
  };

  const handleDeleteSelected = () => {
    selectedUsers.forEach((id) => {
      dispatch(deleteUser(id));
    });
    setSelectedUsers([]);
    toast.success("Selected users deleted successfully");
  };

  return (
    <div className="w-full h-full">
      {/* Page Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-[#1F2937] mb-1">User Administration</h2>
          <p className="text-sm text-[#6B7280]">Govern user access, query capacities, roles, and allowed vector data pipelines</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {selectedUsers.length > 0 && (
            <Button
              variant="destructive"
              onClick={handleDeleteSelected}
              className="bg-[#DC2626] hover:bg-[#B91C1C] text-white"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Selected ({selectedUsers.length})
            </Button>
          )}
          <Button
            onClick={() => navigate("/admin/users/add")}
            className="bg-gradient-to-r from-[#0F766E] to-[#14B8A6] hover:from-[#0D5B54] hover:to-[#0F766E] text-white"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add New User
          </Button>
        </div>
      </div>

      {/* Filter Card */}
      <Card className="bg-white border-[#E5E7EB] p-4 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <Input
                type="search"
                placeholder="Search users by name, email, role or organization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 bg-[#F9FAFB] border-[#E5E7EB] rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#9CA3AF] hidden md:block" />
            <select
              value={orgFilter}
              onChange={(e) => setOrgFilter(e.target.value)}
              className="h-10 px-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-sm text-[#374151]"
            >
              <option value="all">All Organizations</option>
              {organizations.map(org => (
                <option key={org} value={org.toLowerCase()}>{org}</option>
              ))}
            </select>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-sm text-[#374151]"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </Card>

      {/* Table */}
      <Card className="bg-white border-[#E5E7EB] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#F3F4F6]">
                <TableHead className="w-12 py-3 pl-4">
                  <Checkbox
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onCheckedChange={toggleSelectAll}
                    className="border-[#0F766E] data-[state=checked]:bg-[#0F766E] data-[state=checked]:border-[#0F766E]"
                  />
                </TableHead>
                <TableHead className="text-[#6B7280] text-xs font-semibold min-w-[140px]">Name & Email</TableHead>
                <TableHead className="text-[#6B7280] text-xs font-semibold min-w-[130px]">Organization</TableHead>
                <TableHead className="text-[#6B7280] text-xs font-semibold min-w-[90px]">Role</TableHead>
                <TableHead className="text-[#6B7280] text-xs font-semibold min-w-[180px]">Access Period</TableHead>
                <TableHead className="text-[#6B7280] text-xs font-semibold min-w-[80px]">Status</TableHead>
                <TableHead className="text-[#6B7280] text-xs font-semibold min-w-[100px] text-right pr-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-[#6B7280]">
                    <UsersIcon className="w-10 h-10 text-[#9CA3AF] mx-auto mb-2" />
                    No users matching criteria found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} className="border-b border-[#F9FAFB] hover:bg-[#F9FAFB]/50 transition-colors">
                    <TableCell className="py-3 pl-4">
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={() => toggleUserSelection(user.id)}
                        className="border-[#0F766E] data-[state=checked]:bg-[#0F766E] data-[state=checked]:border-[#0F766E]"
                      />
                    </TableCell>
                    <TableCell className="py-3">
                      <div>
                        <p className="font-semibold text-[#1F2937] text-sm leading-tight">{user.name}</p>
                        <p className="text-xs text-[#9CA3AF] leading-tight">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-[#1F2937] text-xs font-semibold py-3">{user.organization}</TableCell>
                    <TableCell className="py-3">
                      <span className={`px-2 py-0.5 rounded text-xxs font-medium ${
                        user.role === "Owner" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                      }`}>
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell className="text-[#6B7280] text-xs py-3">{user.accessPeriod}</TableCell>
                    <TableCell className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xxs font-semibold border ${
                        user.status === "Active"
                          ? "bg-[#D1FAE5] text-[#059669] border-[#A7F3D0]"
                          : "bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]"
                      }`}>
                        {user.status}
                      </span>
                    </TableCell>
                    <TableCell className="py-3 pr-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/admin/users/edit/${user.id}`)}
                          className="text-[#0F766E] hover:text-[#0D5B54] hover:bg-[#CCFBF1] h-8 w-8 p-0"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
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
