import { useQuery } from "@tanstack/react-query";
import {
  getCapitalBudgetSummary,
  getCapitalProjects,
  getExpenditureSummary,
  getRevenueSummary,
} from "../services/budgetV2Service";

export function useRevenueBudget(municipalityId: string) {
  return useQuery({
    queryKey: ["budget-v2", "revenue", municipalityId],
    queryFn: () => getRevenueSummary(municipalityId),
    enabled: Boolean(municipalityId),
  });
}

export function useExpenditureBudget(municipalityId: string) {
  return useQuery({
    queryKey: ["budget-v2", "expenditure", municipalityId],
    queryFn: () => getExpenditureSummary(municipalityId),
    enabled: Boolean(municipalityId),
  });
}

export function useCapitalBudget(municipalityId: string) {
  return useQuery({
    queryKey: ["budget-v2", "capital", municipalityId],
    queryFn: async () => ({
      summary: await getCapitalBudgetSummary(municipalityId),
      projects: await getCapitalProjects(municipalityId),
    }),
    enabled: Boolean(municipalityId),
  });
}
