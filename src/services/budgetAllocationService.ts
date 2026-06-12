import { supabase } from "../lib/supabase";
import type { BudgetAllocationPercentage, MunicipalRatesParameters } from "../types";

export async function getBudgetAllocations(municipalityId: string): Promise<BudgetAllocationPercentage[]> {
  const { data, error } = await supabase
    .from("budget_allocation_percentages")
    .select("id,allocation_name,percentage,sort_order,source_note,financial_years!inner(label,municipality_id)")
    .eq("financial_years.municipality_id", municipalityId)
    .order("sort_order");
  if (error) throw error;
  return (data || []).map((row) => ({
    id: row.id,
    allocationName: row.allocation_name,
    percentage: Number(row.percentage),
    sortOrder: row.sort_order,
    financialYear: (row.financial_years as unknown as { label: string }).label,
    sourceNote: row.source_note,
  }));
}

export async function getRatesParameters(municipalityId: string): Promise<MunicipalRatesParameters> {
  const { data, error } = await supabase
    .from("municipal_rates_parameters")
    .select("tariff_cents_per_rand,valuation_reduction,source_url,financial_years!inner(label,municipality_id)")
    .eq("financial_years.municipality_id", municipalityId)
    .eq("property_type", "Residential")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();
  if (error) throw error;
  return {
    tariffCentsPerRand: Number(data.tariff_cents_per_rand),
    valuationReduction: Number(data.valuation_reduction),
    financialYear: (data.financial_years as unknown as { label: string }).label,
    sourceUrl: data.source_url,
  };
}
