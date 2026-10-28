import { calculatorConfigs } from './calculators';

export interface AgentInfo {
  id: string;
  name: string;
  slug: string;
  hasCalculator: boolean;
}

export interface AgentFamily {
  id: string;
  slug: string;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  description: string;
  agents: AgentInfo[];
}

const agentsFor = (familySlug: string): AgentInfo[] =>
  Object.values(calculatorConfigs)
    .filter((c) => c.familySlug === familySlug)
    .map((c) => ({ id: c.id, name: c.name, slug: c.id, hasCalculator: true }));

export const agentFamilies: AgentFamily[] = [
  { id: 'comms', slug: 'comms', name: 'Communications', icon: 'Mail', color: '#2563EB', bgColor: '#EFF6FF', description: 'Email triage and routing for operations teams', agents: agentsFor('comms') },
  { id: 'reconciliation', slug: 'reconciliation', name: 'Reconciliation', icon: 'RefreshCw', color: '#7C3AED', bgColor: '#F5F3FF', description: 'Confirmation review, affirmation and break resolution', agents: agentsFor('reconciliation') },
  { id: 'settlements', slug: 'settlements', name: 'Settlements', icon: 'Banknote', color: '#059669', bgColor: '#ECFDF5', description: 'Settlement instruction lookup and validation', agents: agentsFor('settlements') },
  { id: 'operations', slug: 'operations', name: 'Lending and Compliance Operations', icon: 'Briefcase', color: '#D97706', bgColor: '#FFFBEB', description: 'Loan boarding, funding, regulatory reporting and policy review', agents: agentsFor('operations') },
];

export const getFamilyBySlug = (slug: string): AgentFamily | undefined => agentFamilies.find((f) => f.slug === slug);

export const getAgentFromFamily = (familySlug: string, agentSlug: string): AgentInfo | undefined =>
  getFamilyBySlug(familySlug)?.agents.find((a) => a.slug === agentSlug);
