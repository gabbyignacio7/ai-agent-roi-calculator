import { Link } from 'wouter';
import { agentFamilies } from '@/config/families';

export function Footer() {
  return (
    <footer className="border-t bg-muted/30 py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link href="/">
              <span className="text-xl font-bold text-brand-navy dark:text-white cursor-pointer">
                AI Agent ROI Calculator
              </span>
            </Link>
            <p className="text-sm text-muted-foreground mt-3">
              A business case for AI agents in financial operations, one workflow at a time. All agents and inputs are illustrative samples.
            </p>
          </div>
          
          <div className="md:col-span-2">
            <h4 className="font-medium mb-4">Agent Families</h4>
            <div className="grid grid-cols-2 gap-4">
              {agentFamilies.map((family) => (
                <div key={family.id}>
                  <Link href={`/family/${family.slug}`}>
                    <span className="font-medium text-sm hover:text-foreground transition-colors cursor-pointer" style={{ color: family.color }}>
                      {family.name}
                    </span>
                  </Link>
                  <ul className="mt-2 space-y-1">
                    {family.agents.filter(a => a.hasCalculator).slice(0, 3).map((agent) => (
                      <li key={agent.id}>
                        <Link href={`/calculator/${family.slug}/${agent.slug}`}>
                          <span className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                            {agent.name}
                          </span>
                        </Link>
                      </li>
                    ))}
                    {family.agents.filter(a => a.hasCalculator).length > 3 && (
                      <li>
                        <Link href={`/family/${family.slug}`}>
                          <span className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                            +{family.agents.filter(a => a.hasCalculator).length - 3} more...
                          </span>
                        </Link>
                      </li>
                    )}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">About</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="https://7thfloorventures.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">7th Floor Ventures</a></li>
              <li><a href="https://github.com/gabbyignacio7/ai-agent-roi-calculator" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Source on GitHub</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-6 border-t text-center text-sm text-muted-foreground">
          <p>Built by <a href="https://7thfloorventures.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">Gabriel Ignacio, 7th Floor Ventures</a></p>
        </div>
      </div>
    </footer>
  );
}
