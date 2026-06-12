import { OperatingBudgetView } from "../../../components/municipality/budget-v2/OperatingBudgetView";
import { useMunicipality } from "../../../context/municipality";
import { useRevenueBudget } from "../../../hooks/useBudgetV2";

export function MunicipalityRevenuePage() {
  const { selectedMunicipalityId } = useMunicipality();
  return <OperatingBudgetView kind="Revenue" query={useRevenueBudget(selectedMunicipalityId)} />;
}
