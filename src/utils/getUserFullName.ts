export function getUserFullName(from?: { first_name: string; last_name?: string }) {
  return `${from?.first_name} ${from?.last_name || ''}`.trim();
}
