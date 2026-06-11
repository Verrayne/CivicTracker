import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
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
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MunicipalityProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </MunicipalityProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
