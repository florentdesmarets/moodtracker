import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import BgBlobs from '../components/BgBlobs'
import { useLang } from '../context/LangContext'

export default function Journal() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t }    = useLang()
  const { level, emoji } = location.state ?? { level: 4, emoji: '😐' }
  const [text, setText] = useState('')

  return (
    <div className="bg-app relative overflow-hidden flex flex-col px-6 pt-12 pb-8 min-h-[100dvh]">
      <BgBlobs />
      <AppHeader />
      <div className="relative z-10 fade-in">
        <h1 className="text-white font-extrabold text-[21px] text-center mb-2">{t('listeningTitle')}</h1>
        <p className="text-[36px] text-center mb-3">{emoji}</p>
        <div className="flex items-center gap-2 mt-3">
          <button onClick={() => navigate('/mood')} className="text-white/70 text-[18px] bg-transparent border-none">✕</button>
          <input
            className="flex-1 bg-white/90 rounded-full px-4 py-2.5 text-[13px] text-[#555] outline-none border-none focus:bg-white"
            type="text" placeholder={t('journalPH')} value={text} onChange={e => setText(e.target.value)}
          />
          <button onClick={() => navigate('/sleep', { state: { level, emoji, commentaire: text } })} className="text-white/90 text-[18px] bg-transparent border-none">➤</button>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {t('tags').map((tag, i) => (
            <button key={i} onClick={() => setText(tag)}
              className="bg-white/28 text-white text-[11px] font-semibold rounded-full px-3 py-1 border border-white/38 active:bg-white/48 transition-colors">
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
