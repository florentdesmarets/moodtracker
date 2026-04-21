import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import BgBlobs from '../components/BgBlobs'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import { supabase } from '../lib/supabase'
import { useMoods } from '../hooks/useMoods'
import { BADGES, computeBadges, getAvatar } from '../lib/badges'

function Toggle({ checked, onChange }) {
  return (
    <button onClick={() => onChange(!checked)}
      className={`relative w-10 h-6 rounded-full transition-colors duration-300 border-none cursor-pointer flex-shrink-0 ${checked ? 'bg-[#5DC98A]' : 'bg-[#ccc]'}`}>
      <span className="absolute top-[3px] w-[18px] h-[18px] bg-white rounded-full shadow transition-transform duration-300"
        style={{ transform: checked ? 'translateX(-19px)' : 'translateX(1px)' }} />
    </button>
  )
}

function EditField({ placeholder, onSave, onCancel, t }) {
  const [val, setVal] = useState('')
  return (
    <div className="py-2">
      <input type="text" placeholder={placeholder} value={val} onChange={e => setVal(e.target.value)}
        className="w-full bg-[#fff3ee] rounded-full px-4 py-2 text-[13px] text-[#555] outline-none border-none mb-2" />
      <div className="flex gap-2">
        <button onClick={onCancel} className="flex-1 py-2 rounded-full text-[12px] font-bold text-[#FF7040] bg-[#fff3ee] border-none cursor-pointer">{t('cancel')}</button>
        <button onClick={() => val && onSave(val)} className="flex-1 py-2 rounded-full text-[12px] font-bold text-white bg-[#FF8040] border-none cursor-pointer">{t('save')}</button>
      </div>
    </div>
  )
}

function CardRow({ label, value, editContent }) {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <div className="flex justify-between items-center py-2.5 border-b border-[#f5ede5]">
        <div>
          <p className="text-[11px] text-[#aaa] font-semibold uppercase tracking-wide">{label}</p>
          <p className="text-[14px] text-[#444] font-semibold">{value}</p>
        </div>
        <button onClick={() => setOpen(v => !v)} className="text-[12px] text-[#FF8040] font-bold bg-transparent border-none cursor-pointer">
          {open ? '✕' : 'Modifier'}
        </button>
      </div>
      {open && editContent(() => setOpen(false))}
    </div>
  )
}

export default function Account() {
  const navigate = useNavigate()
  const { user, profile, signOut, updateProfile } = useAuth()
  const { t, lang, setLang } = useLang()
  const { fetchGlobalStats } = useMoods()
  const [showDelete,        setShowDelete]        = useState(false)
  const [showClearHistory,  setShowClearHistory]  = useState(false)
  const [notifActive,       setNotifActive]       = useState(profile?.notif_active ?? true)
  const [soundActive,       setSoundActive]       = useState(false)
  const [badges,            setBadges]            = useState([])
  const [globalStats,       setGlobalStats]       = useState({ count: 0, streak: 0 })

  useEffect(() => {
    fetchGlobalStats().then(stats => {
      setGlobalStats(stats)
      setBadges(computeBadges(stats))
    })
  }, [])

  async function handleSetAvatar(id) {
    await updateProfile({ avatar: id })
  }

  async function handleShare(badge) {
    const text = t('shareBadgeText')(t(badge.labelKey), 'MoodTracker')
    if (navigator.share) {
      await navigator.share({ title: 'MoodTracker', text })
    } else {
      await navigator.clipboard.writeText(text)
      alert('Copié dans le presse-papier !')
    }
  }

  async function handleLogout() { await signOut(); navigate('/') }

  async function handleDeleteAccount() {
    const { error } = await supabase.rpc('delete_user')
    if (error) { alert(error.message); return }
    await signOut()
    navigate('/')
  }
  async function handleSave(field, value) { await updateProfile({ [field]: value }) }

  async function handleExport() {
    const { data, error } = await supabase
      .from('moods')
      .select('date, niveau, emoji, commentaire, sommeil')
      .eq('user_id', user.id)
      .order('date', { ascending: true })
    if (error) { alert(error.message); return }
    const header = 'Date,Niveau,Emoji,Commentaire,Sommeil (h)'
    const rows = data.map(r =>
      `${r.date},${r.niveau},${r.emoji},"${(r.commentaire ?? '').replace(/"/g, '""')}",${r.sommeil ?? ''}`
    )
    const csv  = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url
    a.download = `moodtracker_${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleClearHistory() {
    const { error } = await supabase.from('moods').delete().eq('user_id', user.id)
    if (error) { alert(error.message); return }
    setShowClearHistory(false)
    navigate('/mood')
  }

  return (
    <div className="bg-app relative overflow-hidden flex flex-col px-6 pt-12 pb-8 min-h-[100dvh]">
      <BgBlobs />
      <AppHeader />
      <div className="relative z-10 overflow-y-auto no-scrollbar flex-1 fade-in">
        <h1 className="text-white font-extrabold text-[18px] text-center mb-4">{t('accountTitle')}</h1>
        <div className="flex flex-col items-center mb-4">
          <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-[32px] mb-2">
            {getAvatar(profile?.avatar ?? 'starter')}
          </div>
          <p className="text-white font-extrabold text-[15px]">{profile?.prenom ?? user?.email}</p>
        </div>

        <p className="text-white/72 text-[11px] font-bold uppercase tracking-widest mb-1.5">{t('personalInfo')}</p>
        <div className="bg-white/95 rounded-2xl px-4 mb-3">
          <CardRow label={t('firstname')} value={profile?.prenom ?? user?.email ?? ''}
            editContent={(close) => <EditField placeholder={t('firstname')} onSave={v => { handleSave('prenom', v); close() }} onCancel={close} t={t} />} />
          <CardRow label={t('pwdLabel')} value="••••••••"
            editContent={(close) => (
              <div className="py-2">
                {t('pwdPlaceholders').map((ph, i) => (
                  <input key={i} type="password" placeholder={ph}
                    className="w-full bg-[#fff3ee] rounded-full px-4 py-2 text-[13px] text-[#555] outline-none border-none mb-2" />
                ))}
                <div className="flex gap-2">
                  <button onClick={close} className="flex-1 py-2 rounded-full text-[12px] font-bold text-[#FF7040] bg-[#fff3ee] border-none cursor-pointer">{t('cancel')}</button>
                  <button onClick={close} className="flex-1 py-2 rounded-full text-[12px] font-bold text-white bg-[#FF8040] border-none cursor-pointer">{t('save')}</button>
                </div>
              </div>
            )} />
        </div>

        <p className="text-white/72 text-[11px] font-bold uppercase tracking-widest mb-1.5">{t('preferences')}</p>
        <div className="bg-white/95 rounded-2xl px-4 mb-3 overflow-hidden">
          <div className="flex justify-between items-center py-2.5 border-b border-[#f5ede5]">
            <div>
              <p className="text-[11px] text-[#aaa] font-semibold uppercase tracking-wide">{t('notifLabel')}</p>
              <p className="text-[14px] text-[#444] font-semibold">{t('dailyReminder')}</p>
            </div>
            <Toggle checked={notifActive} onChange={v => { setNotifActive(v); handleSave('notif_active', v) }} />
          </div>
          <div className="flex justify-between items-center py-2.5 border-b border-[#f5ede5]">
            <div>
              <p className="text-[11px] text-[#aaa] font-semibold uppercase tracking-wide">{t('soundLabel')}</p>
              <p className="text-[14px] text-[#444] font-semibold">{t('soundEffects')}</p>
            </div>
            <Toggle checked={soundActive} onChange={setSoundActive} />
          </div>
          <div className="flex justify-between items-center py-2.5">
            <div>
              <p className="text-[11px] text-[#aaa] font-semibold uppercase tracking-wide">{t('langLabel')}</p>
              <p className="text-[14px] text-[#444] font-semibold">{t('langValue')}</p>
            </div>
            <button onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
              className="text-[12px] text-[#FF8040] font-bold bg-transparent border-none cursor-pointer">
              {lang === 'fr' ? '🇬🇧 EN' : '🇫🇷 FR'}
            </button>
          </div>
        </div>

        <p className="text-white/72 text-[11px] font-bold uppercase tracking-widest mb-1.5">{t('badgesTitle')}</p>
        <div className="grid grid-cols-4 gap-2 mb-3">
          {badges.map(badge => (
            <div key={badge.id}
              onClick={() => badge.unlocked && handleSetAvatar(badge.id)}
              className="flex flex-col items-center bg-white/95 rounded-2xl py-3 px-1 relative"
              style={{ opacity: badge.unlocked ? 1 : 0.4, cursor: badge.unlocked ? 'pointer' : 'default' }}>
              <span className="text-[28px] mb-1">{badge.emoji}</span>
              <span className="text-[9px] font-bold text-[#FF8040] text-center leading-tight">{t(badge.labelKey).replace(/[^a-zA-ZÀ-ÿ\s·]/g, '').trim()}</span>
              {!badge.unlocked && <span className="text-[8px] text-[#bbb]">{t('badgeLocked')}</span>}
              {badge.unlocked && profile?.avatar === badge.id && (
                <span className="absolute -top-1 -right-1 text-[12px]">✓</span>
              )}
              {badge.unlocked && (
                <button onClick={e => { e.stopPropagation(); handleShare(badge) }}
                  className="mt-1 text-[8px] text-[#aaa] bg-transparent border-none cursor-pointer">
                  {t('shareBtn')} ↗
                </button>
              )}
            </div>
          ))}
        </div>

        <p className="text-white/72 text-[11px] font-bold uppercase tracking-widest mb-1.5">{t('privacy')}</p>
        <div className="bg-white/95 rounded-2xl px-4 mb-4">
          <div className="flex justify-between items-center py-2.5 border-b border-[#f5ede5]">
            <div>
              <p className="text-[11px] text-[#aaa] font-semibold uppercase tracking-wide">{t('dataLabel')}</p>
              <p className="text-[14px] text-[#444] font-semibold">{t('exportData')}</p>
            </div>
            <span onClick={handleExport} className="text-[12px] text-[#FF8040] font-bold cursor-pointer">↓ CSV</span>
          </div>
          <div className="flex justify-between items-center py-2.5">
            <div>
              <p className="text-[11px] text-[#aaa] font-semibold uppercase tracking-wide">{t('historyLabel')}</p>
              <p className="text-[14px] text-[#444] font-semibold">{t('deleteHistory')}</p>
            </div>
            <span onClick={() => setShowClearHistory(true)} className="text-[12px] text-[#FF5050] font-bold cursor-pointer">{t('clearLabel')}</span>
          </div>
        </div>

        <button onClick={() => setShowDelete(true)}
          className="w-full py-2.5 rounded-full text-[13px] font-bold text-white bg-[rgba(255,80,80,0.25)] border-2 border-[rgba(255,120,120,0.6)] active:bg-[rgba(255,80,80,0.45)] transition-colors mb-4">
          {t('deleteAccount')}
        </button>
      </div>

      {showClearHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(180,60,10,0.6)] max-w-[430px] mx-auto">
          <div className="rounded-3xl p-6 w-64 text-center shadow-2xl" style={{ background: 'linear-gradient(150deg,#FFD07A,#FF8C5A)' }}>
            <p className="text-[36px] mb-2">🗂️</p>
            <p className="text-white font-extrabold text-[15px] mb-2">{lang === 'fr' ? 'Supprimer l\'historique ?' : 'Delete history?'}</p>
            <p className="text-white/85 text-[12px] mb-4 leading-relaxed">{lang === 'fr' ? 'Toutes tes humeurs seront supprimées définitivement.' : 'All your moods will be permanently deleted.'}</p>
            <div className="flex gap-2">
              <button onClick={() => setShowClearHistory(false)} className="flex-1 py-2.5 rounded-full text-[13px] font-bold text-white bg-white/22 border border-white/50">{t('cancel')}</button>
              <button onClick={handleClearHistory} className="flex-1 py-2.5 rounded-full text-[13px] font-bold text-white bg-[rgba(255,80,80,0.75)] border-none">{t('clearLabel')}</button>
            </div>
          </div>
        </div>
      )}

      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(180,60,10,0.6)] max-w-[430px] mx-auto">
          <div className="rounded-3xl p-6 w-64 text-center shadow-2xl" style={{ background: 'linear-gradient(150deg,#FFD07A,#FF8C5A)' }}>
            <p className="text-[36px] mb-2">⚠️</p>
            <p className="text-white font-extrabold text-[15px] mb-2">{t('deleteTitle')}</p>
            <p className="text-white/85 text-[12px] mb-4 leading-relaxed">{t('deleteBody')}</p>
            <div className="flex gap-2">
              <button onClick={() => setShowDelete(false)} className="flex-1 py-2.5 rounded-full text-[13px] font-bold text-white bg-white/22 border border-white/50">{t('cancel')}</button>
              <button onClick={handleDeleteAccount} className="flex-1 py-2.5 rounded-full text-[13px] font-bold text-white bg-[rgba(255,80,80,0.75)] border-none">{t('deleteConfirm')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
