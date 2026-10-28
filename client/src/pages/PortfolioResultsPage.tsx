import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PortfolioTotalsBanner } from '@/components/PortfolioTotalsBanner';
import { PortfolioAgentResultCard } from '@/components/PortfolioAgentResultCard';
import { usePortfolio } from '@/context/PortfolioContext';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/formatters';
import { Link, Redirect } from 'wouter';
import {
  ArrowLeft,
  DollarSign,
  Clock,
  TrendingUp,
  Users,
  Shield,
  CreditCard,
  Plus,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function PortfolioResultsPage() {
  const { agents, totals } = usePortfolio();

  if (totals.agentCount === 0) {
    return <Redirect to="/portfolio" />;
  }

  const agentArray = Array.from(agents.values());

  const metrics = [
    {
      icon: DollarSign,
      label: 'Total Annual Savings',
      value: formatCurrency(totals.totalAnnualSavings),
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950/30',
      span: true,
    },
    {
      icon: CreditCard,
      label: 'Monthly Savings',
      value: formatCurrency(totals.totalMonthlySavings),
      color: 'text-foreground',
      bgColor: 'bg-muted/50',
    },
    {
      icon: TrendingUp,
      label: 'Net savings per $1 of platform cost',
      value: `${totals.roiMultiplier.toFixed(1)}x`,
      color: 'text-brand-blue',
      bgColor: 'bg-brand-blue/5',
    },
    {
      icon: Clock,
      label: 'Hours Reclaimed / Month',
      value: formatNumber(totals.totalHoursReclaimed),
      color: 'text-foreground',
      bgColor: 'bg-muted/50',
    },
    {
      icon: Users,
      label: 'FTE Equivalent',
      value: totals.totalFTE.toFixed(1),
      color: 'text-foreground',
      bgColor: 'bg-muted/50',
    },
    {
      icon: CreditCard,
      label: 'Payback on implementation',
      value: `${formatNumber(totals.paybackMonths)} months`,
      color: 'text-foreground',
      bgColor: 'bg-muted/50',
    },
    {
      icon: Shield,
      label: 'Avg Error Reduction',
      value: formatPercent(totals.avgErrorReduction),
      color: 'text-foreground',
      bgColor: 'bg-muted/50',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <PortfolioTotalsBanner />

      <main className="flex-1">
        <section className="py-12 md:py-16">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <div className="flex items-center gap-2 mb-6">
              <Link href="/portfolio" className="text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <Link href="/portfolio" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Back to Selection
              </Link>
            </div>

            <div className="text-center mb-10">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                Your Agent Portfolio
              </h1>
              <p className="text-muted-foreground">
                {totals.agentCount} agent{totals.agentCount !== 1 ? 's' : ''} selected across your operations
              </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
              {metrics.map((metric) => (
                <Card
                  key={metric.label}
                  className={`${metric.bgColor} border-0 ${metric.span ? 'col-span-2 md:col-span-3' : ''}`}
                >
                  <CardContent className={`${metric.span ? 'py-6' : 'py-4'} px-5`}>
                    <div className={`flex items-center gap-2 ${metric.span ? 'justify-center' : ''}`}>
                      <metric.icon className={`h-5 w-5 ${metric.color}`} />
                      <span className="text-sm text-muted-foreground">{metric.label}</span>
                    </div>
                    <p
                      className={`${
                        metric.span ? 'text-3xl md:text-4xl text-center mt-2' : 'text-2xl mt-1'
                      } font-bold ${metric.color} transition-all duration-300`}
                    >
                      {metric.value}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Agent Cards */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-6">
                Agent Breakdown
              </h2>
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {agentArray.map(agent => (
                  <PortfolioAgentResultCard key={agent.agentSlug} agent={agent} />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
              <Link
                href="/portfolio"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border-2 border-brand-blue text-brand-blue font-semibold hover:bg-brand-blue/5 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add More Agents
              </Link>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); window.print(); }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-brand-blue text-white font-semibold hover:bg-brand-blue/90 transition-colors shadow-lg"
              >
                Print or save as PDF
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
