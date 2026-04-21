import { useNavigate } from 'react-router-dom'
import { useLang } from '../context/LangContext'

export default function Welcome() {
  const navigate = useNavigate()
  const { t }    = useLang()
  return (
    <div className="bg-app relative overflow-hidden flex flex-col items-center justify-center px-6 py-12 min-h-[100dvh]">
      <BgBlobs />
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="text-[56px] mb-4">🌅</div>
        <h1 className="text-white font-extrabold text-[22px] leading-snug mb-3">
          {t('welcome')}<br />{t('appName')}
        </h1>
        <p className="text-white/80 text-[13px] mb-8">{t('welcomeSub')}</p>
        <div className="flex gap-3">
          <button onClick={() => navigate('/login')}
            className="px-6 py-2.5 rounded-full text-white font-bold text-[14px] bg-white/25 border-2 border-white/65 active:scale-[1.03] transition-transform">
            {t('login')}
          </button>
          <button onClick={() => navigate('/register')}
            className="px-6 py-2.5 rounded-full text-white font-bold text-[14px] bg-white/25 border-2 border-white/65 active:scale-[1.03] transition-transform">
            {t('register')}
          </button>
        </div>
      </div>
    </div>
  )
}
