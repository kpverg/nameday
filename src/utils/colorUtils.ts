/**
 * Adjusts the brightness of a hex color.
 * Positive amount lightens, negative amount darkens.
 */
export function adjustColor(color: string, amount: number): string {
  const clamp = (val: number) => Math.min(Math.max(val, 0), 255);
  const fill = (str: string) => str.length === 1 ? '0' + str : str;

  let hex = color.replace('#', '');
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const newR = clamp(r + amount);
  const newG = clamp(g + amount);
  const newB = clamp(b + amount);

  return `#${fill(newR.toString(16))}${fill(newG.toString(16))}${fill(newB.toString(16))}`;
}

/**
 * Adds transparency to a hex color.
 * Result: #RRGGBBAA
 */
export function addAlpha(color: string, opacity: number): string {
  const _opacity = Math.round(Math.min(Math.max(opacity, 0), 1) * 255);
  return color + _opacity.toString(16).toUpperCase().padStart(2, '0');
}

export function isDark(color: string): boolean {
  let hex = color.replace('#', '');
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 128;
}
