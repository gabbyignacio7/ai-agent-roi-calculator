import { useParams, Redirect, Link } from 'wouter';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { getFamilyBySlug } from '@/config/families';
import { hasCalculator, getCalculatorConfig } from '@/config/calculators';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Mail, RefreshCw, Banknote, Briefcase, Calculator, Clock } from 'lucide-react';

const familyIconMap: Record<string, typeof Mail> = {
  Mail,
  RefreshCw,
  Banknote,
  Briefcase,
};

export default function FamilyPage() {
  const params = useParams<{ familySlug: string }>();
  const family = getFamilyBySlug(params.familySlug || '');

  if (!family) {
    return <Redirect to="/" />;
  }

  const FamilyIcon = familyIconMap[family.icon] || Briefcase;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-6" data-testid="button-back-families">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Families
            </Button>
          </Link>

          <div className="flex items-center gap-4 mb-8">
            <div 
              className="w-16 h-16 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: family.bgColor }}
            >
              <FamilyIcon className="w-8 h-8" style={{ color: family.color }} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground" data-testid="text-family-name">
                {family.name} Agents
              </h1>
              <p className="text-muted-foreground">{family.description}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {family.agents.map((agent) => {
              const agentHasCalculator = hasCalculator(agent.slug);
              
              return (
                <Card 
                  key={agent.id}
                  className={`h-full transition-all duration-200 ${agentHasCalculator ? 'hover-elevate cursor-pointer' : 'opacity-75'}`}
                  data-testid={`card-agent-${agent.slug}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg leading-tight">{agent.name}</CardTitle>
                      {agentHasCalculator ? (
                        <Badge variant="outline" className="shrink-0 text-green-600 border-green-600/30 bg-green-50 dark:bg-green-900/20">
                          <Calculator className="h-3 w-3 mr-1" />
                          Calculator
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="shrink-0 text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          Coming Soon
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{getCalculatorConfig(agent.slug)?.summary}</p>
                    {agentHasCalculator ? (
                      <Link href={`/calculator/${family.slug}/${agent.slug}`}>
                        <Button className="w-full" data-testid={`button-calculator-${agent.slug}`}>
                          Calculate ROI
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    ) : (
                      <Button variant="outline" disabled className="w-full">
                        Calculator Coming Soon
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
