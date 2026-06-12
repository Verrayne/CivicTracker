import { supabase } from "../lib/supabase";
import type { MunicipalImpactEstimate } from "../types";

export async function getMunicipalImpactEstimates(municipalityId: string): Promise<MunicipalImpactEstimate[]> {
  const { data, error } = await supabase
    .from("municipal_impact_estimates")
    .select("id,insight_name,unit_label,estimated_cost_per_unit,icon_name,sort_order")
    .eq("municipality_id", municipalityId)
    .order("sort_order");
  if (error) throw error;
  return (data || []).map((row) => ({
    id: row.id,
    insightName: row.insight_name,
    unitLabel: row.unit_label,
    estimatedCostPerUnit: Number(row.estimated_cost_per_unit),
    iconName: row.icon_name,
    sortOrder: row.sort_order,
  }));
}
