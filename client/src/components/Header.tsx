import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Zap } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  showBackButton?: boolean;
  backTo?: string;
}

export function Header({ showBackButton = false, backTo = '/' }: HeaderProps) {
  const [location] = useLocation();
  const isEmbed = location.includes('/embed');

  if (isEmbed) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          <div className="flex items-center gap-4">
            {showBackButton && (
              <Link href={backTo}>
                <Button variant="ghost" size="sm" data-testid="button-back">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              </Link>
            )}
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer" data-testid="link-logo">
                <div className="w-8 h-8 rounded-lg bg-brand-navy flex items-center justify-center">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <span className="font-semibold text-lg text-foreground">AI Agent ROI Calculator</span>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/portfolio">
              <Button variant="outline" size="sm" data-testid="button-portfolio">
                Build a portfolio
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
