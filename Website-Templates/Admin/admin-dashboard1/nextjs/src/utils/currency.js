export const formatNaira = (amount, options = {}) => `₦${new Intl.NumberFormat('en-NG', {
  minimumFractionDigits: options.minimumFractionDigits ?? 0,
  maximumFractionDigits: options.maximumFractionDigits ?? 2,
}).format(Number(amount || 0))}`
