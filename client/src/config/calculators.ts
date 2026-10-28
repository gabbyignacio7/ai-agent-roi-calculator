import type { InputConfig, ROIResults } from '@/lib/types';
import { computeROI, hoursWithAgent, type WorkflowModel } from '@/lib/roi';

export type CalculatorInput = InputConfig & { min: number; max: number };

export interface Assumption {
  label: string;
  value: string;
}

export interface CalculatorConfig {
  id: string;
  name: string;
  familySlug: string;
  summary: string;
  inputs: CalculatorInput[];
  /** Illustrative modelling assumptions for the agent, shown in the UI. */
  assumptions: Assumption[];
  model: (inputs: Record<string, number>) => WorkflowModel;
  calculateROI: (inputs: Record<string, number>) => ROIResults;
}

type ConfigSpec = Omit<CalculatorConfig, 'calculateROI'> & {
  platformFee: number;
  implementationCost: number;
};

const costInputs = (platformFee: number, implementationCost: number): CalculatorInput[] => [
  { id: 'platformFee', label: 'Agent platform cost per month ($)', type: 'currency', defaultValue: platformFee, min: 0, max: 250000, tooltip: 'Recurring cost of running the agent: licence, compute, monitoring and support. Sample value.' },
  { id: 'implementationCost', label: 'One-time implementation cost ($)', type: 'currency', defaultValue: implementationCost, min: 0, max: 2000000, tooltip: 'Integration, testing, controls sign-off and change management. Sample value.', advanced: true },
];

const workingDays: CalculatorInput = { id: 'workingDays', label: 'Working days per month', type: 'number', defaultValue: 22, min: 15, max: 30, tooltip: 'Business days per month', advanced: true };

const pct = (x: number) => `${Number((x * 100).toFixed(1))}%`;

function build(spec: ConfigSpec): CalculatorConfig {
  const { platformFee, implementationCost, ...rest } = spec;
  return {
    ...rest,
    inputs: [...spec.inputs, ...costInputs(platformFee, implementationCost)],
    calculateROI: (inputs) =>
      computeROI(spec.model(inputs), {
        platformMonthlyFee: inputs.platformFee ?? platformFee,
        implementationCost: inputs.implementationCost ?? implementationCost,
      }),
  };
}

/** Email triage: classify, prioritise and route operational email. */
function emailTriage(id: string, name: string, client: string): CalculatorConfig {
  const automationRate = 0.9;
  const reviewMinutes = 0.5;
  const newErrorRate = 0.5;
  return build({
    id,
    name,
    familySlug: 'comms',
    summary: `Reads operational email in ${client}, classifies it, and routes it to the right queue with the key fields pulled out.`,
    inputs: [
      { id: 'emailsPerDay', label: 'Emails processed per day', type: 'number', defaultValue: 300, min: 10, max: 10000, tooltip: 'Operational emails that need reading, classifying and routing each day' },
      { id: 'avgProcessingTime', label: 'Minutes per email today', type: 'number', defaultValue: 5, min: 1, max: 30, tooltip: 'Average time to read, classify and route one email by hand' },
      { id: 'hourlyRate', label: 'Fully loaded hourly cost ($)', type: 'currency', defaultValue: 75, min: 20, max: 300, tooltip: 'Salary, benefits and overhead per hour' },
      { id: 'errorRate', label: 'Misrouting rate today (%)', type: 'percentage', defaultValue: 5, min: 0, max: 50, tooltip: 'Share of emails misrouted or misclassified' },
      { id: 'errorCost', label: 'Cost per misrouted email ($)', type: 'currency', defaultValue: 25, min: 0, max: 5000, tooltip: 'Delay, rework and client impact of one misrouted email', advanced: true },
      workingDays,
    ],
    assumptions: [
      { label: 'Handled by the agent', value: pct(automationRate) },
      { label: 'Human review per handled email', value: `${reviewMinutes} min` },
      { label: 'Misrouting rate with the agent', value: `${newErrorRate}%` },
    ],
    platformFee: 8000,
    implementationCost: 60000,
    model: (i) => {
      const volume = i.emailsPerDay * i.workingDays;
      return {
        currentHours: (volume * i.avgProcessingTime) / 60,
        currentRiskCost: volume * (i.errorRate / 100) * i.errorCost,
        newHours: hoursWithAgent(volume, i.avgProcessingTime, automationRate, reviewMinutes),
        newRiskCost: volume * (newErrorRate / 100) * i.errorCost,
        hourlyRate: i.hourlyRate,
        currentErrorRate: i.errorRate,
        newErrorRate,
      };
    },
  });
}

const confirmationReview = (() => {
  const automationRate = 0.85;
  const reviewMinutes = 7;
  const newErrorRate = 0.1;
  return build({
    id: 'confirmation-review',
    name: 'Trade Confirmation Review Agent',
    familySlug: 'reconciliation',
    summary: 'Compares derivative confirmations against booked trade terms and flags every mismatch for a human to clear.',
    inputs: [
      { id: 'confirmationsPerMonth', label: 'Confirmations per month', type: 'number', defaultValue: 400, min: 20, max: 10000, tooltip: 'Derivative confirmations that need review each month' },
      { id: 'minutesPerConfirmation', label: 'Minutes per confirmation today', type: 'number', defaultValue: 30, min: 5, max: 120, tooltip: 'Average time to review and validate one confirmation by hand' },
      { id: 'hourlyRate', label: 'Fully loaded hourly cost ($)', type: 'currency', defaultValue: 80, min: 30, max: 250, tooltip: 'Salary, benefits and overhead per hour' },
      { id: 'errorRate', label: 'Missed discrepancy rate today (%)', type: 'percentage', defaultValue: 0.5, min: 0, max: 20, tooltip: 'Share of confirmations where a discrepancy is missed' },
      { id: 'errorCost', label: 'Cost per missed discrepancy ($)', type: 'currency', defaultValue: 10000, min: 500, max: 500000, tooltip: 'Average financial impact of a discrepancy that is not caught', advanced: true },
    ],
    assumptions: [
      { label: 'Checked by the agent', value: pct(automationRate) },
      { label: 'Human review per checked confirmation', value: `${reviewMinutes} min` },
      { label: 'Missed discrepancy rate with the agent', value: `${newErrorRate}%` },
    ],
    platformFee: 8000,
    implementationCost: 90000,
    model: (i) => ({
      currentHours: (i.confirmationsPerMonth * i.minutesPerConfirmation) / 60,
      currentRiskCost: i.confirmationsPerMonth * (i.errorRate / 100) * i.errorCost,
      newHours: hoursWithAgent(i.confirmationsPerMonth, i.minutesPerConfirmation, automationRate, reviewMinutes),
      newRiskCost: i.confirmationsPerMonth * (newErrorRate / 100) * i.errorCost,
      hourlyRate: i.hourlyRate,
      currentErrorRate: i.errorRate,
      newErrorRate,
    }),
  });
})();

const tradeAffirmation = (() => {
  const automationRate = 0.88;
  const reviewMinutes = 1;
  const newErrorRate = 0.8;
  return build({
    id: 'trade-affirmation',
    name: 'Trade Affirmation Agent',
    familySlug: 'reconciliation',
    summary: 'Affirms trades against allocations and settlement details on trade date, and routes the failures with a reason code.',
    inputs: [
      { id: 'tradesPerDay', label: 'Trades per day', type: 'number', defaultValue: 300, min: 50, max: 50000, tooltip: 'Trades that need affirmation each day' },
      { id: 'avgAffirmTime', label: 'Minutes per affirmation today', type: 'number', defaultValue: 4, min: 2, max: 60, tooltip: 'Average time to affirm one trade by hand' },
      { id: 'hourlyRate', label: 'Fully loaded hourly cost ($)', type: 'currency', defaultValue: 85, min: 20, max: 300, tooltip: 'Salary, benefits and overhead per hour' },
      { id: 'errorRate', label: 'Affirmation failure rate today (%)', type: 'percentage', defaultValue: 3, min: 0, max: 30, tooltip: 'Share of trades that fail first-pass affirmation' },
      { id: 'errorCost', label: 'Cost per failed affirmation ($)', type: 'currency', defaultValue: 150, min: 0, max: 10000, tooltip: 'Chasing, repair and late-settlement cost of one failure', advanced: true },
      workingDays,
    ],
    assumptions: [
      { label: 'Affirmed by the agent', value: pct(automationRate) },
      { label: 'Human review per affirmed trade', value: `${reviewMinutes} min` },
      { label: 'Failure rate with the agent', value: `${newErrorRate}%` },
    ],
    platformFee: 10000,
    implementationCost: 120000,
    model: (i) => {
      const volume = i.tradesPerDay * i.workingDays;
      return {
        currentHours: (volume * i.avgAffirmTime) / 60,
        currentRiskCost: volume * (i.errorRate / 100) * i.errorCost,
        newHours: hoursWithAgent(volume, i.avgAffirmTime, automationRate, reviewMinutes),
        newRiskCost: volume * (newErrorRate / 100) * i.errorCost,
        hourlyRate: i.hourlyRate,
        currentErrorRate: i.errorRate,
        newErrorRate,
      };
    },
  });
})();

const tradeBreakResolver = (() => {
  const autoResolutionRate = 0.7;
  const manualMinutesWithAgent = 10;
  const reviewMinutes = 2;
  const failShareToday = 0.02;
  const failShareWithAgent = 0.005;
  return build({
    id: 'trade-break-resolver',
    name: 'Trade Break Resolver',
    familySlug: 'reconciliation',
    summary: 'Investigates reconciliation breaks, proposes the fix with the evidence attached, and resolves the routine ones.',
    inputs: [
      { id: 'tradesPerDay', label: 'Trades per day', type: 'number', defaultValue: 1000, min: 50, max: 100000, tooltip: 'Trades reconciled each day' },
      { id: 'errorRate', label: 'Break rate (%)', type: 'percentage', defaultValue: 3, min: 0.1, max: 20, tooltip: 'Share of trades that break in reconciliation' },
      { id: 'minutesPerBreak', label: 'Minutes to resolve a break today', type: 'number', defaultValue: 45, min: 5, max: 240, tooltip: 'Average time to investigate and resolve one break' },
      { id: 'hourlyRate', label: 'Fully loaded hourly cost ($)', type: 'currency', defaultValue: 85, min: 20, max: 300, tooltip: 'Salary, benefits and overhead per hour' },
      { id: 'failedSettlementCost', label: 'Cost per failed settlement ($)', type: 'currency', defaultValue: 2500, min: 100, max: 100000, tooltip: 'Average cost of a failed or late settlement', advanced: true },
      workingDays,
    ],
    assumptions: [
      { label: 'Breaks resolved by the agent', value: pct(autoResolutionRate) },
      { label: 'Human time on a remaining break', value: `${manualMinutesWithAgent} min` },
      { label: 'Breaks that become failed settlements', value: `${pct(failShareToday)} today, ${pct(failShareWithAgent)} with the agent` },
    ],
    platformFee: 12000,
    implementationCost: 150000,
    model: (i) => {
      const breaks = i.tradesPerDay * i.workingDays * (i.errorRate / 100);
      return {
        currentHours: (breaks * i.minutesPerBreak) / 60,
        currentRiskCost: breaks * failShareToday * i.failedSettlementCost,
        newHours: hoursWithAgent(breaks, manualMinutesWithAgent, autoResolutionRate, reviewMinutes),
        newRiskCost: breaks * failShareWithAgent * i.failedSettlementCost,
        hourlyRate: i.hourlyRate,
        currentErrorRate: i.errorRate,
        newErrorRate: 0.5,
      };
    },
  });
})();

const ssiLookup = (() => {
  const automationRate = 0.95;
  const reviewMinutes = 0.1;
  const failReduction = 0.05;
  return build({
    id: 'ssi-lookup',
    name: 'SSI Lookup Agent',
    familySlug: 'settlements',
    summary: 'Finds and validates standing settlement instructions for each settlement, and flags stale or conflicting ones before release.',
    inputs: [
      { id: 'settlementsPerDay', label: 'Settlements per day', type: 'number', defaultValue: 150, min: 10, max: 5000, tooltip: 'Settlements that need an SSI lookup each day' },
      { id: 'avgLookupTime', label: 'Minutes per lookup today', type: 'number', defaultValue: 6, min: 2, max: 60, tooltip: 'Average time to find and verify one SSI by hand' },
      { id: 'hourlyRate', label: 'Fully loaded hourly cost ($)', type: 'currency', defaultValue: 80, min: 30, max: 250, tooltip: 'Salary, benefits and overhead per hour' },
      { id: 'failedSettlements', label: 'Failed settlements per month', type: 'number', defaultValue: 4, min: 0, max: 500, tooltip: 'Settlements that fail each month because of SSI problems' },
      { id: 'penaltyCost', label: 'Cost per failed settlement ($)', type: 'currency', defaultValue: 3000, min: 100, max: 100000, tooltip: 'Penalties, interest and repair cost of one failed settlement', advanced: true },
      workingDays,
    ],
    assumptions: [
      { label: 'Lookups done by the agent', value: pct(automationRate) },
      { label: 'Human check per agent lookup', value: `${reviewMinutes * 60} sec` },
      { label: 'Failed settlements with the agent', value: `${pct(failReduction)} of today, minimum 1` },
    ],
    platformFee: 6000,
    implementationCost: 60000,
    model: (i) => {
      const volume = i.settlementsPerDay * i.workingDays;
      const newFails = Math.max(1, i.failedSettlements * failReduction);
      return {
        currentHours: (volume * i.avgLookupTime) / 60,
        currentRiskCost: i.failedSettlements * i.penaltyCost,
        newHours: hoursWithAgent(volume, i.avgLookupTime, automationRate, reviewMinutes),
        newRiskCost: newFails * i.penaltyCost,
        hourlyRate: i.hourlyRate,
        currentErrorRate: volume > 0 ? (i.failedSettlements / volume) * 100 : 0,
        newErrorRate: volume > 0 ? (newFails / volume) * 100 : 0,
      };
    },
  });
})();

function loanWork(opts: {
  id: string;
  name: string;
  summary: string;
  volumeLabel: string;
  hoursLabel: string;
  hoursDefault: number;
  errorLabel: string;
  errorDefault: number;
  errorCostLabel: string;
  errorCostDefault: number;
  automationRate: number;
  reviewHours: number;
  newErrorRate: number;
  platformFee: number;
  implementationCost: number;
}): CalculatorConfig {
  return build({
    id: opts.id,
    name: opts.name,
    familySlug: 'operations',
    summary: opts.summary,
    inputs: [
      { id: 'loansPerMonth', label: opts.volumeLabel, type: 'number', defaultValue: 200, min: 10, max: 10000, tooltip: 'Loans handled each month' },
      { id: 'hoursPerLoan', label: opts.hoursLabel, type: 'number', defaultValue: opts.hoursDefault, min: 0.5, max: 20, tooltip: 'Average processor hours per loan today' },
      { id: 'hourlyRate', label: 'Fully loaded hourly cost ($)', type: 'currency', defaultValue: 65, min: 25, max: 200, tooltip: 'Salary, benefits and overhead per hour' },
      { id: 'errorRate', label: opts.errorLabel, type: 'percentage', defaultValue: opts.errorDefault, min: 0, max: 40, tooltip: 'Share of loans that need correction or rework' },
      { id: 'errorCost', label: opts.errorCostLabel, type: 'currency', defaultValue: opts.errorCostDefault, min: 50, max: 10000, tooltip: 'Average cost to correct one loan', advanced: true },
    ],
    assumptions: [
      { label: 'Prepared by the agent', value: pct(opts.automationRate) },
      { label: 'Human review per agent-prepared loan', value: `${opts.reviewHours} h` },
      { label: 'Error or rework rate with the agent', value: `${opts.newErrorRate}%` },
    ],
    platformFee: opts.platformFee,
    implementationCost: opts.implementationCost,
    model: (i) => ({
      currentHours: i.loansPerMonth * i.hoursPerLoan,
      currentRiskCost: i.loansPerMonth * (i.errorRate / 100) * i.errorCost,
      newHours: hoursWithAgent(i.loansPerMonth, i.hoursPerLoan * 60, opts.automationRate, opts.reviewHours * 60),
      newRiskCost: i.loansPerMonth * (opts.newErrorRate / 100) * i.errorCost,
      hourlyRate: i.hourlyRate,
      currentErrorRate: i.errorRate,
      newErrorRate: opts.newErrorRate,
    }),
  });
}

function regReporting(id: string, name: string, regime: string, minutesDefault: number, riskDefault: number, errorDefault: number): CalculatorConfig {
  const automationRate = 0.96;
  const reviewMinutes = 0.5;
  const newErrorRate = 0.1;
  return build({
    id,
    name,
    familySlug: 'operations',
    summary: `Collects and codes the ${regime} data fields for each application, runs the edit checks, and leaves a reviewer a short exception list.`,
    inputs: [
      { id: 'loansPerMonth', label: 'Applications per month', type: 'number', defaultValue: 300, min: 50, max: 10000, tooltip: `Applications or activities that need ${regime} coding each month` },
      { id: 'avgComplianceTime', label: 'Minutes per application today', type: 'number', defaultValue: minutesDefault, min: 5, max: 120, tooltip: `Average time to collect and code the ${regime} fields by hand` },
      { id: 'hourlyRate', label: 'Fully loaded hourly cost ($)', type: 'currency', defaultValue: 95, min: 40, max: 300, tooltip: 'Salary, benefits and overhead per hour for compliance staff' },
      { id: 'penaltyRisk', label: 'Annual regulatory exposure today ($)', type: 'currency', defaultValue: riskDefault, min: 10000, max: 5000000, tooltip: 'Estimated yearly cost of findings, resubmissions and penalties at today\'s error rate' },
      { id: 'errorRate', label: 'Coding error rate today (%)', type: 'percentage', defaultValue: errorDefault, min: 0.1, max: 30, tooltip: `Share of records with ${regime} coding errors`, advanced: true },
    ],
    assumptions: [
      { label: 'Fields coded by the agent', value: pct(automationRate) },
      { label: 'Human review per agent-coded record', value: `${reviewMinutes} min` },
      { label: 'Coding error rate with the agent', value: `${newErrorRate}%` },
    ],
    platformFee: 6000,
    implementationCost: 80000,
    model: (i) => {
      const errorRate = Math.max(i.errorRate, 0.1);
      return {
        currentHours: (i.loansPerMonth * i.avgComplianceTime) / 60,
        currentRiskCost: i.penaltyRisk / 12,
        newHours: hoursWithAgent(i.loansPerMonth, i.avgComplianceTime, automationRate, reviewMinutes),
        newRiskCost: (i.penaltyRisk * Math.min(1, newErrorRate / errorRate)) / 12,
        hourlyRate: i.hourlyRate,
        currentErrorRate: i.errorRate,
        newErrorRate,
      };
    },
  });
}

const policyReview = (() => {
  const newHoursPerPolicy = 1.5;
  const newErrorRate = 0.25;
  return build({
    id: 'policy-review',
    name: 'Policy Review Agent',
    familySlug: 'operations',
    summary: 'Reads policy documents against a checklist, cites the clause for every finding, and hands the analyst a marked-up draft.',
    inputs: [
      { id: 'policiesPerMonth', label: 'Policies reviewed per month', type: 'number', defaultValue: 60, min: 10, max: 5000, tooltip: 'Policy documents that need review each month' },
      { id: 'hoursPerPolicy', label: 'Hours per policy today', type: 'number', defaultValue: 6, min: 1, max: 40, tooltip: 'Average analyst hours to review one policy' },
      { id: 'hourlyRate', label: 'Analyst hourly cost ($)', type: 'currency', defaultValue: 125, min: 50, max: 500, tooltip: 'Fully loaded hourly cost of a policy analyst' },
      { id: 'errorRate', label: 'Missed issue rate today (%)', type: 'percentage', defaultValue: 1, min: 0, max: 20, tooltip: 'Share of policies where a compliance issue is missed' },
      { id: 'errorCost', label: 'Cost per missed issue ($)', type: 'currency', defaultValue: 20000, min: 1000, max: 500000, tooltip: 'Average financial impact of a missed issue', advanced: true },
    ],
    assumptions: [
      { label: 'Analyst time per policy with the agent', value: `${newHoursPerPolicy} h` },
      { label: 'Missed issue rate with the agent', value: `${newErrorRate}%` },
    ],
    platformFee: 12000,
    implementationCost: 120000,
    model: (i) => ({
      currentHours: i.policiesPerMonth * i.hoursPerPolicy,
      currentRiskCost: i.policiesPerMonth * (i.errorRate / 100) * i.errorCost,
      newHours: i.policiesPerMonth * newHoursPerPolicy,
      newRiskCost: i.policiesPerMonth * (newErrorRate / 100) * i.errorCost,
      hourlyRate: i.hourlyRate,
      currentErrorRate: i.errorRate,
      newErrorRate,
    }),
  });
})();

const all: CalculatorConfig[] = [
  emailTriage('email-triage-outlook', 'Email Triage Agent (Outlook)', 'shared Outlook mailboxes'),
  emailTriage('email-triage-gmail', 'Email Triage Agent (Gmail)', 'shared Gmail inboxes'),
  confirmationReview,
  tradeAffirmation,
  tradeBreakResolver,
  ssiLookup,
  loanWork({
    id: 'loan-boarding', name: 'Loan Boarding Agent',
    summary: 'Reads the closing package and boards the loan onto the servicing system, field by field, with a reviewer sign-off.',
    volumeLabel: 'Loans boarded per month', hoursLabel: 'Hours to board a loan today', hoursDefault: 3,
    errorLabel: 'Boarding error rate today (%)', errorDefault: 8, errorCostLabel: 'Cost per boarding error ($)', errorCostDefault: 500,
    automationRate: 0.8, reviewHours: 0.5, newErrorRate: 1, platformFee: 10000, implementationCost: 120000,
  }),
  loanWork({
    id: 'loan-funding', name: 'Loan Funding Package Agent',
    summary: 'Assembles and checks the funding package against conditions before release, and lists anything missing.',
    volumeLabel: 'Loans funded per month', hoursLabel: 'Hours per funding package today', hoursDefault: 4,
    errorLabel: 'Rework rate today (%)', errorDefault: 12, errorCostLabel: 'Cost per rework ($)', errorCostDefault: 400,
    automationRate: 0.75, reviewHours: 0.75, newErrorRate: 2, platformFee: 10000, implementationCost: 120000,
  }),
  regReporting('hmda-reporting', 'HMDA Reporting Agent', 'HMDA', 30, 120000, 6),
  regReporting('cra-reporting', 'CRA Reporting Agent', 'CRA', 25, 80000, 5),
  policyReview,
];

export const calculatorConfigs: Record<string, CalculatorConfig> = Object.fromEntries(all.map((c) => [c.id, c]));

export const getCalculatorConfig = (agentSlug: string): CalculatorConfig | undefined => calculatorConfigs[agentSlug];

export const hasCalculator = (agentSlug: string): boolean => calculatorConfigs[agentSlug] !== undefined;
