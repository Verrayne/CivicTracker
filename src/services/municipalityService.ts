import { subMonths } from "date-fns";
import { supabase } from "../lib/supabase";
import { getExpenditureSummary } from "./budgetV2Service";
import type {
  MunicipalBudgetAllocation,
  MunicipalBudgetDocument,
  MunicipalBudgetSummary,
  MunicipalDepartment,
  MunicipalKpi,
  MunicipalOfficial,
  Municipality,
  MunicipalityBudgetData,
  MunicipalityIssueMetrics,
  MunicipalityManagementData,
  MunicipalityMonthlyTrend,
  MunicipalityOverviewData,
  MunicipalityPerformanceData,
} from "../types";

interface MunicipalityIssueRow {
  status: string;
  created_at: string;
  updated_at: string;
  issue_types: { name: string } | null;
}

function calculateIssueMetrics(issues: MunicipalityIssueRow[]): MunicipalityIssueMetrics {
  const resolvedIssues = issues.filter(({ status }) => status === "Resolved" || status === "Closed");
  const resolutionDays = resolvedIssues.map(({ created_at, updated_at }) =>
    Math.max(0, (new Date(updated_at).getTime() - new Date(created_at).getTime()) / 86_400_000),
  );

  return {
    total: issues.length,
    resolved: resolvedIssues.length,
    open: issues.length - resolvedIssues.length,
    resolutionRate: issues.length ? (resolvedIssues.length / issues.length) * 100 : 0,
    averageResolutionDays: resolutionDays.length
      ? resolutionDays.reduce((total, value) => total + value, 0) / resolutionDays.length
      : 0,
  };
}

async function getMunicipalityIssues(municipalityId: string): Promise<MunicipalityIssueRow[]> {
  const { data, error } = await supabase
    .from("issues")
    .select("status,created_at,updated_at,issue_types(name),wards!inner(municipality_id)")
    .eq("wards.municipality_id", municipalityId);
  if (error) throw error;
  return data as unknown as MunicipalityIssueRow[];
}

export async function getMunicipalityOverview(municipalityId: string): Promise<MunicipalityOverviewData> {
  const [municipalityResult, expenditure, issues] = await Promise.all([
    supabase.from("municipalities").select("id,name,province,website,employee_count").eq("id", municipalityId).single(),
    getExpenditureSummary(municipalityId),
    getMunicipalityIssues(municipalityId),
  ]);

  if (municipalityResult.error) throw municipalityResult.error;

  return {
    municipality: municipalityResult.data as Municipality,
    annualBudget: {
      amount: expenditure.total,
      financialYear: expenditure.financialYear,
    },
    issueMetrics: calculateIssueMetrics(issues),
  };
}

export async function getMunicipalityBudget(municipalityId: string): Promise<MunicipalityBudgetData> {
  const [summariesResult, documentsResult] = await Promise.all([
    supabase
      .from("municipal_budget_summary")
      .select("id,municipality_id,financial_year,total_revenue,total_expenditure,capital_budget,operating_budget,is_sample_data")
      .eq("municipality_id", municipalityId)
      .order("financial_year", { ascending: false }),
    supabase
      .from("municipal_budget_documents")
      .select("id,municipality_id,financial_year,title,document_url")
      .eq("municipality_id", municipalityId)
      .order("financial_year", { ascending: false }),
  ]);
  if (summariesResult.error) throw summariesResult.error;
  if (documentsResult.error) throw documentsResult.error;

  const summaries = summariesResult.data as MunicipalBudgetSummary[];
  const currentSummary = summaries[0] || null;
  let allocations: MunicipalBudgetAllocation[] = [];
  if (currentSummary) {
    const { data, error } = await supabase
      .from("municipal_budget_allocations")
      .select("id,budget_summary_id,category,amount,percentage")
      .eq("budget_summary_id", currentSummary.id)
      .order("percentage", { ascending: false });
    if (error) throw error;
    allocations = data as MunicipalBudgetAllocation[];
  }

  return {
    summaries,
    currentSummary,
    allocations,
    documents: documentsResult.data as MunicipalBudgetDocument[],
  };
}

export async function getMunicipalityManagement(municipalityId: string): Promise<MunicipalityManagementData> {
  const [departmentsResult, officialsResult] = await Promise.all([
    supabase
      .from("municipal_departments")
      .select("id,municipality_id,name,description")
      .eq("municipality_id", municipalityId)
      .order("name"),
    supabase
      .from("municipal_officials")
      .select(`
        id,department_id,full_name,position,email,profile_image_url,bio,responsibilities,manager_id,display_order,
        municipal_departments!inner(id,name,municipality_id)
      `)
      .eq("municipal_departments.municipality_id", municipalityId)
      .order("display_order"),
  ]);
  if (departmentsResult.error) throw departmentsResult.error;
  if (officialsResult.error) throw officialsResult.error;

  return {
    departments: departmentsResult.data as MunicipalDepartment[],
    officials: officialsResult.data as unknown as MunicipalOfficial[],
  };
}

function buildMonthlyTrends(issues: MunicipalityIssueRow[]): MunicipalityMonthlyTrend[] {
  const start = new Date();
  start.setDate(1);

  return Array.from({ length: 6 }, (_, index) => subMonths(start, 5 - index)).map((date) => {
    const month = date.toLocaleDateString("en-ZA", { month: "short", year: "2-digit" });
    const isSameMonth = (value: string) => {
      const candidate = new Date(value);
      return candidate.getFullYear() === date.getFullYear() && candidate.getMonth() === date.getMonth();
    };
    const created = issues.filter(({ created_at }) => isSameMonth(created_at));
    const resolved = issues.filter(({ status, updated_at }) =>
      (status === "Resolved" || status === "Closed") && isSameMonth(updated_at),
    );
    const resolutionDays = resolved.map(({ created_at, updated_at }) =>
      Math.max(0, (new Date(updated_at).getTime() - new Date(created_at).getTime()) / 86_400_000),
    );

    return {
      month,
      newIssues: created.length,
      resolvedIssues: resolved.length,
      averageResolutionDays: resolutionDays.length
        ? resolutionDays.reduce((total, value) => total + value, 0) / resolutionDays.length
        : 0,
    };
  });
}

export async function getMunicipalityPerformance(municipalityId: string): Promise<MunicipalityPerformanceData> {
  const [issues, kpisResult] = await Promise.all([
    getMunicipalityIssues(municipalityId),
    supabase
      .from("municipal_kpis")
      .select("id,municipality_id,department_name,kpi_name,target_value,actual_value,achievement_percentage,reporting_period,is_sample_data")
      .eq("municipality_id", municipalityId)
      .order("department_name"),
  ]);
  if (kpisResult.error) throw kpisResult.error;

  const resolved = issues.filter(({ status }) => status === "Resolved" || status === "Closed");
  const countResolved = (type: string) => resolved.filter(({ issue_types }) => issue_types?.name === type).length;

  return {
    issueMetrics: calculateIssueMetrics(issues),
    serviceMetrics: {
      "Potholes Resolved": countResolved("Pothole"),
      "Streetlights Repaired": countResolved("Streetlight"),
      "Water Leaks Fixed": countResolved("Water Leak"),
      "Illegal Dumping Cases Cleared": countResolved("Illegal Dumping"),
    },
    monthlyTrends: buildMonthlyTrends(issues),
    kpis: kpisResult.data as MunicipalKpi[],
  };
}
