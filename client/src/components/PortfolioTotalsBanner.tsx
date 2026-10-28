import { usePortfolio } from '@/context/PortfolioContext';
import { formatCurrency, formatNumber } from '@/lib/formatters';
import { Layers, DollarSign, Clock, TrendingUp } from 'lucide-react';

export function PortfolioTotalsBanner() {
  const { totals } = usePortfolio();

  if (totals.agentCount === 0) return null;

  return (
    <div className="sticky top-16 z-40 bg-brand-navy text-white shadow-lg transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-brand-blue" />
            <span className="font-semibold text-sm">
              {totals.agentCount} Agent{totals.agentCount !== 1 ? 's' : ''} Selected
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-1.5">
              <DollarSign className="h-4 w-4 text-green-400" />
              <span className="text-white/70">Annual Savings</span>
              <span className="font-bold text-green-400 transition-all duration-300">
                {formatCurrency(totals.totalAnnualSavings)}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-blue-300" />
              <span className="text-white/70">Hours/Mo</span>
              <span className="font-bold transition-all duration-300">
                {formatNumber(totals.totalHoursReclaimed)}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-yellow-300" />
              <span className="text-white/70">Savings per platform $</span>
              <span className="font-bold transition-all duration-300">
                {totals.roiMultiplier.toFixed(1)}x
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
