export function generateCode(prefix: string, seq: number) {
  const padded = String(seq).padStart(4, '0');
  return `${prefix}-${padded}`;
}
