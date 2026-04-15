// src/utils/statutoryCalc.ts

export const calculateSSS = (grossMonthly: number): number => {
  // Simplified SSS Table 2025/2026 
  // Base on 4.5% Employee share (approx)
  if (grossMonthly < 5000) return 225;
  if (grossMonthly >= 29750) return 1350; // Max cap
  return grossMonthly * 0.045;
};

export const calculatePhilHealth = (grossMonthly: number): number => {
  // 2026 Rate: 5% (Half is Employee Share = 2.5%)
  if (grossMonthly <= 10000) return 250; 
  if (grossMonthly >= 100000) return 2500;
  return (grossMonthly * 0.05) / 2;
};

export const calculatePagIBIG = (grossMonthly: number): number => {
  // Current 2024-2026 rule: 2% of basic pay, max contribution of 200 (Employee)
  const contribution = grossMonthly * 0.02;
  return contribution > 200 ? 200 : contribution;
};

// Idagdag ito sa iyong utils/statutoryCalc.ts

export const calculateWithholdingTax = (taxableIncome: number): number => {
  // Monthly Taxable Income Thresholds (TRAIN Law 2023-present)
  // Kinomvert natin sa Semi-Monthly (Divided by 2)
  const income = taxableIncome;

  if (income <= 10417) return 0; // 250k annual / 24 periods
  if (income <= 16667) return (income - 10417) * 0.15;
  if (income <= 33333) return 937.50 + (income - 16667) * 0.20;
  if (income <= 83333) return 4270.83 + (income - 33333) * 0.25;
  if (income <= 333333) return 16770.83 + (income - 83333) * 0.30;
  return 91770.83 + (income - 333333) * 0.35;
};