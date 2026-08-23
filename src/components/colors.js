// Subjects now store a free-form hex color (e.g. "#3B82F6") chosen by
// the person, rather than a fixed palette key. A few named presets are
// still offered as quick-pick chips, but any color is allowed.

export const PRESET_COLORS = [
  { hex: '#4C6480', label: 'น้ำเงินเทา' },
  { hex: '#56744F', label: 'เขียวมอส' },
  { hex: '#E0A83B', label: 'เหลืองสร้อย' },
  { hex: '#C1432A', label: 'แดงตรายาง' },
  { hex: '#7C6BA8', label: 'ม่วงลาเวนเดอร์' },
  { hex: '#2B8C82', label: 'เขียวเทอร์คอยส์' },
]

// Older data may still have the legacy palette keys (slate/moss/amber/stamp)
// from before free color picking existed — map those to their hex value.
const LEGACY_KEYS = {
  slate: '#4C6480',
  moss: '#56744F',
  amber: '#E0A83B',
  stamp: '#C1432A',
}

export function normalizeColor(value) {
  if (!value) return LEGACY_KEYS.slate
  if (LEGACY_KEYS[value]) return LEGACY_KEYS[value]
  return value
}

function hexToRgba(hex, alpha) {
  const clean = hex.replace('#', '')
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean
  const r = parseInt(full.slice(0, 2), 16)
  const g = parseInt(full.slice(2, 4), 16)
  const b = parseInt(full.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/**
 * Returns inline style objects derived from a subject's chosen color,
 * used in place of the old Tailwind class lookup.
 */
export function colorStyles(value) {
  const hex = normalizeColor(value)
  return {
    hex,
    bg: { backgroundColor: hexToRgba(hex, 0.14) },
    text: { color: hex },
    border: { borderColor: hex },
    dot: { backgroundColor: hex },
    borderTop: { borderTopColor: hex },
  }
}
