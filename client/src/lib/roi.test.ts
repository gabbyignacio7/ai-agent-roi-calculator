import { describe, expect, it } from 'vitest';
import { computeROI, fteEquivalent, hoursWithAgent } from './roi';
import { calculatorConfigs } from '@/config/calculators';

describe('hoursWithAgent', () => {
  it('keeps manual time on the share the agent does not handle and adds review time on the rest', () => {
    // 1,000 items, 6 min manual, agent handles 90% with 1 min review each
    // manual: 100 x 6 = 600 min, review: 900 x 1 = 900 min, total 1,500 min = 25 h
    expect(hoursWithAgent(1000, 6, 0.9, 1)).toBeCloseTo(25);
  });

  it('equals the manual baseline when the agent handles nothing', () => {
    expect(hoursWithAgent(300, 20, 0, 2)).toBeCloseTo(100);
  });
});

describe('computeROI', () => {
  const model = {
    currentHours: 200,
    currentRiskCost: 2000,
    newHours: 40,
    newRiskCost: 500,
    hourlyRate: 50,
    currentErrorRate: 5,
    newErrorRate: 1,
  };
  const r = computeROI(model, { platformMonthlyFee: 3000, implementationCost: 12000 });

  it('prices labour and risk before and after, including the platform fee', () => {
    expect(r.currentMonthlyCost).toBe(200 * 50 + 2000); // 12,000
    expect(r.newMonthlyCost).toBe(40 * 50 + 500 + 3000); // 5,500
  });

  it('derives savings, payback and first-year ROI', () => {
    expect(r.monthlySavings).toBe(6500);
    expect(r.annualSavings).toBe(78000);
    expect(r.paybackMonths).toBeCloseTo(12000 / 6500);
    // year-one investment = 12,000 implementation + 12 x 3,000 platform = 48,000
    expect(r.roiPercent).toBeCloseTo(((78000 - 12000) / 48000) * 100);
  });

  it('reports hours reclaimed and FTE capacity', () => {
    expect(r.hoursReclaimedPerMonth).toBe(160);
    expect(r.fteEquivalent).toBe(1);
  });

  it('does not report a payback when the agent costs more than it saves', () => {
    const loss = computeROI({ ...model, currentHours: 41 }, { platformMonthlyFee: 3000, implementationCost: 12000 });
    expect(loss.monthlySavings).toBeLessThan(0);
    expect(loss.paybackMonths).toBe(0);
  });
});

describe('fteEquivalent', () => {
  it('rounds to one decimal on a 160 hour month', () => {
    expect(fteEquivalent(250)).toBe(1.6);
  });
});

describe('sample calculators', () => {
  for (const config of Object.values(calculatorConfigs)) {
    it(`${config.name} produces a positive, finite case on its sample inputs`, () => {
      const inputs = Object.fromEntries(config.inputs.map((i) => [i.id, i.defaultValue]));
      const r = config.calculateROI(inputs);
      for (const v of Object.values(r)) expect(Number.isFinite(v as number)).toBe(true);
      expect(r.monthlySavings).toBeGreaterThan(0);
      expect(r.hoursReclaimedPerMonth).toBeGreaterThan(0);
    });
  }
});
