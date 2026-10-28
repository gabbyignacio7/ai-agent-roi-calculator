import { InputConfig } from '@/lib/types';
import { HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface InputFieldProps {
  config: InputConfig;
  value: number;
  onChange: (id: string, value: number) => void;
}

export function InputField({ config, value, onChange }: InputFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value) || 0;
    const clampedValue = Math.max(config.min || 0, Math.min(config.max || Infinity, newValue));
    onChange(config.id, clampedValue);
  };

  const prefix = config.type === 'currency' ? '$' : '';
  const suffix = config.type === 'percentage' ? '%' : '';

  return (
    <div className="space-y-2" data-testid={`input-field-${config.id}`}>
      <div className="flex items-center gap-1">
        <Label htmlFor={config.id} className="text-sm font-medium text-foreground">
          {config.label}
        </Label>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="More information"
              data-testid={`tooltip-trigger-${config.id}`}
            >
              <HelpCircle className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <p className="text-sm">{config.tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </div>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            {prefix}
          </span>
        )}
        <Input
          id={config.id}
          type="number"
          value={value}
          onChange={handleChange}
          min={config.min}
          max={config.max}
          className={`${prefix ? 'pl-7' : ''} ${suffix ? 'pr-8' : ''} text-base h-11`}
          data-testid={`input-${config.id}`}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}
