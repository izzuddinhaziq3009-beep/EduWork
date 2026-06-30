export function passwordStrength(pw: string) {
  if (!pw) return { level: 0, label: '' }
  let s = 0
  if (pw.length >= 8) s++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++
  if (/\d/.test(pw)) s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  const labels = ['Too short', 'Weak', 'Okay', 'Good', 'Strong']
  return { level: s, label: labels[s] }
}
