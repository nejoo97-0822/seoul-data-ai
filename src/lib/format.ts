export function formatNumber(n: number): string {
  return n.toLocaleString("ko-KR");
}

export function formatScore(n: number): string {
  return n.toFixed(1);
}
