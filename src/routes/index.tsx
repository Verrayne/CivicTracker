import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import * as Sentry from "@sentry/react";
import { Layout } from "../components/layout/Layout";
import { LoadingSpinner } from "../components/feedback/States";
import { AdminRoute } from "../components/admin/AdminRoute";

const HomePage = lazy(() => import("../pages/HomePage").then((module) => ({ default: module.HomePage })));
const IssueDetailPage = lazy(() => import("../pages/IssueDetailPage").then((module) => ({ default: module.IssueDetailPage })));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage").then((module) => ({ default: module.NotFoundPage })));
const ReportIssuePage = lazy(() => import("../pages/ReportIssuePage").then((module) => ({ default: module.ReportIssuePage })));
const ReportsPage = lazy(() => import("../pages/ReportsPage").then((module) => ({ default: module.ReportsPage })));
const SuccessPage = lazy(() => import("../pages/SuccessPage").then((module) => ({ default: module.SuccessPage })));
const AdminLoginPage = lazy(() => import("../pages/admin/AdminLoginPage").then((module) => ({ default: module.AdminLoginPage })));
const AdminDashboardPage = lazy(() => import("../pages/admin/AdminDashboardPage").then((module) => ({ default: module.AdminDashboardPage })));
const MunicipalityOverviewPage = lazy(() => import("../pages/municipality/MunicipalityOverviewPage").then((module) => ({ default: module.MunicipalityOverviewPage })));
const MunicipalityBudgetPage = lazy(() => import("../pages/municipality/MunicipalityBudgetPage").then((module) => ({ default: module.MunicipalityBudgetPage })));
const MunicipalityManagementPage = lazy(() => import("../pages/municipality/MunicipalityManagementPage").then((module) => ({ default: module.MunicipalityManagementPage })));
const MunicipalityPerformancePage = lazy(() => import("../pages/municipality/MunicipalityPerformancePage").then((module) => ({ default: module.MunicipalityPerformancePage })));
const MunicipalityRevenuePage = lazy(() => import("../pages/municipality/budget-v2/MunicipalityRevenuePage").then((module) => ({ default: module.MunicipalityRevenuePage })));
const MunicipalityExpenditurePage = lazy(() => import("../pages/municipality/budget-v2/MunicipalityExpenditurePage").then((module) => ({ default: module.MunicipalityExpenditurePage })));
const MunicipalityCapitalPage = lazy(() => import("../pages/municipality/budget-v2/MunicipalityCapitalPage").then((module) => ({ default: module.MunicipalityCapitalPage })));
const WhereYourMoneyGoesPage = lazy(() => import("../pages/municipality/WhereYourMoneyGoesPage").then((module) => ({ default: module.WhereYourMoneyGoesPage })));
const SentryRoutes = Sentry.withSentryReactRouterV7Routing(Routes);

export function AppRoutes() {
  return (
    <Suspense fallback={<LoadingSpinner label="Loading page..." />}>
      <SentryRoutes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/report" element={<ReportIssuePage />} />
          <Route path="/report/success/:issueNumber" element={<SuccessPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/reports/:issueNumber" element={<IssueDetailPage />} />
          <Route path="/municipality" element={<MunicipalityOverviewPage />} />
          <Route path="/municipality/budget" element={<MunicipalityBudgetPage />} />
          <Route path="/municipality/budget-v2" element={<Navigate to="/municipality/budget-v2/revenue" replace />} />
          <Route path="/municipality/budget-v2/revenue" element={<MunicipalityRevenuePage />} />
          <Route path="/municipality/budget-v2/expenditure" element={<MunicipalityExpenditurePage />} />
          <Route path="/municipality/budget-v2/capital" element={<MunicipalityCapitalPage />} />
          <Route path="/municipality/management" element={<MunicipalityManagementPage />} />
          <Route path="/municipality/performance" element={<MunicipalityPerformancePage />} />
          <Route path="/municipality/where-your-money-goes" element={<WhereYourMoneyGoesPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </SentryRoutes>
    </Suspense>
  );
}
