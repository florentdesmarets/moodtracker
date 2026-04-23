import { useState, useEffect } from 'react'
import AppHeader from '../components/AppHeader'
import BgBlobs from '../components/BgBlobs'
import { useLang } from '../context/LangContext'
import { useMoods } from '../hooks/useMoods'
import { getEventById } from '../lib/events'

function StatCard({ value, label }) {
  return (
    <div className="flex-1 bg-white/20 rounded-2xl p-3 text-center">
      <p className="text-white font-extrabold text-[22px]">{value}</p>
      <p className="text-white/80 text-[9px] font-semibold mt-0.5">{label}</p>
    </div>
  )
}

function TrendCard({ emoji, result, label }) {
  return (
    <div className="flex-1 bg-white/20 rounded-2xl px-3 py-2.5 text-center">
      <p className="text-[18px] leading-none mb-1">{emoji}</p>
      <p className="text-white font-bold text-[11px] leading-snug">{result}</p>
      <p className="text-white/70 text-[9px] font-semibold mt-0.5">{label}</p>
    </div>
  )
}

function foodInfo(avg, t) {
  if (avg === null) return null
  const opts = t('foodOptions')
  const lang = t('langValue').startsWith('F') ? 'fr' : 'en'
  const suffix = lang === 'en' ? 'this month' : 'ce mois-ci'
  if (avg >= 2.5) return { emoji: opts[0].emoji, result: opts[0].label, suffix }
  if (avg >= 1.5) return { emoji: opts[1].emoji, result: opts[1].label, suffix }
  return { emoji: opts[2].emoji, result: opts[2].label, suffix }
}

function fatigueInfo(avg, t) {
  if (avg === null) return null
  const opts = t('fatigueOptions')
  const lang = t('langValue').startsWith('F') ? 'fr' : 'en'
  const suffix = lang === 'en' ? 'this month' : 'ce mois-ci'
  if (avg >= 2.5) return { emoji: opts[0].emoji, result: opts[0].label, suffix }
  if (avg >= 1.5) return { emoji: opts[1].emoji, result: opts[1].label, suffix }
  return { emoji: opts[2].emoji, result: opts[2].label, suffix }
}

export default function Stats() {
  const { t, lang }              = useLang()
  const { fetchMonth, getStats } = useMoods()
  const [moodsMap, setMoodsMap]  = useState({})
  const [stats,    setStats]     = useState({ count: 0, avg: 0, positive: 0, topEmoji: '😐', avgSommeil: null, avgNourriture: null, avgFatigue: null })

  useEffect(() => {
    const today = new Date()
    fetchMonth(today.getFullYear(), today.getMonth()).then(data => {
      setMoodsMap(data); setStats(getStats(data))
    })
  }, [])

  const today = new Date()
  const pad = (n) => String(n).padStart(2, '0')

  let streak = 0
  for (let d = today.getDate(); d >= 1; d--) {
    const dateStr = `${today.getFullYear()}-${pad(today.getMonth()+1)}-${pad(d)}`
    if (moodsMap[dateStr]) streak++; else break
  }

  // Semaine calendaire lun → dim
  const monday = new Date(today)
  const dow = today.getDay() === 0 ? 6 : today.getDay() - 1
  monday.setDate(today.getDate() - dow)

  const todayStr = `${today.getFullYear()}-${pad(today.getMonth()+1)}-${pad(today.getDate())}`
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const dateStr = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`
    return { dateStr, niveau: moodsMap[dateStr]?.niveau ?? null, isToday: dateStr === todayStr, isFuture: d > today }
  })

  const foodInf    = foodInfo(stats.avgNourriture, t)
  const fatigueInf = fatigueInfo(stats.avgFatigue, t)

  // Événements de vie ce mois
  const isFR = lang === 'fr'
  const eventEntries = Object.values(moodsMap).filter(m => m.event)
  const eventGroups = {}
  eventEntries.forEach(m => {
    if (!eventGroups[m.event]) eventGroups[m.event] = []
    eventGroups[m.event].push(m.niveau)
  })
  const eventStats = Object.entries(eventGroups).map(([id, niveaux]) => {
    const ev = getEventById(id)
    if (!ev) return null
    const avg = niveaux.reduce((a, b) => a + b, 0) / niveaux.length
    return { ev, avg: Math.round(avg * 10) / 10, count: niveaux.length }
  }).filter(Boolean).sort((a, b) => b.avg - a.avg)

  const monthName = t('months')[today.getMonth()].toLowerCase()
  const monthLabel = t('langValue').startsWith('F')
    ? `en ${monthName}`
    : `in ${t('months')[today.getMonth()]}`

  return (
    <div className="bg-app relative overflow-hidden flex flex-col min-h-[100dvh]">
      <BgBlobs />
      <div className="relative z-10 w-full max-w-[560px] mx-auto px-6 pt-12 pb-8">
      <AppHeader />
      <div className="fade-in">
        <h1 className="text-white font-extrabold text-[18px] text-center">{t('statsTitle')}</h1>
        <p className="text-white/55 text-[11px] text-center mb-4 capitalize">{t('months')[today.getMonth()]} {today.getFullYear()}</p>
        <div className="flex gap-2 mb-2">
          <StatCard value={stats.count}           label={`${t('daysTracked')} · ${monthLabel}`} />
          <StatCard value={stats.topEmoji}        label={`${t('topMood')} · ${monthLabel}`} />
        </div>
        <div className="flex gap-2 mb-2">
          <StatCard value={stats.positive + '%'}  label={`${t('positiveDays')} · ${monthLabel}`} />
          <StatCard value={streak}                label={t('streak')} />
        </div>
        {stats.avgSommeil !== null && (
          <div className="flex gap-2 mb-2">
            <StatCard value={`😴 ${stats.avgSommeil}h`} label={`${t('avgSleep')} · ${monthLabel}`} />
          </div>
        )}
        {(foodInf || fatigueInf) && (
          <div className="flex gap-2 mb-2">
            {foodInf && (
              <TrendCard emoji={foodInf.emoji} result={foodInf.result} label={`${t('avgFoodLabel')} · ${monthLabel}`} />
            )}
            {fatigueInf && (
              <TrendCard emoji={fatigueInf.emoji} result={fatigueInf.result} label={`${t('avgFatigueLabel')} · ${monthLabel}`} />
            )}
          </div>
        )}

        {/* Événements de vie */}
        {eventStats.length > 0 && (
          <div className="bg-white/12 rounded-2xl p-3 mt-1 mb-2">
            <p className="text-white text-[12px] font-bold mb-2.5">
              🎭 {isFR ? 'Événements ce mois' : 'Events this month'}
            </p>
            <div className="flex flex-col gap-2">
              {eventStats.map(({ ev, avg, count }) => {
                const moodColor = avg >= 5 ? '#4CAF50' : avg >= 4 ? '#FFD700' : avg >= 3 ? '#FFB347' : '#FF4F4F'
                return (
                  <div key={ev.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[18px]">{ev.emoji}</span>
                      <div>
                        <p className="text-white text-[12px] font-semibold leading-none">
                          {isFR ? ev.fr : ev.en}
                        </p>
                        {count > 1 && (
                          <p className="text-white/50 text-[9px] mt-0.5">
                            {count}× {isFR ? 'ce mois' : 'this month'}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-16 h-1.5 rounded-full bg-white/15 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${(avg / 7) * 100}%`, background: moodColor }} />
                      </div>
                      <span className="text-white/80 text-[11px] font-bold w-8 text-right">{avg}/7</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="bg-white/12 rounded-2xl p-3 mt-1">
          <p className="text-white text-[12px] font-bold mb-2">{t('thisWeek')}</p>
          <div className="flex items-end gap-1.5 h-16">
            {weekDays.map(({ niveau, isToday, isFuture }, i) => (
              <div key={i} className="flex-1 rounded-t-md"
                style={{
                  height: niveau !== null ? (niveau / 7 * 100) + '%' : '8%',
                  background: isFuture
                    ? 'rgba(255,255,255,0.08)'
                    : niveau !== null
                      ? (isToday ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.5)')
                      : 'rgba(255,255,255,0.18)',
                  minHeight: '4px',
                }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-1">
            {weekDays.map(({ isToday }, i) => (
              <span key={i} className={`text-[8px] ${isToday ? 'text-white font-bold' : 'text-white/55'}`}>
                {t('daysShort')[i]}
              </span>
            ))}
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
