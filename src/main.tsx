import "./instrumentation";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import * as Sentry from "@sentry/react";
import { AppRoutes } from "./routes";
import { AuthProvider } from "./context/AuthContext";
import { MunicipalityProvider } from "./context/MunicipalityContext";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Sentry.ErrorBoundary
      fallback={({ resetError }) => (
        <main className="flex min-h-screen items-center justify-center bg-stone-50 px-5 text-center">
          <div className="max-w-md rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
            <h1 className="font-serif text-3xl font-bold text-emerald-950">Something went wrong</h1>
            <p className="mt-3 text-sm leading-6 text-stone-600">
              The error has been recorded. Reload the page to continue using WardWorks.
            </p>
            <button
              type="button"
              className="mt-6 rounded-lg bg-emerald-950 px-5 py-3 text-sm font-semibold text-white"
              onClick={() => {
                resetError();
                window.location.reload();
              }}
            >
              Reload page
            </button>
          </div>
        </main>
      )}
    >
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <MunicipalityProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </MunicipalityProvider>
        </AuthProvider>
      </QueryClientProvider>
    </Sentry.ErrorBoundary>
  </StrictMode>,
);
