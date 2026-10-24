type NairaFormatOptions = {
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
};

export const formatNaira = (amount: number, options: NairaFormatOptions = {}) => (
  `₦${new Intl.NumberFormat('en-NG', {
    minimumFractionDigits: options.minimumFractionDigits ?? 0,
    maximumFractionDigits: options.maximumFractionDigits ?? 2,
  }).format(Number(amount || 0))}`
);