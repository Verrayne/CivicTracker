import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { getMunicipalities } from "../services/issues";
import { MunicipalityContext, type MunicipalityContextValue } from "./municipality";

const STORAGE_KEY = "wardworks-municipality";

export function MunicipalityProvider({ children }: { children: ReactNode }) {
  const query = useQuery({ queryKey: ["municipalities"], queryFn: getMunicipalities });
  const [selectedMunicipalityId, setSelectedMunicipalityId] = useState(
    () => localStorage.getItem(STORAGE_KEY) || "",
  );

  useEffect(() => {
    if (!query.data?.length) return;
    const selectionExists = query.data.some(({ id }) => id === selectedMunicipalityId);
    if (!selectionExists) {
      const defaultMunicipality = query.data.find(({ name }) => name.includes("Tshwane")) || query.data[0];
      setSelectedMunicipalityId(defaultMunicipality.id);
    }
  }, [query.data, selectedMunicipalityId]);

  useEffect(() => {
    if (selectedMunicipalityId) localStorage.setItem(STORAGE_KEY, selectedMunicipalityId);
  }, [selectedMunicipalityId]);

  const value = useMemo<MunicipalityContextValue>(() => ({
    municipalities: query.data || [],
    selectedMunicipality: query.data?.find(({ id }) => id === selectedMunicipalityId) || null,
    selectedMunicipalityId,
    setSelectedMunicipalityId,
    loading: query.isLoading,
  }), [query.data, query.isLoading, selectedMunicipalityId]);

  return <MunicipalityContext.Provider value={value}>{children}</MunicipalityContext.Provider>;
}
