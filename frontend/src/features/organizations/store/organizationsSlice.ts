import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "@/shared/api/apiClient";

export interface Organization {
  id: string;
  name: string;
  plan: string;
  users: number;
  usage: string;
  expiry: string;
  status: "active" | "expired" | "pending";
  email?: string;
  contactPerson?: string;
  createdAt?: string;
  userLimit?: number;
  storageLimit?: number;
  currentUsers?: number;
  currentStorage?: number;
  accessFrom?: string;
  accessTo?: string;
}

interface OrganizationsState {
  organizations: Organization[];
  loading: boolean;
  error: string | null;
}

const initialState: OrganizationsState = {
  organizations: [],
  loading: false,
  error: null,
};

// ── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchOrganizations = createAsyncThunk(
  "organizations/fetchOrganizations",
  async (_, { rejectWithValue }) => {
    try {
      // apiClient interceptor returns response.data = { success, data, message }
      const response = await apiClient.get("/organizations");
      return ((response as any).data || response) as Organization[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const createOrganization = createAsyncThunk(
  "organizations/createOrganization",
  async (newOrg: Omit<Organization, "id" | "usage">, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/organizations", newOrg);
      return ((response as any).data || response) as Organization;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateOrganizationConfig = createAsyncThunk(
  "organizations/updateOrganizationConfig",
  async (updatedOrg: Partial<Organization> & { id: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/organizations/${updatedOrg.id}`, updatedOrg);
      return ((response as any).data || response) as Organization;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const deleteOrganization = createAsyncThunk(
  "organizations/deleteOrganization",
  async (id: string, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/organizations/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const organizationsSlice = createSlice({
  name: "organizations",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Organizations
      .addCase(fetchOrganizations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrganizations.fulfilled, (state, action) => {
        state.loading = false;
        state.organizations = action.payload;
      })
      .addCase(fetchOrganizations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Organization
      .addCase(createOrganization.fulfilled, (state, action) => {
        state.organizations.push(action.payload);
      })
      // Update Organization Config
      .addCase(updateOrganizationConfig.fulfilled, (state, action) => {
        state.organizations = state.organizations.map((org) =>
          org.id === action.payload.id ? { ...org, ...action.payload } : org
        );
      })
      // Delete Organization
      .addCase(deleteOrganization.fulfilled, (state, action) => {
        state.organizations = state.organizations.filter((org) => org.id !== action.payload);
      });
  },
});

export const organizationsReducer = organizationsSlice.reducer;
