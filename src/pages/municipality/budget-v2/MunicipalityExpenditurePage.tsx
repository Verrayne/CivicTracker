import { OperatingBudgetView } from "../../../components/municipality/budget-v2/OperatingBudgetView";
import { useMunicipality } from "../../../context/municipality";
import { useExpenditureBudget } from "../../../hooks/useBudgetV2";

export function MunicipalityExpenditurePage() {
  const { selectedMunicipalityId } = useMunicipality();
  return <OperatingBudgetView kind="Expenditure" query={useExpenditureBudget(selectedMunicipalityId)} />;
}
