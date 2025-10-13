function getCountdownLabel(targetDate) {
  if (!targetDate) return 'Hedef tarihi seç'
  const target = new Date(targetDate)
  if (Number.isNaN(target.getTime())) return 'Geçersiz tarih'

  const now = new Date()
  const diff = target.getTime() - now.getTime()
  const past = diff < 0
  const absolute = Math.abs(diff)

  const totalDays = Math.floor(absolute / (1000 * 60 * 60 * 24))
  const months = Math.floor(totalDays / 30)
  const days = totalDays % 30

  const parts = []
  if (months > 0) parts.push(`${months} ay`)
  parts.push(`${days} gün`)

  const label = parts.join(' ')
  return past ? `${label} geçti` : `${label} kaldı`
}

export { getCountdownLabel }
