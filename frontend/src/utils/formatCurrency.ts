export function toAmount(value: number | string): number {
  const parsed = typeof value === 'number' ? value : Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatCurrency(amount: number | string): string {
  return `$${toAmount(amount).toFixed(2)}`;
}
