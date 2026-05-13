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
  // 1. SAFETY GUARD: 
  // Kapag ang income ay negative, zero, o hindi lumampas sa threshold, 0 tax agad.
  if (taxableIncome <= 20833) {
    return 0;
  }

  const income = taxableIncome;

  // 2. TRAIN LAW MONTHLY THRESHOLDS
  if (income <= 33333) {
    return (income - 20833) * 0.15;
  }
  
  if (income <= 66667) {
    return 1875 + (income - 33333) * 0.20;
  }
  
  if (income <= 166667) {
    return 8541.67 + (income - 66667) * 0.25;
  }
  
  if (income <= 666667) {
    return 33541.67 + (income - 166667) * 0.30;
  }

  // 3. HIGHEST BRACKET
  // Siguradong lampas 666,667 bago gamitin ang formula na ito.
  // Ginamit natin ang Math.max(0, ...) dito bilang extra protection.
  const excess = Math.max(0, income - 666667);
  return 183541.67 + (excess * 0.35);
};