import { useQuery } from "@tanstack/react-query";
import { getMunicipalityPerformance } from "../services/municipalityService";

export function usePerformance(municipalityId: string) {
  return useQuery({
    queryKey: ["municipality-performance", municipalityId],
    queryFn: () => getMunicipalityPerformance(municipalityId),
    enabled: Boolean(municipalityId),
  });
}
