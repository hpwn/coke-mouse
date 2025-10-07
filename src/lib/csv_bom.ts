export function withUtf8BOM(csv: string): string {
  return '\uFEFF' + csv;
}
