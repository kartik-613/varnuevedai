import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { apiClient } from "@/shared/api/apiClient";

export interface User {
  id: string;
  name: string;
  email: string;
  organization: string;
  role: string;
  accessPeriod: string;
  maxDataSize: string;
  allowedSources: string[];
  usage: string;
  status: "Active" | "Inactive" | "Suspended";
  accessFrom?: string;
  accessTo?: string;
}

interface UsersState {
  users: User[];
  loading: boolean;
  error: string | null;
}

const initialUsers: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    organization: "Acme Corporation",
    role: "Owner",
    accessPeriod: "2026-01-15 to 2026-12-31",
    maxDataSize: "512 MB",
    allowedSources: ["PDF", "CSV", "TXT"],
    usage: "320 MB (62%)",
    status: "Active",
    accessFrom: "2026-01-15",
    accessTo: "2026-12-31"
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    organization: "TechStart Inc",
    role: "Developer",
    accessPeriod: "2026-02-10 to 2026-08-15",
    maxDataSize: "1.0 GB",
    allowedSources: ["PDF", "CSV", "JSON"],
    usage: "450 MB (43%)",
    status: "Active",
    accessFrom: "2026-02-10",
    accessTo: "2026-08-15"
  },
  {
    id: "3",
    name: "Bob Miller",
    email: "bob@acme.com",
    organization: "Acme Corporation",
    role: "Developer",
    accessPeriod: "2026-02-10 to 2026-10-20",
    maxDataSize: "2.0 GB",
    allowedSources: ["PDF", "CSV"],
    usage: "110 MB (5%)",
    status: "Active",
    accessFrom: "2026-02-10",
    accessTo: "2026-10-20"
  },
  {
    id: "4",
    name: "Sarah Connor",
    email: "sarah@techstart.com",
    organization: "TechStart Inc",
    role: "Owner",
    accessPeriod: "2026-03-15 to 2026-09-15",
    maxDataSize: "1.0 GB",
    allowedSources: ["DOCX", "XLSX", "PDF"],
    usage: "80 MB (8%)",
    status: "Inactive",
    accessFrom: "2026-03-15",
    accessTo: "2026-09-15"
  },
  {
    id: "5",
    name: "Bruce Wayne",
    email: "bruce@globalsolutions.com",
    organization: "Global Solutions",
    role: "Owner",
    accessPeriod: "2026-01-01 to 2026-12-31",
    maxDataSize: "5.0 GB",
    allowedSources: ["PDF", "CSV", "TXT", "JSON", "DOCX", "XLSX"],
    usage: "2.8 GB (56%)",
    status: "Active",
    accessFrom: "2026-01-01",
    accessTo: "2026-12-31"
  }
];

const initialState: UsersState = {
  users: [],
  loading: false,
  error: null,
};

// Async Thunks using Axios API client
export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/dashboard/users");
      return (response as any).data as User[];
    } catch (err: any) {
      console.warn("API `/dashboard/users` not available, falling back to mock data. Error:", err.message);
      return initialUsers;
    }
  }
);

export const addUser = createAsyncThunk(
  "users/addUser",
  async (newUser: Omit<User, "id" | "usage" | "accessPeriod">, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/dashboard/users", newUser);
      return (response as any).data as User;
    } catch (err: any) {
      console.warn("API post `/dashboard/users` not available, falling back to local simulation. Error:", err.message);
      const formattedAccess = `${newUser.accessFrom || ""} to ${newUser.accessTo || ""}`;
      return {
        ...newUser,
        id: String(Math.floor(Math.random() * 1000) + 6),
        accessPeriod: formattedAccess,
        usage: "0 MB (0%)"
      } as User;
    }
  }
);

export const updateUser = createAsyncThunk(
  "users/updateUser",
  async (updatedUser: Partial<User> & { id: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/dashboard/users/${updatedUser.id}`, updatedUser);
      return (response as any).data as User;
    } catch (err: any) {
      console.warn(`API put \`/dashboard/users/${updatedUser.id}\` not available, falling back to local simulation. Error:`, err.message);
      if (updatedUser.accessFrom && updatedUser.accessTo) {
        updatedUser.accessPeriod = `${updatedUser.accessFrom} to ${updatedUser.accessTo}`;
      }
      return updatedUser;
    }
  }
);

export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (id: string, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/dashboard/users/${id}`);
      return id;
    } catch (err: any) {
      console.warn(`API delete \`/dashboard/users/${id}\` not available, falling back to local simulation. Error:`, err.message);
      return id;
    }
  }
);

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Add User
      .addCase(addUser.fulfilled, (state, action) => {
        state.users.push(action.payload);
      })
      // Update User
      .addCase(updateUser.fulfilled, (state, action) => {
        state.users = state.users.map((u) =>
          u.id === action.payload.id ? { ...u, ...action.payload } : u
        );
      })
      // Delete User
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u.id !== action.payload);
      });
  },
});

export const usersReducer = usersSlice.reducer;
