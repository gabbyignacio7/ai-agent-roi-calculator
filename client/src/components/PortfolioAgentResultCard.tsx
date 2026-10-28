import { useState } from 'react';
import { usePortfolio, type PortfolioAgent } from '@/context/PortfolioContext';
import { PortfolioAgentInputEditor } from '@/components/PortfolioAgentInputEditor';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/formatters';
import { agentFamilies } from '@/config/families';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

interface PortfolioAgentResultCardProps {
  agent: PortfolioAgent;
}

export function PortfolioAgentResultCard({ agent }: PortfolioAgentResultCardProps) {
  const { removeAgent } = usePortfolio();
  const [showInputs, setShowInputs] = useState(false);

  const family = agentFamilies.find(f => f.slug === agent.familySlug);
  const errorReduction = agent.results.currentErrorRate > 0
    ? ((agent.results.currentErrorRate - agent.results.newErrorRate) / agent.results.currentErrorRate) * 100
    : 0;

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
      <CardContent className="p-0">
        <div
          className="h-1.5"
          style={{ backgroundColor: family?.color ?? '#2196F3' }}
        />
        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <p className="font-semibold text-foreground">{agent.agentName}</p>
              {family && (
                <span
                  className="inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-1"
                  style={{
                    backgroundColor: family.bgColor,
                    color: family.color,
                  }}
                >
                  {family.name}
                </span>
              )}
            </div>
            <button
              onClick={() => removeAgent(agent.agentSlug)}
              className="text-muted-foreground hover:text-red-500 transition-colors p-1"
              title="Remove agent"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Annual Savings</p>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                {formatCurrency(agent.results.annualSavings)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Monthly Savings</p>
              <p className="text-lg font-bold text-foreground">
                {formatCurrency(agent.results.monthlySavings)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Hours Reclaimed/Mo</p>
              <p className="text-lg font-bold text-foreground">
                {formatNumber(agent.results.hoursReclaimedPerMonth)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Error Reduction</p>
              <p className="text-lg font-bold text-foreground">
                {formatPercent(errorReduction)}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
            <button
              onClick={() => setShowInputs(!showInputs)}
              className="flex items-center gap-1.5 text-sm text-brand-blue hover:text-brand-blue/80 font-medium transition-colors"
            >
              {showInputs ? (
                <>
                  <ChevronUp className="h-4 w-4" /> Hide Inputs
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" /> Edit Inputs
                </>
              )}
            </button>
            <span className="text-xs text-muted-foreground">
              FTE: {agent.results.fteEquivalent ?? '-'}
            </span>
          </div>

          {showInputs && (
            <div className="mt-3">
              <PortfolioAgentInputEditor agentSlug={agent.agentSlug} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
