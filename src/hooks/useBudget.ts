import { useQuery } from "@tanstack/react-query";
import { getMunicipalityBudget } from "../services/municipalityService";

export function useBudget(municipalityId: string) {
  return useQuery({
    queryKey: ["municipality-budget", municipalityId],
    queryFn: () => getMunicipalityBudget(municipalityId),
    enabled: Boolean(municipalityId),
  });
}
