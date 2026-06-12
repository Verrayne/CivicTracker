import { supabase } from "../lib/supabase";
import type {
  BudgetScenario,
  BudgetV2Fact,
  BudgetV2Summary,
  CapitalBudgetSummary,
  CapitalFundingFact,
  CapitalProject,
  DepartmentBudget,
} from "../types";

interface FactRow {
  id: string;
  scenario: BudgetScenario;
  amount: number;
  source_url: string | null;
  financial_years: { label: string; sort_order: number; municipality_id: string } | null;
  category: { name: string; sort_order: number } | null;
}

function normalizeFacts(rows: FactRow[]): BudgetV2Fact[] {
  return rows
    .filter((row) => row.financial_years && row.category)
    .map((row) => ({
      id: row.id,
      financialYear: row.financial_years!.label,
      scenario: row.scenario,
      category: row.category!.name,
      amount: Number(row.amount),
      sortOrder: row.category!.sort_order,
      sourceUrl: row.source_url,
    }));
}

async function getFacts(
  municipalityId: string,
  factTable: "revenue_facts" | "expenditure_facts",
  categoryRelation: "revenue_categories" | "expenditure_categories",
): Promise<BudgetV2Fact[]> {
  const { data, error } = await supabase
    .from(factTable)
    .select(`
      id,scenario,amount,source_url,
      financial_years!inner(label,sort_order,municipality_id),
      category:${categoryRelation}!inner(name,sort_order)
    `)
    .eq("financial_years.municipality_id", municipalityId)
    .order("sort_order", { referencedTable: "financial_years", ascending: true })
    .order("sort_order", { referencedTable: categoryRelation, ascending: true });
  if (error) throw error;
  return normalizeFacts(data as unknown as FactRow[]);
}

function buildSummary(facts: BudgetV2Fact[], totalCategory: string): BudgetV2Summary {
  const totals = facts.filter(({ category }) => category === totalCategory);
  const current = totals.find(({ scenario }) => scenario === "Budget") || totals.at(-1);
  if (!current) throw new Error("Budget data is unavailable.");
  const currentIndex = totals.findIndex(({ id }) => id === current.id);
  const previous = currentIndex > 0 ? totals[currentIndex - 1] : null;

  return {
    financialYear: current.financialYear,
    scenario: current.scenario,
    total: current.amount,
    previousTotal: previous?.amount ?? null,
    categories: facts.filter(({ financialYear, category }) =>
      financialYear === current.financialYear && category !== totalCategory),
    allFacts: facts.filter(({ category }) => category !== totalCategory),
    trend: totals,
    sourceUrl: current.sourceUrl,
  };
}

export async function getRevenueSummary(municipalityId: string): Promise<BudgetV2Summary> {
  return buildSummary(await getFacts(municipalityId, "revenue_facts", "revenue_categories"), "Total Revenue");
}

export async function getRevenueTrend(municipalityId: string): Promise<BudgetV2Fact[]> {
  return (await getRevenueSummary(municipalityId)).trend;
}

export async function getExpenditureSummary(municipalityId: string): Promise<BudgetV2Summary> {
  return buildSummary(await getFacts(municipalityId, "expenditure_facts", "expenditure_categories"), "Total Expenditure");
}

export async function getExpenditureTrend(municipalityId: string): Promise<BudgetV2Fact[]> {
  return (await getExpenditureSummary(municipalityId)).trend;
}

export async function getDepartmentBudgets(municipalityId: string): Promise<DepartmentBudget[]> {
  const { data, error } = await supabase
    .from("department_budgets")
    .select(`
      id,department_id,amount,source_url,
      departments!inner(name,municipality_id),
      financial_years!inner(label,sort_order,municipality_id)
    `)
    .eq("departments.municipality_id", municipalityId)
    .eq("financial_years.municipality_id", municipalityId)
    .order("amount", { ascending: false });
  if (error) throw error;
  return (data || []).map((row) => ({
    id: row.id,
    departmentId: row.department_id,
    department: (row.departments as unknown as { name: string }).name,
    financialYear: (row.financial_years as unknown as { label: string }).label,
    amount: Number(row.amount),
    sourceUrl: row.source_url,
  }));
}

export async function getCapitalProjects(municipalityId: string): Promise<CapitalProject[]> {
  const { data, error } = await supabase
    .from("capital_projects")
    .select("id,name,description,location,budget_amount,status,source_url,departments(name),financial_years!inner(label,municipality_id)")
    .eq("municipality_id", municipalityId)
    .eq("financial_years.municipality_id", municipalityId)
    .order("budget_amount", { ascending: false });
  if (error) throw error;
  return (data || []).map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    location: row.location,
    budgetAmount: Number(row.budget_amount),
    status: row.status,
    department: (row.departments as unknown as { name: string } | null)?.name || null,
    financialYear: (row.financial_years as unknown as { label: string }).label,
    sourceUrl: row.source_url,
  }));
}

export async function getCapitalBudgetSummary(municipalityId: string): Promise<CapitalBudgetSummary> {
  const [departmentBudgets, projects, fundingResult] = await Promise.all([
    getDepartmentBudgets(municipalityId),
    getCapitalProjects(municipalityId),
    supabase
      .from("capital_funding_facts")
      .select("id,amount,source_url,capital_funding_sources!inner(name,sort_order,municipality_id),financial_years!inner(label,sort_order,municipality_id)")
      .eq("capital_funding_sources.municipality_id", municipalityId)
      .eq("financial_years.municipality_id", municipalityId),
  ]);
  if (fundingResult.error) throw fundingResult.error;

  const fundingSources: CapitalFundingFact[] = (fundingResult.data || []).map((row) => ({
    id: row.id,
    source: (row.capital_funding_sources as unknown as { name: string }).name,
    financialYear: (row.financial_years as unknown as { label: string }).label,
    amount: Number(row.amount),
    sortOrder: (row.capital_funding_sources as unknown as { sort_order: number }).sort_order,
    sourceUrl: row.source_url,
  }));
  const currentYear = fundingSources.find(({ financialYear }) => financialYear === "2026/27")?.financialYear
    || departmentBudgets[0]?.financialYear
    || "";
  const currentDepartments = departmentBudgets.filter(({ financialYear }) => financialYear === currentYear);
  const currentFunding = fundingSources.filter(({ financialYear }) => financialYear === currentYear);

  return {
    financialYear: currentYear,
    total: currentFunding.reduce((sum, item) => sum + item.amount, 0),
    largestDepartment: currentDepartments[0] || null,
    projectCount: projects.filter(({ financialYear }) => financialYear === currentYear).length,
    departmentBudgets: currentDepartments,
    fundingSources: currentFunding,
    sourceUrl: currentFunding[0]?.sourceUrl || null,
  };
}
