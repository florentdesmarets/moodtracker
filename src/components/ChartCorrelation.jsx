function daysInMonth(year, month) { return new Date(year, month + 1, 0).getDate() }

function buildPath(pts, W, H) {
  if (pts.length < 2) return null
  let path = `M${pts[0].x},${pts[0].y}`
  for (let i = 1; i < pts.length; i++) {
    const c1x = pts[i-1].x + (pts[i].x - pts[i-1].x) / 3
    const c2x = pts[i].x   - (pts[i].x - pts[i-1].x) / 3
    path += ` C${c1x},${pts[i-1].y} ${c2x},${pts[i].y} ${pts[i].x},${pts[i].y}`
  }
  return path
}

export default function ChartCorrelation({ year, month, moodsMap, t }) {
  const days = daysInMonth(year, month)
  const W = 260, H = 90
  const pad = (n) => String(n).padStart(2, '0')

  const moodPts  = []
  const sleepPts = []
  const paired   = []

  for (let d = 1; d <= days; d++) {
    const dateStr = `${year}-${pad(month + 1)}-${pad(d)}`
    const mood = moodsMap[dateStr]
    const x = Math.round((d - 1) / (days - 1) * W)
    if (mood?.niveau) {
      moodPts.push({ x, y: Math.round(H - (mood.niveau - 1) / 6 * 80) })
    }
    if (mood?.sommeil != null) {
      const normalized = Math.max(0, Math.min(1, (mood.sommeil - 4) / 7))
      sleepPts.push({ x, y: Math.round(H - normalized * 80) })
    }
    if (mood?.niveau && mood?.sommeil != null) {
      paired.push({ mood: mood.niveau, sleep: mood.sommeil })
    }
  }

  const moodPath  = buildPath(moodPts,  W, H)
  const sleepPath = buildPath(sleepPts, W, H)

  // Calcul insight
  let insight = null
  if (paired.length >= 3) {
    const goodSleep = paired.filter(p => p.sleep >= 7)
    const badSleep  = paired.filter(p => p.sleep < 7)
    if (goodSleep.length > 0 && badSleep.length > 0) {
      const avgGood = goodSleep.reduce((a, b) => a + b.mood, 0) / goodSleep.length
      const avgBad  = badSleep.reduce((a,  b) => a + b.mood, 0) / badSleep.length
      const diff = avgGood - avgBad
      if (diff > 0.5)       insight = t('sleepCorrelationPos')
      else if (diff < -0.5) insight = t('sleepCorrelationNeg')
      else                  insight = t('sleepCorrelationNeutral')
    }
  }

  if (!moodPath && !sleepPath) return null

  return (
    <div className="bg-white/12 rounded-2xl p-4 mt-3">
      <p className="text-white text-[12px] font-bold mb-3">{t('sleepMoodChart')}</p>
      <div className="flex gap-3 mb-3">
        <span className="flex items-center gap-1 text-[10px] text-white/70">
          <span className="inline-block w-5 h-[2px] rounded bg-white/80" /> {t('moodLabel')}
        </span>
        <span className="flex items-center gap-1 text-[10px] text-white/70">
          <span className="inline-block w-5 h-[2px] rounded bg-[#C4A8FF]" /> {t('sleepLabel')}
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H + 14}`} width="100%" style={{ overflow: 'visible' }}>
        <line x1="0" y1={H} x2={W} y2={H} stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
        {moodPath  && <path d={moodPath}  fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2.5" strokeLinecap="round" />}
        {sleepPath && <path d={sleepPath} fill="none" stroke="#C4A8FF"               strokeWidth="2.5" strokeLinecap="round" strokeDasharray="5,3" />}
        {moodPts.map((p, i)  => <circle key={`m${i}`} cx={p.x} cy={p.y} r="2.5" fill="white" />)}
        {sleepPts.map((p, i) => <circle key={`s${i}`} cx={p.x} cy={p.y} r="2.5" fill="#C4A8FF" />)}
        {[1, 8, 15, 22, days].map(d => (
          <text key={d} x={Math.round((d-1)/(days-1)*W)} y={H+12} fill="rgba(255,255,255,0.4)" fontSize="7" fontFamily="Nunito">{d}</text>
        ))}
      </svg>
      {insight && (
        <p className="text-white/80 text-[11px] mt-3 leading-relaxed">{insight}</p>
      )}
    </div>
  )
}
