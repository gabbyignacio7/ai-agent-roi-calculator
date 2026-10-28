import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, RefreshCw, Banknote, Briefcase, ArrowRight } from 'lucide-react';
import { AgentFamily } from '@/config/families';

interface FamilyCardProps {
  family: AgentFamily;
}

const iconMap: Record<string, typeof Mail> = {
  Mail,
  RefreshCw,
  Banknote,
  Briefcase,
};

export function FamilyCard({ family }: FamilyCardProps) {
  const Icon = iconMap[family.icon] || Briefcase;
  const calculatorCount = family.agents.filter(a => a.hasCalculator).length;

  return (
    <Link href={`/family/${family.slug}`}>
      <Card 
        className="h-full cursor-pointer transition-all duration-200 hover-elevate group border-2"
        style={{ 
          borderColor: `${family.color}30`,
          backgroundColor: `${family.bgColor}20`
        }}
        data-testid={`card-family-${family.slug}`}
      >
        <CardHeader className="pb-3">
          <div 
            className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-105"
            style={{ backgroundColor: family.bgColor }}
          >
            <Icon className="w-7 h-7" style={{ color: family.color }} />
          </div>
          <CardTitle className="text-xl flex items-center gap-2 justify-between">
            <span>{family.name}</span>
            <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </CardTitle>
          <CardDescription className="text-sm">
            {family.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold" style={{ color: family.color }}>{calculatorCount}</span>
              <span className="text-muted-foreground">workflow calculator{calculatorCount === 1 ? '' : 's'}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
