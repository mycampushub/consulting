export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

export function formatCurrencyCompact(amount: number, currency: string = 'USD'): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M ${currency}`
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K ${currency}`
  }
  return formatCurrency(amount, currency)
}