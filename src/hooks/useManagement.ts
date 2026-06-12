import { useQuery } from "@tanstack/react-query";
import { getMunicipalityManagement } from "../services/municipalityService";

export function useManagement(municipalityId: string) {
  return useQuery({
    queryKey: ["municipality-management", municipalityId],
    queryFn: () => getMunicipalityManagement(municipalityId),
    enabled: Boolean(municipalityId),
  });
}
