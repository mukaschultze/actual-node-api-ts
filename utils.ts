export function amountToInteger(n: number) {
  return Math.round(n * 100) | 0;
}

export function integerToAmount(n: number) {
  return parseFloat((n / 100).toFixed(2));
}
