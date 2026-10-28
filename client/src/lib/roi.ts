import type { ROIResults } from './types';

/** Hours in a working month used to convert reclaimed hours into FTE capacity. */
export const HOURS_PER_FTE_MONTH = 160;

/** A workflow before and after an agent, expressed in monthly hours and monthly risk cost. */
export interface WorkflowModel {
  /** Manual hours per month today. */
  currentHours: number;
  /** Monthly cost of errors, rework, penalties or fails today. */
  currentRiskCost: number;
  /** Human hours per month with the agent (exceptions plus review). */
  newHours: number;
  /** Monthly cost of errors, rework, penalties or fails with the agent. */
  newRiskCost: number;
  /** Fully loaded hourly cost of the people doing the work. */
  hourlyRate: number;
  currentErrorRate: number;
  newErrorRate: number;
}

export interface AgentCosts {
  /** Recurring cost of running the agent per month (licence, compute, support). */
  platformMonthlyFee: number;
  /** One-time cost to implement: integration, testing, change management. */
  implementationCost: number;
}

/**
 * Hours per month once an agent handles a share of the volume.
 * Items the agent does not handle keep their manual time; items it does handle
 * still get a short human review.
 */
export function hoursWithAgent(
  volumePerMonth: number,
  manualMinutesPerItem: number,
  automationRate: number,
  reviewMinutesPerItem: number,
): number {
  const manual = volumePerMonth * (1 - automationRate) * manualMinutesPerItem;
  const review = volumePerMonth * automationRate * reviewMinutesPerItem;
  return (manual + review) / 60;
}

export function fteEquivalent(hoursReclaimedPerMonth: number): number {
  return Math.round((hoursReclaimedPerMonth / HOURS_PER_FTE_MONTH) * 10) / 10;
}

/** Turns a before/after workflow model and the agent's costs into the ROI summary. */
export function computeROI(model: WorkflowModel, costs: AgentCosts): ROIResults {
  const currentMonthlyCost = model.currentHours * model.hourlyRate + model.currentRiskCost;
  const newMonthlyCost =
    model.newHours * model.hourlyRate + model.newRiskCost + costs.platformMonthlyFee;
  const monthlySavings = currentMonthlyCost - newMonthlyCost;
  const annualSavings = monthlySavings * 12;
  // First-year ROI: net benefit after implementation, over everything spent in year one.
  const firstYearInvestment = costs.implementationCost + costs.platformMonthlyFee * 12;
  const roiPercent =
    firstYearInvestment > 0
      ? ((annualSavings - costs.implementationCost) / firstYearInvestment) * 100
      : 0;
  const paybackMonths = monthlySavings > 0 ? costs.implementationCost / monthlySavings : 0;
  const hoursReclaimedPerMonth = model.currentHours - model.newHours;

  return {
    currentMonthlyCost,
    newMonthlyCost,
    monthlySavings,
    annualSavings,
    roiPercent,
    paybackMonths,
    hoursReclaimedPerMonth,
    currentErrorRate: model.currentErrorRate,
    newErrorRate: model.newErrorRate,
    platformMonthlyFee: costs.platformMonthlyFee,
    implementationCost: costs.implementationCost,
    fteEquivalent: fteEquivalent(hoursReclaimedPerMonth),
  };
}
