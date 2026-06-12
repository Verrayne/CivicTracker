import { useQuery } from "@tanstack/react-query";
import { getBudgetAllocations, getRatesParameters } from "../services/budgetAllocationService";
import { getExpenditureSummary } from "../services/budgetV2Service";
import { getMunicipalImpactEstimates } from "../services/municipalityStatisticsService";
import type { MoneyGoesData } from "../types";

export function useWhereMoneyGoes(municipalityId: string) {
  return useQuery<MoneyGoesData>({
    queryKey: ["where-money-goes", municipalityId],
    queryFn: async () => {
      const [allocations, ratesParameters, impactEstimates, expenditure] = await Promise.all([
        getBudgetAllocations(municipalityId),
        getRatesParameters(municipalityId),
        getMunicipalImpactEstimates(municipalityId),
        getExpenditureSummary(municipalityId),
      ]);
      return {
        allocations,
        ratesParameters,
        impactEstimates,
        municipalityTotalBudget: expenditure.total,
      };
    },
    enabled: Boolean(municipalityId),
  });
}
