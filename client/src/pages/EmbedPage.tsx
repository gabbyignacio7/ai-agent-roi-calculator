import { useParams, Redirect } from 'wouter';
import { getFamilyBySlug, getAgentFromFamily } from '@/config/families';
import { getCalculatorConfig } from '@/config/calculators';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { HelpCircle, TrendingUp, Clock, DollarSign, Zap, Mail, RefreshCw, Banknote, Briefcase } from 'lucide-react';
import { useState, useMemo, useCallback } from 'react';

const familyIconMap: Record<string, typeof Mail> = {
  Mail,
  RefreshCw,
  Banknote,
  Briefcase,
};

export default function EmbedPage() {
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
    <TooltipProvider>
      <div className="p-4 max-w-4xl mx-auto" data-testid="embed-calculator">
        <div className="flex items-center gap-3 mb-6">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: family.bgColor }}
          >
            <FamilyIcon className="w-5 h-5" style={{ color: family.color }} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{family.name}</p>
            <h1 className="text-lg font-bold text-foreground">{calculatorConfig.name}</h1>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm">Your Current State</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {basicInputs.map(input => (
                  <div key={input.id} className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor={input.id} className="text-xs">{input.label}</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs text-xs">
                          {input.tooltip}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {input.type === 'currency' && <span className="text-muted-foreground text-sm">$</span>}
                      <Input
                        id={input.id}
                        type="number"
                        value={inputs[input.id] ?? input.defaultValue}
                        onChange={(e) => handleInputChange(input.id, parseFloat(e.target.value) || 0)}
                        min={input.min}
                        max={input.max}
                        className="flex-1 h-8 text-sm"
                      />
                      {input.type === 'percentage' && <span className="text-muted-foreground text-sm">%</span>}
                    </div>
                  </div>
                ))}

                {advancedInputs.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="w-full text-xs"
                  >
                    {showAdvanced ? 'Hide' : 'Show'} Advanced
                  </Button>
                )}

                {showAdvanced && advancedInputs.map(input => (
                  <div key={input.id} className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor={input.id} className="text-xs">{input.label}</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs text-xs">
                          {input.tooltip}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {input.type === 'currency' && <span className="text-muted-foreground text-sm">$</span>}
                      <Input
                        id={input.id}
                        type="number"
                        value={inputs[input.id] ?? input.defaultValue}
                        onChange={(e) => handleInputChange(input.id, parseFloat(e.target.value) || 0)}
                        min={input.min}
                        max={input.max}
                        className="flex-1 h-8 text-sm"
                      />
                      {input.type === 'percentage' && <span className="text-muted-foreground text-sm">%</span>}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {results && (
              <>
                <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                  <CardContent className="py-4">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-300 mb-1">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-xs font-medium">Annual Savings</span>
                    </div>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(results.annualSavings)}
                    </p>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-3">
                  <Card>
                    <CardContent className="py-3">
                      <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                        <Zap className="h-3 w-3" />
                        <span className="text-xs">First-year ROI</span>
                      </div>
                      <p className="text-xl font-bold">{formatNumber(results.roiPercent)}%</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="py-3">
                      <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                        <Clock className="h-3 w-3" />
                        <span className="text-xs">Payback</span>
                      </div>
                      <p className="text-xl font-bold">{formatNumber(results.paybackMonths)} mo</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="py-3">
                      <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                        <Clock className="h-3 w-3" />
                        <span className="text-xs">Hours Saved</span>
                      </div>
                      <p className="text-xl font-bold">{formatNumber(results.hoursReclaimedPerMonth)}/mo</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="py-3">
                      <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                        <DollarSign className="h-3 w-3" />
                        <span className="text-xs">Error Rate</span>
                      </div>
                      <p className="text-lg font-bold">{formatNumber(results.currentErrorRate)}% → {formatNumber(results.newErrorRate)}%</p>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mt-4 text-center">
          <a 
            href="https://7thfloorventures.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            AI Agent ROI Calculator by Gabriel Ignacio
          </a>
        </div>
      </div>
    </TooltipProvider>
  );
}
