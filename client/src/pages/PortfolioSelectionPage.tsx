import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PortfolioTotalsBanner } from '@/components/PortfolioTotalsBanner';
import { PortfolioAgentSelector } from '@/components/PortfolioAgentSelector';
import { usePortfolio } from '@/context/PortfolioContext';
import { agentFamilies } from '@/config/families';
import { calculatorConfigs } from '@/config/calculators';
import { Link } from 'wouter';
import { Layers, ArrowRight, ArrowLeft, RotateCcw } from 'lucide-react';

export default function PortfolioSelectionPage() {
  const { totals, clearPortfolio } = usePortfolio();

  const familiesWithCalculators = agentFamilies.map(family => ({
    ...family,
    calculatorAgents: family.agents.filter(a => a.hasCalculator && calculatorConfigs[a.slug]),
  })).filter(f => f.calculatorAgents.length > 0);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <PortfolioTotalsBanner />

      <main className="flex-1">
        <section className="py-12 md:py-16">
          <div className="max-w-5xl mx-auto px-4 md:px-6">
            <div className="flex items-center gap-2 mb-2">
              <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Home
              </Link>
            </div>

            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-blue/10 flex items-center justify-center">
                    <Layers className="h-5 w-5 text-brand-blue" />
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                    Build Your Agent Portfolio
                  </h1>
                </div>
                <p className="text-muted-foreground max-w-2xl">
                  Select the agents relevant to your operations. Mix and match across families
                  to see your total projected ROI. Each agent starts from sample inputs. Replace them with
                  your own numbers for an estimate you can defend.
                </p>
              </div>
              {totals.agentCount > 0 && (
                <button
                  onClick={clearPortfolio}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-red-500 transition-colors whitespace-nowrap mt-2"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Clear All
                </button>
              )}
            </div>

            <div className="space-y-8 mt-10">
              {familiesWithCalculators.map(family => (
                <div key={family.id}>
                  <div className="flex items-center gap-2 mb-4">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: family.color }}
                    />
                    <h2 className="text-lg font-semibold text-foreground">
                      {family.name}
                    </h2>
                    <span className="text-xs text-muted-foreground">
                      {family.calculatorAgents.length} agent{family.calculatorAgents.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {family.calculatorAgents.map(agent => (
                      <PortfolioAgentSelector
                        key={agent.slug}
                        agentSlug={agent.slug}
                        agentName={agent.name}
                        familySlug={family.slug}
                        familyColor={family.color}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 flex items-center justify-center">
              <Link
                href="/portfolio/results"
                className={`inline-flex items-center gap-2 px-8 py-3.5 rounded-lg font-semibold text-white transition-all duration-200 ${
                  totals.agentCount > 0
                    ? 'bg-brand-blue hover:bg-brand-blue/90 shadow-lg hover:shadow-xl'
                    : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed pointer-events-none'
                }`}
              >
                View Portfolio Results
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
