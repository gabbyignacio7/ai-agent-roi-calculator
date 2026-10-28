import { useState } from 'react';
import { usePortfolio } from '@/context/PortfolioContext';
import { PortfolioAgentInputEditor } from '@/components/PortfolioAgentInputEditor';
import { formatCurrency, formatNumber } from '@/lib/formatters';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface PortfolioAgentSelectorProps {
  agentSlug: string;
  agentName: string;
  familySlug: string;
  familyColor: string;
}

export function PortfolioAgentSelector({
  agentSlug,
  agentName,
  familySlug,
  familyColor,
}: PortfolioAgentSelectorProps) {
  const { toggleAgent, isSelected, agents } = usePortfolio();
  const [showInputs, setShowInputs] = useState(false);
  const selected = isSelected(agentSlug);
  const agent = agents.get(agentSlug);

  return (
    <div
      className={`rounded-lg border-2 p-4 transition-all duration-200 ${
        selected
          ? 'border-brand-blue/50 bg-brand-blue/5 dark:bg-brand-blue/10 shadow-sm'
          : 'border-border hover:border-border/80 bg-card'
      }`}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={selected}
          onCheckedChange={() => toggleAgent(agentSlug, familySlug)}
          className="mt-0.5"
        />
        <div className="flex-1 min-w-0">
          <button
            onClick={() => toggleAgent(agentSlug, familySlug)}
            className="text-left w-full"
          >
            <p className="font-medium text-sm text-foreground leading-tight">
              {agentName}
            </p>
          </button>

          {selected && agent && (
            <div className="mt-3 space-y-3">
              <div className="flex flex-wrap gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground">Annual Savings</span>
                  <p className="font-semibold text-green-600 dark:text-green-400">
                    {formatCurrency(agent.results.annualSavings)}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Hours/Mo</span>
                  <p className="font-semibold text-foreground">
                    {formatNumber(agent.results.hoursReclaimedPerMonth)}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">FTE</span>
                  <p className="font-semibold text-foreground">
                    {agent.results.fteEquivalent ?? '-'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowInputs(!showInputs)}
                className="flex items-center gap-1 text-xs text-brand-blue hover:text-brand-blue/80 font-medium transition-colors"
              >
                {showInputs ? (
                  <>
                    <ChevronUp className="h-3 w-3" /> Hide Inputs
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3" /> Customize Inputs
                  </>
                )}
              </button>

              {showInputs && <PortfolioAgentInputEditor agentSlug={agentSlug} />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
