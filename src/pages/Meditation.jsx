import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import BgBlobs from '../components/BgBlobs'
import { useLang } from '../context/LangContext'
import { MEDITATIONS } from '../lib/meditations'

// ─── Ton doux de respiration (Web Audio) ──────────────────────────────────────
// Petite note sine qui monte à l'inspiration, descend à l'expiration
function playBreathTone(direction) {
  try {
    const ctx  = new (window.AudioContext || window.webkitAudioContext)()
    const osc  = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    const [f0, f1] = direction === 'in' ? [396, 528] : [528, 396]
    osc.type = 'sine'
    osc.frequency.setValueAtTime(f0, ctx.currentTime)
    osc.frequency.linearRampToValueAtTime(f1, ctx.currentTime + 0.9)
    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.07, ctx.currentTime + 0.12)
    gain.gain.linearRampToValueAtTime(0.07, ctx.currentTime + 0.70)
    gain.gain.linearRampToValueAtTime(0,    ctx.currentTime + 1.0)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 1.0)
    osc.onended = () => ctx.close()
  } catch (_) { /* AudioContext non disponible → silencieux */ }
}

// ─── Sélection de la meilleure voix disponible ────────────────────────────────
// Priorité : Google (online, excellente) > Premium/Enhanced > toute voix locale
const QUALITY_KEYWORDS = ['Google', 'Premium', 'Enhanced', 'Neural', 'Natural', 'Wavenet']

function rankVoice(v) {
  for (let i = 0; i < QUALITY_KEYWORDS.length; i++) {
    if (v.name.includes(QUALITY_KEYWORDS[i])) return i
  }
  return QUALITY_KEYWORDS.length // voix générique
}

function getVoicesForLang(code) {
  return window.speechSynthesis.getVoices()
    .filter(v => v.lang.startsWith(code))
    .sort((a, b) => rankVoice(a) - rankVoice(b))
}

// ─── Cercle respiratoire animé ────────────────────────────────────────────────
function BreathingCircle({ breatheState, isPlaying }) {
  const scale = breatheState === 'in'  ? 1.40
              : breatheState === 'out' ? 0.70
              : isPlaying              ? 1.06
              : 1
  const dur = breatheState ? '5.2s' : '2.5s'
  const label = breatheState === 'in' ? '↑' : breatheState === 'out' ? '↓' : isPlaying ? '···' : '▶'

  return (
    <div className="relative flex items-center justify-center my-5 select-none">
      <div className="absolute w-52 h-52 rounded-full bg-white/8"
        style={{ transform: `scale(${scale})`, transition: `transform ${dur} ease-in-out` }} />
      <div className="absolute w-40 h-40 rounded-full bg-white/10"
        style={{ transform: `scale(${scale})`, transition: `transform ${dur} ease-in-out` }} />
      <div className="w-28 h-28 rounded-full bg-white/25 border-2 border-white/60 flex items-center justify-center backdrop-blur-sm shadow-lg"
        style={{ transform: `scale(${scale})`, transition: `transform ${dur} ease-in-out` }}>
        <span className="text-white font-bold text-[28px] leading-none">{label}</span>
      </div>
    </div>
  )
}

// ─── Carte de sélection ────────────────────────────────────────────────────────
function MeditationCard({ med, lang, isSelected, onSelect }) {
  const title = med.title[lang] ?? med.title.fr
  const desc  = med.desc[lang]  ?? med.desc.fr
  return (
    <button onClick={onSelect}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-2xl border-2 transition-all duration-200 text-left ${
        isSelected ? 'bg-white/25 border-white/70 shadow-sm' : 'bg-white/10 border-white/20'
      }`}>
      <span className="text-[26px] flex-shrink-0">{med.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="text-white font-bold text-[13px] leading-tight">{title}</p>
        <p className="text-white/60 text-[10px] leading-tight mt-0.5 line-clamp-1">{desc}</p>
      </div>
      <span className="text-white/50 text-[10px] font-bold flex-shrink-0">{med.duration}</span>
    </button>
  )
}

// ─── Page principale ───────────────────────────────────────────────────────────
export default function Meditation() {
  const { lang } = useLang()
  const [searchParams] = useSearchParams()

  const [selected,       setSelected]       = useState(() => {
    const id = searchParams.get('id')
    return id ? (MEDITATIONS.find(m => m.id === id) ?? MEDITATIONS[0]) : MEDITATIONS[0]
  })
  const [isPlaying,      setIsPlaying]      = useState(false)
  const [isPaused,       setIsPaused]       = useState(false)
  const [currentStep,    setCurrentStep]    = useState(-1)
  const [breatheState,   setBreatheState]   = useState(null)
  const [progress,       setProgress]       = useState(0)
  const [availableVoices,setAvailableVoices]= useState([])
  const [selectedVoice,  setSelectedVoice]  = useState(null) // null = auto
  const [showVoicePicker,setShowVoicePicker]= useState(false)

  const stoppedRef  = useRef(true)
  const pausedRef   = useRef(false)
  const timerRef    = useRef(null)
  const voiceRef    = useRef(null) // voix active au moment du speak

  // Charge les voix (asynchrone sur certains navigateurs)
  const loadVoices = useCallback(() => {
    const code   = lang === 'fr' ? 'fr' : 'en'
    const voices = getVoicesForLang(code)
    setAvailableVoices(voices)
    // Auto-sélection : première voix du classement (Google si dispo)
    if (!selectedVoice && voices.length > 0) {
      voiceRef.current = voices[0]
    }
  }, [lang, selectedVoice])

  useEffect(() => {
    loadVoices()
    window.speechSynthesis.addEventListener?.('voiceschanged', loadVoices)
    return () => window.speechSynthesis.removeEventListener?.('voiceschanged', loadVoices)
  }, [loadVoices])

  // Quand l'utilisateur choisit une voix manuellement
  useEffect(() => {
    if (selectedVoice) {
      const v = availableVoices.find(v => v.name === selectedVoice)
      if (v) voiceRef.current = v
    } else if (availableVoices.length > 0) {
      voiceRef.current = availableVoices[0]
    }
  }, [selectedVoice, availableVoices])

  // Nettoyage au démontage
  useEffect(() => () => {
    stoppedRef.current = true
    window.speechSynthesis.cancel()
    clearTimeout(timerRef.current)
  }, [])

  // ─ TTS ──────────────────────────────────────────────────────────────────────
  function speakText(text) {
    return new Promise(resolve => {
      window.speechSynthesis.cancel()
      const utt  = new SpeechSynthesisUtterance(text)
      utt.lang   = lang === 'fr' ? 'fr-FR' : 'en-US'
      utt.rate   = 0.76   // plus lent = plus apaisant
      utt.pitch  = 0.88   // légèrement plus grave = plus posé
      utt.volume = 1
      if (voiceRef.current) utt.voice = voiceRef.current
      utt.onend  = resolve
      utt.onerror = resolve
      window.speechSynthesis.speak(utt)
    })
  }

  function sleep(ms) {
    return new Promise(resolve => { timerRef.current = setTimeout(resolve, ms) })
  }

  // ─ Lecture séquentielle ─────────────────────────────────────────────────────
  async function runMeditation(med) {
    const script = med.script[lang] ?? med.script.fr
    stoppedRef.current = false
    pausedRef.current  = false
    setIsPlaying(true)
    setIsPaused(false)
    setProgress(0)

    for (let i = 0; i < script.length; i++) {
      if (stoppedRef.current) break
      while (pausedRef.current && !stoppedRef.current) await sleep(150)
      if (stoppedRef.current) break

      const step = script[i]
      setCurrentStep(i)
      setBreatheState(step.breathe ?? null)
      setProgress(Math.round((i / script.length) * 100))

      // Ton doux avant la parole si c'est une étape de respiration
      if (step.breathe) playBreathTone(step.breathe)

      await speakText(step.text)
      if (stoppedRef.current) break
      await sleep(step.pause)
    }

    stoppedRef.current = true
    setIsPlaying(false)
    setIsPaused(false)
    setCurrentStep(-1)
    setBreatheState(null)
    setProgress(0)
  }

  // ─ Contrôles ────────────────────────────────────────────────────────────────
  function handlePlay() { if (selected) runMeditation(selected) }

  function handlePause() {
    if (isPaused) {
      pausedRef.current = false
      window.speechSynthesis.resume()
      setIsPaused(false)
    } else {
      pausedRef.current = true
      window.speechSynthesis.pause()
      setIsPaused(true)
    }
  }

  function handleStop() {
    stoppedRef.current = true
    pausedRef.current  = false
    window.speechSynthesis.cancel()
    clearTimeout(timerRef.current)
    setIsPlaying(false)
    setIsPaused(false)
    setCurrentStep(-1)
    setProgress(0)
    setBreatheState(null)
  }

  function handleSelect(med) { if (isPlaying) handleStop(); setSelected(med) }

  // ─ Données courantes ─────────────────────────────────────────────────────────
  const script      = selected ? (selected.script[lang] ?? selected.script.fr) : []
  const currentText = currentStep >= 0 ? script[currentStep]?.text : null
  const activeVoiceName = voiceRef.current?.name ?? ''

  // Nom affiché court (sans "Microsoft" / "Google" / "Desktop" / "(fr-FR)")
  function shortName(name) {
    return name
      .replace(/Microsoft\s+/i, '')
      .replace(/Google\s+/i, '')
      .replace(/\s+Desktop$/i, '')
      .replace(/\s*\(.*\)$/, '')
      .trim()
  }

  // ─ Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="bg-app relative overflow-hidden flex flex-col min-h-[100dvh]">
      <BgBlobs />
      <div className="relative z-10 w-full max-w-[560px] mx-auto px-4 pt-12 pb-8 flex flex-col flex-1 overflow-y-auto no-scrollbar">
        <AppHeader />

        {/* Titre */}
        <div className="text-center mb-4 fade-in">
          <h1 className="text-white font-extrabold text-[18px]">
            🎧 {lang === 'fr' ? 'Méditations guidées' : 'Guided meditations'}
          </h1>
          <p className="text-white/55 text-[10px] mt-0.5">
            {lang === 'fr' ? 'Voix de ton appareil · Tons de respiration · 2–5 min'
                           : 'Device voice · Breathing tones · 2–5 min'}
          </p>
        </div>

        {/* Liste des méditations */}
        <div className="flex flex-col gap-2 mb-4">
          {MEDITATIONS.map(med => (
            <MeditationCard key={med.id} med={med} lang={lang}
              isSelected={selected?.id === med.id}
              onSelect={() => handleSelect(med)} />
          ))}
        </div>

        {/* ─── Player ──────────────────────────────────────────────────────── */}
        {selected && (
          <div className="bg-white/10 rounded-3xl px-5 py-4 border border-white/20 flex flex-col items-center">

            {/* Cercle respiratoire */}
            <BreathingCircle breatheState={breatheState} isPlaying={isPlaying && !isPaused} />

            {/* Label inspire / expire */}
            {breatheState && (
              <p className="text-white/85 text-[11px] font-bold uppercase tracking-widest -mt-2 mb-1">
                {breatheState === 'in'
                  ? (lang === 'fr' ? '↑ Inspire' : '↑ Inhale')
                  : (lang === 'fr' ? '↓ Expire'  : '↓ Exhale')}
              </p>
            )}

            {/* Texte courant */}
            <div className="min-h-[52px] flex items-center justify-center w-full mb-3 px-2">
              {currentText
                ? <p className="text-white text-[13px] font-medium text-center leading-relaxed">{currentText}</p>
                : <p className="text-white/40 text-[12px] text-center italic">
                    {lang === 'fr'
                      ? `${selected.title.fr} · ${selected.duration}`
                      : `${selected.title.en ?? selected.title.fr} · ${selected.duration}`}
                  </p>
              }
            </div>

            {/* Barre de progression */}
            <div className="w-full h-1 bg-white/15 rounded-full mb-4 overflow-hidden">
              <div className="h-full bg-white/60 rounded-full transition-all duration-1000"
                style={{ width: `${progress}%` }} />
            </div>

            {/* Contrôles lecture */}
            <div className="flex items-center justify-center gap-5 mb-4">
              {!isPlaying ? (
                <button onClick={handlePlay}
                  className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-[24px] shadow-xl active:scale-95 transition-transform"
                  style={{ color: selected.color ?? '#FF7040' }}>
                  ▶
                </button>
              ) : (
                <>
                  <button onClick={handlePause}
                    className="w-12 h-12 rounded-full bg-white/20 border-2 border-white/50 flex items-center justify-center text-[20px] text-white active:scale-95 transition-transform">
                    {isPaused ? '▶' : '⏸'}
                  </button>
                  <button onClick={handleStop}
                    className="w-12 h-12 rounded-full bg-white/20 border-2 border-white/50 flex items-center justify-center text-[20px] text-white active:scale-95 transition-transform">
                    ⏹
                  </button>
                </>
              )}
            </div>

            {/* ─── Sélecteur de voix ────────────────────────────────────── */}
            <div className="w-full border-t border-white/15 pt-3">
              <button
                onClick={() => setShowVoicePicker(v => !v)}
                className="flex items-center justify-between w-full text-left px-1">
                <span className="text-white/55 text-[10px]">
                  🎙 {lang === 'fr' ? 'Voix :' : 'Voice:'}
                  <span className="text-white/80 font-semibold ml-1">
                    {activeVoiceName ? shortName(activeVoiceName) : (lang === 'fr' ? 'Auto' : 'Auto')}
                  </span>
                </span>
                <span className="text-white/40 text-[10px]">{showVoicePicker ? '▲' : '▼'}</span>
              </button>

              {showVoicePicker && availableVoices.length > 0 && (
                <div className="mt-2 flex flex-col gap-1 max-h-36 overflow-y-auto no-scrollbar">
                  {/* Option auto */}
                  <button
                    onClick={() => { setSelectedVoice(null); setShowVoicePicker(false) }}
                    className={`text-left px-3 py-1.5 rounded-xl text-[11px] transition-all ${
                      !selectedVoice ? 'bg-white/25 text-white font-bold' : 'text-white/60 hover:bg-white/10'
                    }`}>
                    ✨ {lang === 'fr' ? 'Auto (recommandée)' : 'Auto (recommended)'}
                  </button>
                  {availableVoices.map(v => (
                    <button key={v.name}
                      onClick={() => { setSelectedVoice(v.name); setShowVoicePicker(false) }}
                      className={`text-left px-3 py-1.5 rounded-xl text-[11px] transition-all flex items-center gap-2 ${
                        selectedVoice === v.name ? 'bg-white/25 text-white font-bold' : 'text-white/60 hover:bg-white/10'
                      }`}>
                      <span>{QUALITY_KEYWORDS.some(k => v.name.includes(k)) ? '⭐' : '·'}</span>
                      <span>{shortName(v.name)}</span>
                      {!v.localService && <span className="text-white/35 text-[9px]">online</span>}
                    </button>
                  ))}
                </div>
              )}

              <p className="text-white/25 text-[9px] text-center mt-2 leading-relaxed">
                {lang === 'fr'
                  ? 'Les voix ⭐ (Google, Premium…) sont de meilleure qualité'
                  : '⭐ voices (Google, Premium…) sound more natural'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
