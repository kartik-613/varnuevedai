import { useRouteError, isRouteErrorResponse } from "react-router";
import { Button } from "./ui/button";
import { AlertTriangle } from "lucide-react";

export default function ErrorBoundary() {
  const error = useRouteError();

  let errorMessage: string;

  if (isRouteErrorResponse(error)) {
    errorMessage = error.statusText || error.data?.message || "An error occurred";
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else {
    errorMessage = "An unexpected error occurred";
  }

  return (
    <div className="min-h-screen bg-[#F8F9FC] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <AlertTriangle className="w-16 h-16 text-[#DC2626] mx-auto mb-4" />
        <h1 className="text-2xl font-semibold text-[#1F2937] mb-2">Oops! Something went wrong</h1>
        <p className="text-[#6B7280] mb-6">{errorMessage}</p>
        <Button
          onClick={() => window.location.href = "/"}
          className="bg-gradient-to-r from-[#0F766E] to-[#14B8A6] hover:from-[#0D5B54] hover:to-[#0F766E] text-white"
        >
          Go to Login
        </Button>
      </div>
    </div>
  );
}
