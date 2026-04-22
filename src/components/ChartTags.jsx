import { useMemo } from 'react'
import { translations } from '../context/LangContext'

const tagsFR = translations.fr.tags
const tagsEN = translations.en.tags
const EMOJIS = ['😭','😔','😕','😐','🙂','😊','😄']

function moodEmoji(avg) {
  return EMOJIS[Math.max(0, Math.min(6, Math.round(avg) - 1))]
}

// Détecte si une entrée contient le tag à l'index idx
// Vérifie les deux versions (FR + EN) pour gérer les changements de langue
function hasTag(commentaire, idx) {
  if (!commentaire) return false
  const parts = commentaire.split(/,\s*/).map(p => p.trim())
  return parts.includes(tagsFR[idx]) || parts.includes(tagsEN[idx])
}

// Calcul de la confiance : tient compte du nombre d'occurrences ET de la variance
function getConfidence(count, stdDev) {
  if (count >= 10 && stdDev < 1.8) return 'high'
  if (count >= 5)                   return 'medium'
  return 'low'
}

function TagRow({ item, maxImpact, lang }) {
  const barPct  = Math.min(100, (Math.abs(item.impact) / maxImpact) * 100)
  const isPos   = item.impact >= 0
  const barColor = isPos ? '#86efac' : '#fca5a5'

  const confLabel = {
    high:   lang === 'fr' ? 'Fiable'       : 'Reliable',
    medium: lang === 'fr' ? 'Indicatif'    : 'Indicative',
    low:    lang === 'fr' ? 'À confirmer'  : 'Unconfirmed',
  }[item.conf]

  const confColor = {
    high:   '#22c55e',
    medium: '#f59e0b',
    low:    '#94a3b8',
  }[item.conf]

  return (
    <div className="mb-3.5">
      {/* Ligne titre */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-white text-[11px] font-bold leading-tight">{item.label}</span>
        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          <span className="text-[11px] font-extrabold" style={{ color: barColor }}>
            {isPos ? '+' : ''}{item.impact.toFixed(1)} pts
          </span>
          <span
            className="text-[8px] px-1.5 py-0.5 rounded-full font-bold"
            style={{ background: confColor + '28', color: confColor }}>
            {confLabel}
          </span>
        </div>
      </div>

      {/* Barre d'impact */}
      <div className="h-1.5 bg-white/12 rounded-full mb-1.5 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${barPct}%`, background: barColor }}
        />
      </div>

      {/* Détails statistiques */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[9.5px] text-white/45">
        <span>{moodEmoji(item.avgWith)} <strong className="text-white/65">{item.avgWith.toFixed(1)}</strong> {lang === 'fr' ? 'avec' : 'with'}</span>
        <span className="text-white/25">·</span>
        <span>{moodEmoji(item.avgWithout)} <strong className="text-white/65">{item.avgWithout.toFixed(1)}</strong> {lang === 'fr' ? 'sans' : 'without'}</span>
        <span className="text-white/25">·</span>
        <span>{item.count} {lang === 'fr' ? 'fois' : 'times'} ({item.pct}%)</span>
        <span className="text-white/25">·</span>
        <span>σ={item.stdDev.toFixed(1)}</span>
      </div>
    </div>
  )
}

export default function ChartTags({ allEntries, t }) {
  const lang = t('langValue').startsWith('F') ? 'fr' : 'en'

  const analysis = useMemo(() => {
    if (!allEntries || allEntries.length < 10) return null

    const totalAvg = allEntries.reduce((s, m) => s + m.niveau, 0) / allEntries.length

    const results = tagsFR.map((_, idx) => {
      const withTag    = allEntries.filter(m => hasTag(m.commentaire, idx))
      const withoutTag = allEntries.filter(m => !hasTag(m.commentaire, idx))

      if (withTag.length < 3 || withoutTag.length < 2) return null

      const avgWith    = withTag.reduce((s, m) => s + m.niveau, 0) / withTag.length
      const avgWithout = withoutTag.reduce((s, m) => s + m.niveau, 0) / withoutTag.length
      const impact     = avgWith - avgWithout

      // Écart-type sur les jours avec le tag (mesure la variance / fiabilité)
      const variance = withTag.reduce((s, m) => s + (m.niveau - avgWith) ** 2, 0) / withTag.length
      const stdDev   = Math.sqrt(variance)

      return {
        idx,
        label:      t('tags')[idx],
        count:      withTag.length,
        avgWith,
        avgWithout,
        impact,
        stdDev,
        conf:       getConfidence(withTag.length, stdDev),
        pct:        Math.round((withTag.length / allEntries.length) * 100),
      }
    }).filter(Boolean)

    // Trier par impact décroissant
    return results.sort((a, b) => b.impact - a.impact)
  }, [allEntries, t])

  if (!analysis || analysis.length === 0) return null

  const helps   = analysis.filter(s => s.impact >=  0.3)
  const drains  = analysis.filter(s => s.impact <= -0.3)
  const neutral = analysis.filter(s => Math.abs(s.impact) < 0.3)
  const maxImpact = Math.max(...analysis.map(s => Math.abs(s.impact)), 0.5)

  if (helps.length === 0 && drains.length === 0) return null

  return (
    <div className="bg-white/12 rounded-2xl p-4 mt-3">
      <p className="text-white text-[12px] font-bold mb-0.5">{t('tagCorrelationTitle')}</p>
      <p className="text-white/45 text-[10px] mb-4">{t('tagCorrelationSub')}</p>

      {/* Section positive */}
      {helps.length > 0 && (
        <div className="mb-4">
          <p className="text-[9px] font-extrabold uppercase tracking-widest mb-3" style={{ color: '#86efac' }}>
            ✨ {t('tagCorrelationHelps')}
          </p>
          {helps.map(item => (
            <TagRow key={item.idx} item={item} maxImpact={maxImpact} lang={lang} />
          ))}
        </div>
      )}

      {/* Séparateur si les deux sections existent */}
      {helps.length > 0 && drains.length > 0 && (
        <div className="border-t border-white/10 mb-4" />
      )}

      {/* Section négative */}
      {drains.length > 0 && (
        <div className="mb-3">
          <p className="text-[9px] font-extrabold uppercase tracking-widest mb-3" style={{ color: '#fca5a5' }}>
            😔 {t('tagCorrelationDrains')}
          </p>
          {[...drains].reverse().map(item => (
            <TagRow key={item.idx} item={item} maxImpact={maxImpact} lang={lang} />
          ))}
        </div>
      )}

      {/* Activités neutres — repliées par défaut */}
      {neutral.length > 0 && (
        <details className="group mt-1">
          <summary className="cursor-pointer list-none flex items-center gap-1.5 text-[9px] text-white/35 font-semibold select-none">
            <span className="group-open:hidden">▸</span>
            <span className="hidden group-open:inline">▾</span>
            {neutral.length} {t('tagCorrelationNeutral')}
          </summary>
          <div className="mt-3">
            {neutral.map(item => (
              <TagRow key={item.idx} item={item} maxImpact={Math.max(maxImpact, 0.3)} lang={lang} />
            ))}
          </div>
        </details>
      )}

      {/* Légende */}
      <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap gap-x-3 gap-y-1">
        {[
          { color: '#22c55e', label: lang === 'fr' ? 'Fiable (10+ entrées, faible variance)' : 'Reliable (10+ entries, low variance)' },
          { color: '#f59e0b', label: lang === 'fr' ? 'Indicatif (5–9 entrées)' : 'Indicative (5–9 entries)' },
          { color: '#94a3b8', label: lang === 'fr' ? 'À confirmer (3–4 entrées)' : 'Unconfirmed (3–4 entries)' },
        ].map(({ color, label }) => (
          <span key={color} className="flex items-center gap-1 text-[8.5px] text-white/40">
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
            {label}
          </span>
        ))}
        <span className="text-[8.5px] text-white/35 w-full mt-0.5">
          σ = {lang === 'fr' ? 'écart-type (dispersion des valeurs)' : 'standard deviation (data spread)'}
        </span>
      </div>
    </div>
  )
}
