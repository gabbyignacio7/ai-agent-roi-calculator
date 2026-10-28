import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { FamilyCard } from '@/components/FamilyCard';
import { agentFamilies } from '@/config/families';
import { TrendingUp, Clock, Shield, Zap, Search, Layers, ArrowRight } from 'lucide-react';
import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';

export default function Home() {
  const benefits = [
    {
      icon: TrendingUp,
      title: 'Per-workflow ROI',
      description: 'A separate business case for every workflow, not one blended number',
    },
    {
      icon: Clock,
      title: 'Hours reclaimed',
      description: 'Manual hours before and after, converted to FTE capacity'
    },
    {
      icon: Shield,
      title: 'Error cost',
      description: 'Rework and penalty costs priced in, not ignored',
    },
    {
      icon: Zap,
      title: 'Payback',
      description: 'Platform and implementation costs netted against savings',
    },
  ];

  const totalAgents = agentFamilies.reduce((sum, f) => sum + f.agents.length, 0);
  const totalCalculators = agentFamilies.reduce((sum, f) => sum + f.agents.filter(a => a.hasCalculator).length, 0);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <section className="py-16 md:py-24" data-testid="section-hero">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-blue/10 text-brand-blue text-sm font-medium mb-6">
                <Zap className="h-4 w-4" />
                Sample inputs, editable
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                The business case for AI agents,{' '}
                <span className="text-brand-blue">one workflow at a time</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Pick a financial operations workflow, enter your own volumes, handling times and
                costs, and see hours reclaimed, monthly savings and payback. Then combine agents
                into a portfolio and see the rolled-up case.
              </p>
              <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                <span><strong className="text-foreground">{agentFamilies.length}</strong> Agent Families</span>
                <span><strong className="text-foreground">{totalCalculators}</strong> Workflow calculators</span>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 bg-muted/30" data-testid="section-benefits">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {benefits.map((benefit) => (
                <div key={benefit.title} className="text-center">
                  <div className="w-12 h-12 rounded-full bg-brand-blue/10 flex items-center justify-center mx-auto mb-3">
                    <benefit.icon className="h-6 w-6 text-brand-blue" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12" data-testid="section-paths">
          <div className="max-w-4xl mx-auto px-4 md:px-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-2 border-border hover:border-border/80 transition-all hover:shadow-md group">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-4">
                    <Search className="h-6 w-6 text-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Explore by Family</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Browse agents by category and see individual ROI calculations for each agent.
                  </p>
                  <a
                    href="#section-families"
                    onClick={(e) => {
                      e.preventDefault();
                      document.querySelector('[data-testid="section-families"]')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-blue hover:text-brand-blue/80 transition-colors group-hover:gap-2"
                  >
                    Explore Agents <ArrowRight className="h-4 w-4 transition-all" />
                  </a>
                </CardContent>
              </Card>

              <Link href="/portfolio">
                <Card className="border-2 border-brand-blue/30 hover:border-brand-blue/60 bg-brand-blue/5 dark:bg-brand-blue/10 transition-all hover:shadow-md cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-lg bg-brand-blue/10 flex items-center justify-center mb-4">
                      <Layers className="h-6 w-6 text-brand-blue" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Build Your Agent Portfolio</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Select multiple agents and see your total ROI across all selected agents.
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-blue group-hover:gap-2 transition-all">
                      Build Portfolio <ArrowRight className="h-4 w-4" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16" data-testid="section-families">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Select an Agent Family
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Choose an agent family to explore individual agents and calculate your
                personalized ROI based on your organization's specific operational metrics.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {agentFamilies.map((family) => (
                <FamilyCard key={family.id} family={family} />
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-brand-navy text-white" data-testid="section-cta">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Every number on this site is an input you can change
              </h2>
              <p className="text-white/80 mb-8">
                The agents and default values are illustrative samples. Replace them with your own
                volumes and costs to build a case you can defend in front of a finance team.
              </p>
              <a 
                href="https://7thfloorventures.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-brand-navy font-semibold rounded-md hover:bg-white/90 transition-colors"
                data-testid="button-contact-cta"
              >
                About the author
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
