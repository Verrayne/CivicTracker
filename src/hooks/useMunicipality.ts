import { useQuery } from "@tanstack/react-query";
import { getMunicipalityOverview } from "../services/municipalityService";

export function useMunicipalityOverview(municipalityId: string) {
  return useQuery({
    queryKey: ["municipality-overview", municipalityId],
    queryFn: () => getMunicipalityOverview(municipalityId),
    enabled: Boolean(municipalityId),
  });
}
