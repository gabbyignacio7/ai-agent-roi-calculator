export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value);
};

export const formatPercent = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

export const formatMonths = (value: number): string => {
  if (value < 1) {
    return `${Math.round(value * 30)} days`;
  }
  if (value === 1) {
    return '1 month';
  }
  return `${value.toFixed(1)} months`;
};

export const formatHours = (value: number): string => {
  if (value < 1) {
    return `${Math.round(value * 60)} min`;
  }
  return `${value.toFixed(0)} hrs`;
};
