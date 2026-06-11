import { createContext, useContext } from "react";
import type { Municipality } from "../types";

export interface MunicipalityContextValue {
  municipalities: Municipality[];
  selectedMunicipality: Municipality | null;
  selectedMunicipalityId: string;
  setSelectedMunicipalityId: (id: string) => void;
  loading: boolean;
}

export const MunicipalityContext = createContext<MunicipalityContextValue | undefined>(undefined);

export function useMunicipality() {
  const context = useContext(MunicipalityContext);
  if (!context) throw new Error("useMunicipality must be used within MunicipalityProvider");
  return context;
}
