function daysInMonth(year, month) { return new Date(year, month + 1, 0).getDate() }

export default function ChartLine({ year, month, moodsMap }) {
  const days = daysInMonth(year, month)
  const W = 260, H = 92
  const pad = (n) => String(n).padStart(2, '0')
  const pts = []

  for (let d = 1; d <= days; d++) {
    const dateStr = `${year}-${pad(month + 1)}-${pad(d)}`
    const mood = moodsMap[dateStr]
    if (mood?.niveau) {
      pts.push({
        x: Math.round((d - 1) / (days - 1) * W),
        y: Math.round(H - (mood.niveau - 1) / 6 * 80)
      })
    }
  }

  if (pts.length < 2) return null

  let linePath = `M${pts[0].x},${pts[0].y}`
  for (let i = 1; i < pts.length; i++) {
    const c1x = pts[i-1].x + (pts[i].x - pts[i-1].x) / 3
    const c2x = pts[i].x   - (pts[i].x - pts[i-1].x) / 3
    linePath += ` C${c1x},${pts[i-1].y} ${c2x},${pts[i].y} ${pts[i].x},${pts[i].y}`
  }
  const fillPath = linePath + ` L${pts[pts.length-1].x},${H} L${pts[0].x},${H} Z`

  return (
    <svg viewBox={`0 0 ${W} ${H + 14}`} width="100%" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.32)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>
      <path d={fillPath} fill="url(#cg)" />
      <path d={linePath} fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="0" y1={H} x2={W} y2={H} stroke="rgba(255,255,255,0.25)" strokeWidth="0.5" />
      {[1, 8, 15, 20, 25, days].map(d => (
        <text key={d} x={Math.round((d-1)/(days-1)*W)} y={H+12} fill="rgba(255,255,255,0.45)" fontSize="7" fontFamily="Nunito">{d}</text>
      ))}
    </svg>
  )
}
