import { useState, useEffect } from 'react'
import { useLang } from '../context/LangContext'

const EMOJIS = ['😭', '😔', '😕', '😐', '🙂', '😊', '😄']

export default function MoodModal({ open, onClose, onSave, dayLabel, initialMood, initialComment, initialSommeil }) {
  const { t } = useLang()
  const [selectedLevel, setSelectedLevel] = useState(null)
  const [selectedEmoji, setSelectedEmoji] = useState(null)
  const [comment,       setComment]       = useState('')
  const [sommeil,       setSommeil]       = useState('')

  useEffect(() => {
    if (open) {
      setSelectedLevel(initialMood ?? null)
      setSelectedEmoji(initialMood ? EMOJIS[initialMood - 1] : null)
      setComment(initialComment ?? '')
      setSommeil(initialSommeil ?? '')
    }
  }, [open, initialMood, initialComment, initialSommeil])

  function handleSave() {
    if (!selectedLevel) return
    onSave({ niveau: selectedLevel, emoji: selectedEmoji, commentaire: comment, sommeil: sommeil || null })
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-40 transition-all duration-300 ${open ? 'bg-[rgba(180,60,10,0.6)] pointer-events-auto' : 'bg-transparent pointer-events-none'}`}
        onClick={onClose}
      />
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 max-w-[430px] mx-auto rounded-t-3xl transition-transform duration-300 ${open ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ background: 'linear-gradient(150deg, #FFD07A, #FF8C5A)' }}
      >
        <div className="px-5 pt-5 pb-8">
          <p className="text-white text-[15px] font-extrabold text-center mb-3">{dayLabel}</p>
          <div className="flex justify-around mb-3 px-1">
            {EMOJIS.map((emoji, i) => (
              <button
                key={i}
                onClick={() => { setSelectedLevel(i + 1); setSelectedEmoji(emoji) }}
                className="text-[26px] rounded-full border-none bg-transparent cursor-pointer transition-all duration-200 leading-none flex items-center justify-center"
                style={{
                  width: '36px',
                  height: '36px',
                  background: selectedLevel === i + 1 ? 'rgba(255,255,255,0.38)' : 'transparent',
                  boxShadow: selectedLevel === i + 1 ? '0 0 0 3px rgba(255,255,255,0.5)' : 'none',
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
          <div className="bg-white/20 rounded-2xl px-4 py-3 mb-2">
            <p className="text-white text-[13px] font-bold mb-2">😴 {t('sleepQuestion')}</p>
            <div className="flex gap-1.5 flex-wrap">
              {[5,6,7,8,9,10].map(h => (
                <button key={h} onClick={() => setSommeil(sommeil === h ? '' : h)}
                  className="flex-1 py-1.5 rounded-full text-[12px] font-bold border-none cursor-pointer transition-all"
                  style={{
                    background: sommeil === h ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.25)',
                    color: sommeil === h ? '#FF8040' : 'white',
                  }}>
                  {h}h
                </button>
              ))}
            </div>
          </div>
          <textarea
            className="w-full rounded-2xl px-4 py-2.5 text-[13px] text-[#555] outline-none resize-none h-16 mb-3 border-none"
            style={{ background: 'rgba(255,255,255,0.92)' }}
            placeholder={t('addComment')}
            value={comment}
            onChange={e => setComment(e.target.value)}
          />
          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-full text-[13px] font-bold text-white border border-white/50 bg-white/20 active:scale-[0.97] transition-transform">
              {t('cancel')}
            </button>
            <button onClick={handleSave} className="flex-1 py-2.5 rounded-full text-[13px] font-bold text-[#FF7040] bg-white border-none active:scale-[0.97] transition-transform">
              {t('save')}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
