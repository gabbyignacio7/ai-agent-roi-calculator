import { usePortfolio } from '@/context/PortfolioContext';
import { InputField } from '@/components/InputField';
import type { InputConfig } from '@/lib/types';

interface PortfolioAgentInputEditorProps {
  agentSlug: string;
}

export function PortfolioAgentInputEditor({ agentSlug }: PortfolioAgentInputEditorProps) {
  const { agents, updateAgentInput, getConfig } = usePortfolio();
  const agent = agents.get(agentSlug);
  const config = getConfig(agentSlug);

  if (!agent || !config) return null;

  const basicInputs = config.inputs.filter(i => !i.advanced);
  const advancedInputs = config.inputs.filter(i => i.advanced);

  const handleChange = (id: string, value: number) => {
    updateAgentInput(agentSlug, id, value);
  };

  return (
    <div className="space-y-4 pt-4 border-t border-border/50">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Configure Inputs
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {basicInputs.map((input) => (
          <InputField
            key={input.id}
            config={input as InputConfig}
            value={agent.inputs[input.id] ?? input.defaultValue}
            onChange={handleChange}
          />
        ))}
      </div>
      {advancedInputs.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 pt-2">
          {advancedInputs.map((input) => (
            <InputField
              key={input.id}
              config={input as InputConfig}
              value={agent.inputs[input.id] ?? input.defaultValue}
              onChange={handleChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}
