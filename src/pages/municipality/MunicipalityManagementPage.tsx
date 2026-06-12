import { useState } from "react";
import { ErrorState, LoadingSpinner } from "../../components/feedback/States";
import { MunicipalityShell, SampleDataNotice } from "../../components/municipality/MunicipalityShell";
import { OfficialProfileDrawer } from "../../components/municipality/OfficialProfileDrawer";
import { OrganogramNode } from "../../components/municipality/OrganogramNode";
import { useMunicipality } from "../../context/municipality";
import { useManagement } from "../../hooks/useManagement";
import type { MunicipalOfficial } from "../../types";

export function MunicipalityManagementPage() {
  const { selectedMunicipalityId } = useMunicipality();
  const query = useManagement(selectedMunicipalityId);
  const [selectedOfficial, setSelectedOfficial] = useState<MunicipalOfficial | null>(null);

  return (
    <MunicipalityShell title="Municipal management" description="Explore the political and administrative leadership responsible for running the municipality.">
      {query.isLoading ? <LoadingSpinner label="Loading management structure..." /> : query.isError || !query.data ? (
        <ErrorState message={query.error?.message || "Management information is unavailable."} retry={() => query.refetch()} />
      ) : (
        <>
          <SampleDataNotice />
          <div className="rounded-3xl border bg-white p-5 shadow-card sm:p-8">
            <div className="mx-auto max-w-5xl">
              <div className="grid gap-5 md:grid-cols-3">
                {query.data.officials.filter(({ manager_id }) => !manager_id).map((official) => (
                  <OrganogramNode key={official.id} official={official} onClick={() => setSelectedOfficial(official)} />
                ))}
              </div>
              <div className="mx-auto h-12 w-px bg-civic-200" />
              <div className="relative">
                <div className="absolute left-1/2 top-0 hidden h-px w-[84%] -translate-x-1/2 bg-civic-200 lg:block" />
                <div className="grid gap-5 pt-5 sm:grid-cols-2 lg:grid-cols-3">
                  {query.data.officials.filter(({ manager_id }) => Boolean(manager_id)).map((official) => (
                    <div key={official.id} className="relative pt-4 lg:pt-5">
                      <span className="absolute left-1/2 top-0 hidden h-5 w-px bg-civic-200 lg:block" />
                      <OrganogramNode official={official} onClick={() => setSelectedOfficial(official)} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <section className="mt-10">
            <h2 className="font-display text-3xl font-bold text-civic-950">Departments</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {query.data.departments.map((department) => (
                <div key={department.id} className="rounded-2xl border bg-white p-5">
                  <h3 className="font-display text-xl font-bold text-civic-950">{department.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-stone-500">{department.description}</p>
                </div>
              ))}
            </div>
          </section>
          <OfficialProfileDrawer official={selectedOfficial} onClose={() => setSelectedOfficial(null)} />
        </>
      )}
    </MunicipalityShell>
  );
}
