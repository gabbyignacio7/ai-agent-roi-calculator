import { createContext, useContext, useState, useMemo, useEffect, useCallback, type ReactNode } from 'react';
import { calculatorConfigs, type CalculatorConfig } from '@/config/calculators';
import { agentFamilies } from '@/config/families';
import type { ROIResults } from '@/lib/types';

export interface PortfolioAgent {
  agentSlug: string;
  familySlug: string;
  agentName: string;
  inputs: Record<string, number>;
  results: ROIResults;
}

export interface PortfolioTotals {
  totalAnnualSavings: number;
  totalMonthlySavings: number;
  totalHoursReclaimed: number;
  totalPlatformFees: number;
  totalFTE: number;
  avgErrorReduction: number;
  roiMultiplier: number;
  totalImplementationCost: number;
  paybackMonths: number;
  agentCount: number;
}

const defaultTotals: PortfolioTotals = {
  totalAnnualSavings: 0,
  totalMonthlySavings: 0,
  totalHoursReclaimed: 0,
  totalPlatformFees: 0,
  totalFTE: 0,
  avgErrorReduction: 0,
  roiMultiplier: 0,
  totalImplementationCost: 0,
  paybackMonths: 0,
  agentCount: 0,
};

interface PortfolioContextValue {
  agents: Map<string, PortfolioAgent>;
  totals: PortfolioTotals;
  addAgent: (agentSlug: string, familySlug: string) => void;
  removeAgent: (agentSlug: string) => void;
  toggleAgent: (agentSlug: string, familySlug: string) => void;
  isSelected: (agentSlug: string) => boolean;
  updateAgentInput: (agentSlug: string, inputId: string, value: number) => void;
  clearPortfolio: () => void;
  getConfig: (agentSlug: string) => CalculatorConfig | undefined;
}

const PortfolioContext = createContext<PortfolioContextValue | null>(null);

const STORAGE_KEY = 'ai-agent-roi-portfolio';

function getAgentName(agentSlug: string): string {
  for (const family of agentFamilies) {
    const agent = family.agents.find(a => a.slug === agentSlug);
    if (agent) return agent.name;
  }
  return agentSlug;
}

function initializeAgent(agentSlug: string, familySlug: string, inputOverrides?: Record<string, number>): PortfolioAgent | null {
  const config = calculatorConfigs[agentSlug];
  if (!config) return null;

  const inputs: Record<string, number> = {};
  for (const input of config.inputs) {
    inputs[input.id] = inputOverrides?.[input.id] ?? input.defaultValue;
  }

  const results = config.calculateROI(inputs);

  return {
    agentSlug,
    familySlug,
    agentName: getAgentName(agentSlug),
    inputs,
    results,
  };
}

function saveToStorage(agents: Map<string, PortfolioAgent>) {
  try {
    const data = Array.from(agents.values()).map(a => ({
      agentSlug: a.agentSlug,
      familySlug: a.familySlug,
      inputs: a.inputs,
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage not available
  }
}

function loadFromStorage(): Map<string, PortfolioAgent> {
  const map = new Map<string, PortfolioAgent>();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return map;
    const data = JSON.parse(raw) as Array<{ agentSlug: string; familySlug: string; inputs: Record<string, number> }>;
    for (const entry of data) {
      const agent = initializeAgent(entry.agentSlug, entry.familySlug, entry.inputs);
      if (agent) map.set(entry.agentSlug, agent);
    }
  } catch {
    // invalid data
  }
  return map;
}

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [agents, setAgents] = useState<Map<string, PortfolioAgent>>(() => loadFromStorage());

  useEffect(() => {
    saveToStorage(agents);
  }, [agents]);

  const addAgent = useCallback((agentSlug: string, familySlug: string) => {
    setAgents(prev => {
      if (prev.has(agentSlug)) return prev;
      const agent = initializeAgent(agentSlug, familySlug);
      if (!agent) return prev;
      const next = new Map(prev);
      next.set(agentSlug, agent);
      return next;
    });
  }, []);

  const removeAgent = useCallback((agentSlug: string) => {
    setAgents(prev => {
      if (!prev.has(agentSlug)) return prev;
      const next = new Map(prev);
      next.delete(agentSlug);
      return next;
    });
  }, []);

  const toggleAgent = useCallback((agentSlug: string, familySlug: string) => {
    setAgents(prev => {
      const next = new Map(prev);
      if (next.has(agentSlug)) {
        next.delete(agentSlug);
      } else {
        const agent = initializeAgent(agentSlug, familySlug);
        if (agent) next.set(agentSlug, agent);
      }
      return next;
    });
  }, []);

  const isSelected = useCallback((agentSlug: string) => agents.has(agentSlug), [agents]);

  const updateAgentInput = useCallback((agentSlug: string, inputId: string, value: number) => {
    setAgents(prev => {
      const existing = prev.get(agentSlug);
      if (!existing) return prev;
      const config = calculatorConfigs[agentSlug];
      if (!config) return prev;
      const newInputs = { ...existing.inputs, [inputId]: value };
      const results = config.calculateROI(newInputs);
      const next = new Map(prev);
      next.set(agentSlug, { ...existing, inputs: newInputs, results });
      return next;
    });
  }, []);

  const clearPortfolio = useCallback(() => {
    setAgents(new Map());
  }, []);

  const getConfig = useCallback((agentSlug: string) => calculatorConfigs[agentSlug], []);

  const totals = useMemo<PortfolioTotals>(() => {
    const arr = Array.from(agents.values());
    if (arr.length === 0) return defaultTotals;

    const totalAnnualSavings = arr.reduce((s, a) => s + a.results.annualSavings, 0);
    const totalMonthlySavings = arr.reduce((s, a) => s + a.results.monthlySavings, 0);
    const totalHoursReclaimed = arr.reduce((s, a) => s + a.results.hoursReclaimedPerMonth, 0);
    const totalPlatformFees = arr.reduce((s, a) => s + a.results.platformMonthlyFee, 0);
    const totalFTE = Math.round((totalHoursReclaimed / 160) * 10) / 10;

    const avgCurrentError = arr.reduce((s, a) => s + a.results.currentErrorRate, 0) / arr.length;
    const avgNewError = arr.reduce((s, a) => s + a.results.newErrorRate, 0) / arr.length;
    const avgErrorReduction = avgCurrentError > 0 ? ((avgCurrentError - avgNewError) / avgCurrentError) * 100 : 0;

    const annualFees = totalPlatformFees * 12;
    const roiMultiplier = annualFees > 0 ? totalAnnualSavings / annualFees : 0;
    const totalImplementationCost = arr.reduce((s, a) => s + a.results.implementationCost, 0);
    const paybackMonths = totalMonthlySavings > 0 ? totalImplementationCost / totalMonthlySavings : 0;

    return {
      totalAnnualSavings,
      totalMonthlySavings,
      totalHoursReclaimed,
      totalPlatformFees,
      totalFTE,
      avgErrorReduction,
      roiMultiplier,
      totalImplementationCost,
      paybackMonths,
      agentCount: arr.length,
    };
  }, [agents]);

  const value = useMemo<PortfolioContextValue>(() => ({
    agents,
    totals,
    addAgent,
    removeAgent,
    toggleAgent,
    isSelected,
    updateAgentInput,
    clearPortfolio,
    getConfig,
  }), [agents, totals, addAgent, removeAgent, toggleAgent, isSelected, updateAgentInput, clearPortfolio, getConfig]);

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio(): PortfolioContextValue {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error('usePortfolio must be used within PortfolioProvider');
  return ctx;
}
