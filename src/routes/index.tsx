import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { Layout } from "../components/layout/Layout";
import { LoadingSpinner } from "../components/feedback/States";

const HomePage = lazy(() => import("../pages/HomePage").then((module) => ({ default: module.HomePage })));
const IssueDetailPage = lazy(() => import("../pages/IssueDetailPage").then((module) => ({ default: module.IssueDetailPage })));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage").then((module) => ({ default: module.NotFoundPage })));
const ReportIssuePage = lazy(() => import("../pages/ReportIssuePage").then((module) => ({ default: module.ReportIssuePage })));
const ReportsPage = lazy(() => import("../pages/ReportsPage").then((module) => ({ default: module.ReportsPage })));
const SuccessPage = lazy(() => import("../pages/SuccessPage").then((module) => ({ default: module.SuccessPage })));

export function AppRoutes() {
  return (
    <Suspense fallback={<LoadingSpinner label="Loading page..." />}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/report" element={<ReportIssuePage />} />
          <Route path="/report/success/:issueNumber" element={<SuccessPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/reports/:issueNumber" element={<IssueDetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
