export interface InputConfig {
  id: string;
  label: string;
  type: 'number' | 'percentage' | 'currency';
  defaultValue: number;
  min?: number;
  max?: number;
  tooltip: string;
  advanced?: boolean;
}

export interface ROIResults {
  currentMonthlyCost: number;
  newMonthlyCost: number;
  monthlySavings: number;
  annualSavings: number;
  roiPercent: number;
  paybackMonths: number;
  hoursReclaimedPerMonth: number;
  currentErrorRate: number;
  newErrorRate: number;
  platformMonthlyFee: number;
  implementationCost: number;
  fteEquivalent?: number;
}
