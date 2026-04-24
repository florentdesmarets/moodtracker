import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import BgBlobs from '../components/BgBlobs'
import EmojiPicker from '../components/EmojiPicker'
import { useLang } from '../context/LangContext'
import { useMoods } from '../hooks/useMoods'

/* ── Son de sélection (si effets sonores activés) ────────────── */
function playSelectSound() {
  if (localStorage.getItem('soundFx') !== 'true') return
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator(); const g = ctx.createGain()
    osc.connect(g); g.connect(ctx.destination)
    osc.type = 'sine'; osc.frequency.value = 528
    g.gain.setValueAtTime(0, ctx.currentTime)
    g.gain.linearRampToValueAtTime(0.10, ctx.currentTime + 0.04)
    g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.28)
    osc.start(); osc.stop(ctx.currentTime + 0.3)
    osc.onended = () => ctx.close()
  } catch(_) {}
}

/* ── Couleur selon niveau ─────────────────────────────────────── */
function moodColor(niveau) {
  if (!niveau) return 'rgba(255,255,255,0.15)'
  if (niveau <= 2) return '#ef4444'
  if (niveau <= 4) return '#f97316'
  if (niveau === 5) return '#facc15'
  return '#22c55e'
}

/* ── 7 dernières dates YYYY-MM-DD ─────────────────────────────── */
function getLast7Days() {
  const days = []
  const pad = n => String(n).padStart(2, '0')
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`)
  }
  return days
}

/* ── Labels humeur ───────────────────────────────────────────── */
const MOOD_LABELS = {
  fr: ['','Très difficile','Difficile','Moyen','Neutre','Plutôt bien','Bien','Excellent'],
  en: ['','Very hard','Hard','Below avg','Neutral','Pretty good','Good','Excellent'],
}

/* ── Résumé du jour ──────────────────────────────────────────── */
function TodayRecap({ entry, lang, onRedo, onCalendar }) {
  const color  = moodColor(entry.niveau)
  const label  = (MOOD_LABELS[lang] ?? MOOD_LABELS.fr)[entry.niveau] ?? ''
  const tags   = entry.commentaire
    ? entry.commentaire.split(/,\s*/).filter(Boolean)
    : []

  const FOOD_LABEL = lang === 'en'
    ? { 3: '🍽️ Ate well', 2: '🥗 Ate a little', 1: "😔 Didn't eat" }
    : { 3: '🍽️ Bien mangé', 2: '🥗 Peu mangé', 1: '😔 Pas mangé' }
  const FAT_LABEL = lang === 'en'
    ? { 3: '⚡ Rested', 2: '😌 A bit tired', 1: '😓 Very tired' }
    : { 3: '⚡ Reposé·e', 2: '😌 Un peu fatigué·e', 1: '😓 Très fatigué·e' }

  return (
    <div className="flex flex-col flex-1 fade-in">
      {/* Message */}
      <div className="text-center mb-6">
        <p className="text-white/70 text-[13px] font-semibold uppercase tracking-widest mb-1">
          {lang === 'fr' ? "Déjà renseigné aujourd'hui" : "Already logged today"}
        </p>
        <h1 className="text-white font-extrabold text-[22px] leading-tight">
          {lang === 'fr' ? 'Voici ton humeur du jour' : "Here's your mood for today"}
        </h1>
      </div>

      {/* Carte récap */}
      <div className="bg-white/15 rounded-3xl px-6 py-6 flex flex-col items-center gap-4 border border-white/20">
        {/* Emoji + niveau */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-24 h-24 rounded-full flex items-center justify-center text-[52px] shadow-lg border-4 border-white/30"
            style={{ background: color }}>
            {entry.emoji}
          </div>
          <span className="text-white font-extrabold text-[18px]">{label}</span>
          <div className="flex gap-1">
            {[1,2,3,4,5,6,7].map(i => (
              <div key={i} className="w-2 h-2 rounded-full"
                style={{ background: i <= entry.niveau ? color : 'rgba(255,255,255,0.2)' }} />
            ))}
          </div>
        </div>

        {/* Méta : sommeil / nourriture / fatigue */}
        {(entry.sommeil != null || entry.nourriture != null || entry.fatigue != null) && (
          <div className="flex flex-wrap justify-center gap-2 w-full">
            {entry.sommeil != null && (
              <span className="bg-white/20 rounded-full px-3 py-1 text-white text-[11px] font-semibold">
                😴 {entry.sommeil}h
              </span>
            )}
            {entry.nourriture != null && (
              <span className="bg-white/20 rounded-full px-3 py-1 text-white text-[11px] font-semibold">
                {FOOD_LABEL[entry.nourriture]}
              </span>
            )}
            {entry.fatigue != null && (
              <span className="bg-white/20 rounded-full px-3 py-1 text-white text-[11px] font-semibold">
                {FAT_LABEL[entry.fatigue]}
              </span>
            )}
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1.5 w-full">
            {tags.slice(0, 6).map(tag => (
              <span key={tag} className="bg-white/20 rounded-full px-2.5 py-0.5 text-white/90 text-[10px] font-medium">
                {tag}
              </span>
            ))}
            {tags.length > 6 && (
              <span className="bg-white/20 rounded-full px-2.5 py-0.5 text-white/60 text-[10px]">
                +{tags.length - 6}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex-1" />

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <button onClick={onCalendar}
          className="w-full py-3.5 rounded-full text-white font-bold text-[15px] bg-white/25 border-2 border-white/50 active:scale-[0.98] transition-transform">
          {lang === 'fr' ? '📅 Voir le calendrier' : '📅 See calendar'}
        </button>
        <button onClick={onRedo}
          className="w-full py-2.5 rounded-full text-white/70 font-semibold text-[13px] bg-transparent border border-white/25 active:scale-[0.98] transition-transform">
          {lang === 'fr' ? '↺ Refaire mon humeur du jour' : '↺ Redo today\'s mood'}
        </button>
      </div>
    </div>
  )
}

export default function Mood() {
  const navigate = useNavigate()
  const { t, lang } = useLang()
  const { fetchMonth, fetchGlobalStats } = useMoods()

  const [selectedLevel, setSelectedLevel] = useState(null)
  const [feedback,      setFeedback]      = useState(null)
  const [weekMoods,     setWeekMoods]     = useState({})
  const [streak,        setStreak]        = useState(0)
  const [loadedWeek,    setLoadedWeek]    = useState(false)
  const [forceRedo,     setForceRedo]     = useState(false)

  /* ── Chargement des 7 derniers jours + streak ─────────────────── */
  useEffect(() => {
    const today = new Date()
    const yr = today.getFullYear()
    const mo = today.getMonth()

    const load = async () => {
      const map = await fetchMonth(yr, mo)
      if (today.getDate() <= 6) {
        const prevYr = mo === 0 ? yr - 1 : yr
        const prevMo = mo === 0 ? 11 : mo - 1
        const prevMap = await fetchMonth(prevYr, prevMo)
        setWeekMoods({ ...prevMap, ...map })
      } else {
        setWeekMoods(map)
      }
      setLoadedWeek(true)
    }
    load()
    fetchGlobalStats().then(s => setStreak(s.streak ?? 0))
  }, []) // eslint-disable-line

  /* ── Données semaine ──────────────────────────────────────────── */
  const last7    = getLast7Days()
  const dShort   = t('daysShort')
  const todayStr = last7[6]
  const todayEntry = weekMoods[todayStr] ?? null

  /* ── Afficher le récap si déjà loggé aujourd'hui ─────────────── */
  const showRecap = loadedWeek && todayEntry && !forceRedo

  function getDayLabel(dateStr) {
    const d = new Date(dateStr + 'T00:00:00')
    const moddyDay = (d.getDay() + 6) % 7
    return dShort[moddyDay]
  }

  /* ── Sélection de l'humeur ────────────────────────────────────── */
  function handleSelect(level, emoji) {
    playSelectSound()
    setSelectedLevel(level)
    if (level >= 6) {
      setFeedback({ msg: t('moodHappy'), btn: t('continueBtn'),  action: () => navigate('/mood-positive', { state: { level, emoji } }) })
    } else if (level >= 4) {
      setFeedback({ msg: t('moodOk'),    btn: t('moreTellBtn'),  action: () => navigate('/journal',       { state: { level, emoji } }) })
    } else {
      setFeedback({ msg: t('moodSad'),   btn: t('confideBtn'),   action: () => navigate('/journal',       { state: { level, emoji } }) })
    }
  }

  return (
    <div className="bg-app relative overflow-hidden flex flex-col min-h-[100dvh]">
      <BgBlobs />
      <div className="relative z-10 w-full max-w-[560px] mx-auto px-5 pt-12 pb-6 flex flex-col flex-1">
        <AppHeader />

        {/* ── Vue récap (déjà loggé aujourd'hui) ─────────────────── */}
        {showRecap ? (
          <TodayRecap
            entry={todayEntry}
            lang={lang}
            onRedo={() => setForceRedo(true)}
            onCalendar={() => navigate('/calendar')}
          />
        ) : (

        <div className="flex flex-col flex-1">

          {/* ── Titre ────────────────────────────────────────────────── */}
          <h1 className="text-white font-extrabold text-[20px] text-center leading-snug mb-2">
            {t('moodQuestion').split('\n').map((line, i) => (
              <span key={i}>{line}{i === 0 && <br />}</span>
            ))}
          </h1>

          {/* ── Sélecteur d'humeur ───────────────────────────────────── */}
          <div className="mt-8">
            <EmojiPicker selected={selectedLevel} onSelect={handleSelect} />
          </div>

          {/* ── Hint / feedback ──────────────────────────────────────── */}
          <div className="flex items-center justify-center min-h-[80px]">
            {feedback ? (
              <div className="text-center fade-in">
                <p className="text-white font-bold text-[14px] mb-3">{feedback.msg}</p>
                <button
                  onClick={feedback.action}
                  className="px-7 py-2.5 rounded-full text-white font-bold text-[14px] bg-white/25 border-2 border-white/65 active:scale-[1.03] transition-transform"
                >
                  {feedback.btn}
                </button>
              </div>
            ) : (
              <p className="text-white/50 text-[13px]">{t('moodHint')}</p>
            )}
          </div>

          {/* ── Spacer ───────────────────────────────────────────────── */}
          <div className="flex-1" />

          {/* ── 7 derniers jours ─────────────────────────────────────── */}
          <div className="bg-white/12 rounded-2xl px-4 py-3 mb-3">
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-white/70 text-[11px] font-bold uppercase tracking-wide">
                {lang === 'fr' ? '7 derniers jours' : 'Last 7 days'}
              </p>
              {streak > 1 && (
                <span className="text-[11px] font-bold bg-white/20 text-white rounded-full px-2.5 py-0.5">
                  🔥 {streak} {lang === 'fr' ? 'j.' : 'd.'}
                </span>
              )}
            </div>

            {loadedWeek ? (
              <div className="flex justify-between">
                {last7.map(date => {
                  const entry   = weekMoods[date]
                  const isToday = date === todayStr
                  return (
                    <div key={date} className="flex flex-col items-center gap-1">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-[17px] transition-all duration-300 ${isToday ? 'ring-2 ring-white/60 ring-offset-1 ring-offset-transparent' : ''}`}
                        style={{ background: moodColor(entry?.niveau) }}
                      >
                        {entry?.emoji ?? ''}
                      </div>
                      <span className={`text-[9px] font-semibold ${isToday ? 'text-white' : 'text-white/45'}`}>
                        {getDayLabel(date)}
                      </span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex justify-between">
                {last7.map(date => (
                  <div key={date} className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 rounded-full animate-pulse" style={{ background: 'rgba(255,255,255,0.1)' }} />
                    <span className="text-[9px] text-white/30">{getDayLabel(date)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Citation du jour ─────────────────────────────────────── */}
          <div className="bg-white/12 rounded-2xl px-4 py-3">
            <p className="text-white/85 text-[12px] italic text-center leading-relaxed">
              "{t('dailyQuotes')[new Date().getDay()]}"
            </p>
          </div>

        </div>
        )}
      </div>
    </div>
  )
}
