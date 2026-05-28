import { createBrowserRouter } from "react-router";
import { Login } from "@/features/auth";
import { AdminLayout } from "@/shared/layouts";
import { ErrorBoundary } from "@/shared/components";
import { Dashboard } from "@/features/dashboard";
import {
  Organizations,
  CreateOrganization,
  ViewOrganization,
  OrganizationConfig
} from "@/features/organizations";
import { Users, AddUser, EditUser } from "@/features/users";
import { Resources, AddResource, EditResource } from "@/features/resources";
import { Requests } from "@/features/requests";
import { Billing } from "@/features/billing";
import { Settings } from "@/features/settings";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "organizations",
        element: <Organizations />,
      },
      {
        path: "organizations/create",
        element: <CreateOrganization />,
      },
      {
        path: "organizations/:id",
        element: <ViewOrganization />,
      },
      {
        path: "organizations/:id/edit",
        element: <OrganizationConfig defaultTab="general" />,
      },
      {
        path: "organizations/:id/config",
        element: <OrganizationConfig defaultTab="connectors" />,
      },
      {
        path: "users",
        element: <Users />,
      },
      {
        path: "users/add",
        element: <AddUser />,
      },
      {
        path: "users/edit/:id",
        element: <EditUser />,
      },
      {
        path: "resources",
        element: <Resources />,
      },
      {
        path: "resources/add",
        element: <AddResource />,
      },
      {
        path: "resources/edit/:id",
        element: <EditResource />,
      },
      {
        path: "requests",
        element: <Requests />,
      },
      {
        path: "billing",
        element: <Billing />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
    ],
  },
]);
