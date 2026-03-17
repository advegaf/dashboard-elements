const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function ordinalSuffix(day: number): string {
  return [1, 21, 31].includes(day) ? 'st' : [2, 22].includes(day) ? 'nd' : [3, 23].includes(day) ? 'rd' : 'th'
}

/** "Feb 5" */
export function formatDateShort(d: Date): string {
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`
}

/** "Feb 5th" */
export function formatDateWithSuffix(d: Date): string {
  const day = d.getDate()
  return `${MONTHS[d.getMonth()]} ${day}${ordinalSuffix(day)}`
}

/** "Feb 5th, 2025" */
export function formatDateFull(d: Date): string {
  const day = d.getDate()
  return `${MONTHS[d.getMonth()]} ${day}${ordinalSuffix(day)}, ${d.getFullYear()}`
}

/** "Feb 5, 2025" */
export function formatDateJoined(d: Date): string {
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}
