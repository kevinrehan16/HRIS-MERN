export const calculateSSS = (grossMonthly: number): number => {
  if (grossMonthly < 5000) return 225;
  if (grossMonthly >= 29750) return 1350;
  return grossMonthly * 0.045;
};

export const calculatePhilHealth = (grossMonthly: number): number => {
  if (grossMonthly <= 10000) return 250; 
  if (grossMonthly >= 100000) return 2500;
  return (grossMonthly * 0.05) / 2;
};

export const calculatePagIBIG = (grossMonthly: number): number => {
  return (grossMonthly * 0.02) > 200 ? 200 : (grossMonthly * 0.02);
};

export const calculateWithholdingTax = (taxableIncome: number): number => {
  const income = taxableIncome;
  // TRAIN LAW Monthly Thresholds
  if (income <= 20833) return 0; 
  if (income <= 33333) return (income - 20833) * 0.15;
  if (income <= 66667) return 1875 + (income - 33333) * 0.20;
  if (income <= 166667) return 8541.67 + (income - 66667) * 0.25;
  if (income <= 666667) return 33541.67 + (income - 166667) * 0.30;
  return 183541.67 + (income - 666667) * 0.35;
};