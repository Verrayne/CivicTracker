import type { ContributionEstimate, MunicipalRatesParameters } from "../types";

export function calculateFromMonthlyRates(monthlyRates: number): ContributionEstimate {
  const monthlyContribution = Math.max(0, monthlyRates);
  return {
    monthlyContribution,
    annualContribution: monthlyContribution * 12,
  };
}

export function calculateFromPropertyValuation(
  propertyValuation: number,
  parameters: MunicipalRatesParameters,
): ContributionEstimate {
  const rateableValue = Math.max(0, propertyValuation - parameters.valuationReduction);
  const annualContribution = rateableValue * (parameters.tariffCentsPerRand / 100);
  return {
    annualContribution,
    monthlyContribution: annualContribution / 12,
  };
}
