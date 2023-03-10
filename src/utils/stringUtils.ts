export function clearStringSpaces(str: string): string {
  return str.trim().replace(/\s{2,}/gi, '');
}
