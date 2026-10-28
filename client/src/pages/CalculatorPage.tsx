import { useParams, Redirect, Link } from 'wouter';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { getFamilyBySlug, getAgentFromFamily } from '@/config/families';
import { getCalculatorConfig } from '@/config/calculators';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, HelpCircle, TrendingUp, Clock, DollarSign, Zap, Mail, RefreshCw, Banknote, Briefcase } from 'lucide-react';
import { useState, useMemo, useCallback } from 'react';

const familyIconMap: Record<string, typeof Mail> = {
  Mail,
  RefreshCw,
  Banknote,
  Briefcase,
};

export default function CalculatorPage() {
  const params = useParams<{ familySlug: string; agentSlug: string }>();
  const family = getFamilyBySlug(params.familySlug || '');
  const agentInfo = getAgentFromFamily(params.familySlug || '', params.agentSlug || '');
  const calculatorConfig = getCalculatorConfig(params.agentSlug || '');

  const [showAdvanced, setShowAdvanced] = useState(false);

  const defaultInputs = useMemo(() => {
    if (!calculatorConfig) return {};
    const defaults: Record<string, number> = {};
    calculatorConfig.inputs.forEach(input => {
      defaults[input.id] = input.defaultValue;
    });
    return defaults;
  }, [calculatorConfig]);

  const [inputs, setInputs] = useState<Record<string, number>>(defaultInputs);

  const handleInputChange = useCallback((id: string, value: number) => {
    setInputs(prev => ({ ...prev, [id]: value }));
  }, []);

  const results = useMemo(() => {
    if (!calculatorConfig) return null;
    return calculatorConfig.calculateROI(inputs);
  }, [calculatorConfig, inputs]);

  if (!family || !agentInfo || !calculatorConfig) {
    return <Redirect to="/" />;
  }

  const FamilyIcon = familyIconMap[family.icon] || Briefcase;
  const basicInputs = calculatorConfig.inputs.filter(i => !i.advanced);
  const advancedInputs = calculatorConfig.inputs.filter(i => i.advanced);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1
    }).format(value);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8" data-testid="calculator-page">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <Link href={`/family/${family.slug}`}>
            <Button variant="ghost" size="sm" className="mb-6" data-testid="button-back-agents">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to {family.name} Agents
            </Button>
          </Link>

          <div className="flex items-center gap-4 mb-8">
            <div 
              className="w-14 h-14 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: family.bgColor }}
            >
              <FamilyIcon className="w-7 h-7" style={{ color: family.color }} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" style={{ color: family.color, borderColor: `${family.color}50` }}>
                  {family.name}
                </Badge>
                <Badge variant="outline" className="text-muted-foreground">Sample inputs</Badge>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground" data-testid="text-agent-name">
                {calculatorConfig.name}
              </h1>
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{calculatorConfig.summary}</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your workflow today</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {basicInputs.map(input => (
                    <div key={input.id} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={input.id}>{input.label}</Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            {input.tooltip}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="flex items-center gap-2">
                        {input.type === 'currency' && <span className="text-muted-foreground">$</span>}
                        <Input
                          id={input.id}
                          type="number"
                          value={inputs[input.id] ?? input.defaultValue}
                          onChange={(e) => handleInputChange(input.id, parseFloat(e.target.value) || 0)}
                          min={input.min}
                          max={input.max}
                          className="flex-1"
                          data-testid={`input-${input.id}`}
                        />
                        {input.type === 'percentage' && <span className="text-muted-foreground">%</span>}
                      </div>
                    </div>
                  ))}

                  {advancedInputs.length > 0 && (
                    <>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="w-full"
                        data-testid="button-toggle-advanced"
                      >
                        {showAdvanced ? 'Hide' : 'Show'} Advanced Options
                      </Button>

                      {showAdvanced && (
                        <div className="space-y-4 pt-2 border-t">
                          {advancedInputs.map(input => (
                            <div key={input.id} className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Label htmlFor={input.id}>{input.label}</Label>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs">
                                    {input.tooltip}
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                              <div className="flex items-center gap-2">
                                {input.type === 'currency' && <span className="text-muted-foreground">$</span>}
                                <Input
                                  id={input.id}
                                  type="number"
                                  value={inputs[input.id] ?? input.defaultValue}
                                  onChange={(e) => handleInputChange(input.id, parseFloat(e.target.value) || 0)}
                                  min={input.min}
                                  max={input.max}
                                  className="flex-1"
                                  data-testid={`input-${input.id}`}
                                />
                                {input.type === 'percentage' && <span className="text-muted-foreground">%</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              <Card style={{ backgroundColor: family.bgColor, borderColor: `${family.color}30` }}>
                <CardHeader>
                  <CardTitle className="text-lg" style={{ color: family.color }}>
                    With the agent: modelled assumptions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2" data-testid="assumptions">
                    {calculatorConfig.assumptions.map(a => (
                      <div key={a.label} className="flex items-baseline justify-between gap-4 text-sm">
                        <dt className="text-muted-foreground">{a.label}</dt>
                        <dd className="font-semibold text-foreground text-right">{a.value}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="text-xs text-muted-foreground mt-4">
                    Illustrative planning assumptions. Validate them in a pilot before using the numbers in a budget.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {results && (
                <>
                  <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg text-green-800 dark:text-green-200 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Annual Savings
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-4xl font-bold text-green-600 dark:text-green-400" data-testid="text-annual-savings">
                        {formatCurrency(results.annualSavings)}
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                        {formatCurrency(results.monthlySavings)}/month
                      </p>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                          <Zap className="h-4 w-4" />
                          <span className="text-sm">First-year ROI</span>
                        </div>
                        <p className="text-2xl font-bold text-foreground" data-testid="text-roi">
                          {formatNumber(results.roiPercent)}%
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm">Payback Period</span>
                        </div>
                        <p className="text-2xl font-bold text-foreground" data-testid="text-payback">
                          {formatNumber(results.paybackMonths)} months
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm">Hours Reclaimed</span>
                        </div>
                        <p className="text-2xl font-bold text-foreground" data-testid="text-hours">
                          {formatNumber(results.hoursReclaimedPerMonth)}/mo
                        </p>
                        {results.fteEquivalent && (
                          <p className="text-sm text-muted-foreground">
                            {results.fteEquivalent} FTE equivalent
                          </p>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                          <DollarSign className="h-4 w-4" />
                          <span className="text-sm">Error Reduction</span>
                        </div>
                        <p className="text-2xl font-bold text-foreground" data-testid="text-error-reduction">
                          {formatNumber(results.currentErrorRate)}% → {formatNumber(results.newErrorRate)}%
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-muted-foreground">Cost Comparison</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Current Monthly Cost</span>
                            <span className="font-medium">{formatCurrency(results.currentMonthlyCost)}</span>
                          </div>
                          <div className="h-3 bg-red-200 dark:bg-red-900/50 rounded-full overflow-hidden">
                            <div className="h-full bg-red-500 rounded-full" style={{ width: '100%' }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>With the agent</span>
                            <span className="font-medium">{formatCurrency(results.newMonthlyCost)}</span>
                          </div>
                          <div className="h-3 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-green-500 rounded-full" 
                              style={{ width: `${Math.min(100, (results.newMonthlyCost / results.currentMonthlyCost) * 100)}%` }} 
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
