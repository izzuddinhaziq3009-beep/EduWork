import { format, formatDistanceToNow, parseISO } from 'date-fns'

export function fmtDate(iso: string) {
  return format(parseISO(iso), 'MMM d, yyyy')
}

export function fmtDateTime(iso: string) {
  return format(parseISO(iso), 'MMM d, yyyy · h:mm a')
}

export function fmtRelative(iso: string) {
  return formatDistanceToNow(parseISO(iso), { addSuffix: true })
}

export function fmtDuration(hours: number) {
  if (hours < 1) return `${Math.round(hours * 60)}m`
  if (hours === 1) return '1h'
  return `${hours}h`
}

export function fmtInitials(name: string) {
  return name.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase()
}
