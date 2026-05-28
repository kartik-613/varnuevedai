import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "@/shared/api/apiClient";

export interface Resource {
  id: number;
  organisationId: number;
  organisationName: string;
  dataSourceOrgId: number | null;
  storageLimit: number;
  storageLimitGB: string;
  subscriptionPlan: string;
  userLimit: number;
  accessStart: string;
  accessEnd: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ResourcesState {
  resources: Resource[];
  loading: boolean;
  error: string | null;
}

const initialState: ResourcesState = {
  resources: [],
  loading: false,
  error: null,
};

// ── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchResources = createAsyncThunk(
  "resources/fetchResources",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/dashboard/resources");
      return (response as any).data as Resource[];
    } catch (err: any) {
      console.warn("API /dashboard/resources fetch failed:", err.message);
      return rejectWithValue(err.message);
    }
  }
);

export interface AddResourcePayload {
  organisationId: number;
  dataSourceOrgId?: number | null;
  storageLimitGB: string;
  subscriptionPlan: string;
  userLimit: number;
  accessStart: string;
  accessEnd: string;
}

export interface UpdateResourcePayload {
  id: number;
  organisationId: number;
  dataSourceOrgId?: number | null;
  storageLimitGB: string;
  subscriptionPlan: string;
  userLimit: number;
  accessStart: string;
  accessEnd: string;
}

export const addResource = createAsyncThunk(
  "resources/addResource",
  async (payload: AddResourcePayload, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/dashboard/resources", payload);
      return (response as any).data as Resource;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateResource = createAsyncThunk(
  "resources/updateResource",
  async (payload: UpdateResourcePayload, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/dashboard/resources/${payload.id}`, payload);
      return (response as any).data as Resource;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const deleteResource = createAsyncThunk(
  "resources/deleteResource",
  async (id: number, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/dashboard/resources/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const resourcesSlice = createSlice({
  name: "resources",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchResources.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchResources.fulfilled, (state, action) => {
        state.loading = false;
        state.resources = action.payload;
      })
      .addCase(fetchResources.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Add
      .addCase(addResource.fulfilled, (state, action) => {
        state.resources.push(action.payload);
      })
      // Update
      .addCase(updateResource.fulfilled, (state, action) => {
        state.resources = state.resources.map((r) =>
          r.id === action.payload.id ? { ...r, ...action.payload } : r
        );
      })
      // Delete
      .addCase(deleteResource.fulfilled, (state, action) => {
        state.resources = state.resources.filter((r) => r.id !== action.payload);
      });
  },
});

export const resourcesReducer = resourcesSlice.reducer;
