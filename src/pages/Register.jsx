import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import BgBlobs from '../components/BgBlobs'

function getStrength(pwd) {
  if (!pwd) return 0
  let score = 0
  if (pwd.length >= 8)             score++
  if (/[A-Z]/.test(pwd))           score++
  if (/[0-9]/.test(pwd))           score++
  if (/[^A-Za-z0-9]/.test(pwd))    score++
  return score // 0–4
}

const STRENGTH_LABELS = {
  fr: ['', 'Trop faible', 'Faible', 'Moyen', 'Fort 💪'],
  en: ['', 'Too weak', 'Weak', 'Fair', 'Strong 💪'],
}
const STRENGTH_COLORS = ['', '#ef4444', '#f97316', '#eab308', '#22c55e']

export default function Register() {
  const navigate   = useNavigate()
  const { signUp } = useAuth()
  const { t, lang, setLang } = useLang()
  const [prenom,   setPrenom]   = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState('')
  const [loading,  setLoading]  = useState(false)
  const [honeypot, setHoneypot] = useState('')
  const [captcha,  setCaptcha]  = useState(() => {
    const a = Math.floor(Math.random() * 9) + 1
    const b = Math.floor(Math.random() * 9) + 1
    return { a, b, answer: '' }
  })

  const strength = getStrength(password)
  const strengthLabel = STRENGTH_LABELS[lang]?.[strength] ?? STRENGTH_LABELS.fr[strength]
  const strengthColor = STRENGTH_COLORS[strength]

  async function handleSubmit() {
    // Honeypot : si un bot a rempli le champ caché, on ignore silencieusement
    if (honeypot) return
    // Captcha math
    if (parseInt(captcha.answer) !== captcha.a + captcha.b) {
      setError(lang === 'fr' ? 'Mauvaise réponse au calcul 🤖 — réessaie !' : 'Wrong answer to the math check 🤖 — try again!')
      setCaptcha(c => {
        const a = Math.floor(Math.random() * 9) + 1
        const b = Math.floor(Math.random() * 9) + 1
        return { a, b, answer: '' }
      })
      return
    }
    if (!prenom || !email || !password) {
      setError(lang === 'fr' ? 'Tous les champs sont requis' : 'All fields are required')
      return
    }
    if (strength < 3) {
      setError(lang === 'fr'
        ? 'Mot de passe trop faible — utilise 8+ caractères, une majuscule, un chiffre et un caractère spécial.'
        : 'Password too weak — use 8+ characters, an uppercase letter, a number and a special character.')
      return
    }
    if (password !== confirm) {
      setError(lang === 'fr' ? 'Les mots de passe ne correspondent pas' : 'Passwords do not match')
      return
    }
    setLoading(true); setError(''); setSuccess('')
    const { error, emailConfirmation } = await signUp({ email, password, prenom, langue: lang })
    setLoading(false)
    if (error) { setError(error.message); return }
    if (emailConfirmation) {
      setSuccess(lang === 'fr'
        ? `Un email de confirmation a été envoyé à ${email}. Vérifie ta boîte mail !`
        : `A confirmation email has been sent to ${email}. Check your inbox!`)
      return
    }
    navigate('/mood')
  }

  /* ── Écran de succès : email de confirmation envoyé ── */
  if (success) {
    return (
      <div className="bg-app relative overflow-hidden flex flex-col min-h-[100dvh]">
        <BgBlobs />
        <div className="relative z-10 w-full max-w-[420px] mx-auto px-6 flex flex-col flex-1 items-center justify-center fade-in">
          <div className="text-center mb-6">
            <span className="text-[72px] pop-in inline-block mb-3">📬</span>
            <h1 className="text-white font-extrabold text-[22px] mb-2">
              {lang === 'fr' ? 'Vérifie ta boîte mail !' : 'Check your inbox!'}
            </h1>
            <p className="text-white/80 text-[14px] leading-relaxed">
              {lang === 'fr'
                ? <>Un email de confirmation a été envoyé à<br /><span className="font-bold text-white">{email}</span></>
                : <>A confirmation email was sent to<br /><span className="font-bold text-white">{email}</span></>}
            </p>
          </div>

          <div className="w-full bg-white/15 rounded-3xl px-5 py-5 mb-6 border border-white/20">
            <p className="text-white font-bold text-[13px] mb-3">
              {lang === 'fr' ? '👇 Comment faire ?' : '👇 What to do?'}
            </p>
            <div className="flex flex-col gap-3">
              {(lang === 'fr'
                ? ['1️⃣  Ouvre l\'email de Moody dans ta boîte de réception', '2️⃣  Clique sur le bouton « Confirmer mon adresse »', '3️⃣  Tu es redirigé vers l\'app — connecte-toi !']
                : ['1️⃣  Open the Moody email in your inbox', '2️⃣  Click the "Confirm my email" button', '3️⃣  You\'ll be redirected to the app — log in!']
              ).map((step, i) => (
                <p key={i} className="text-white/80 text-[12px] leading-relaxed">{step}</p>
              ))}
            </div>
            <div className="mt-4 bg-white/20 rounded-2xl px-4 py-3 border border-white/30">
              <p className="text-white text-[12px] font-bold mb-1">
                {lang === 'fr' ? '📂 Pas d\'email ?' : '📂 No email?'}
              </p>
              <p className="text-white/85 text-[11px] leading-relaxed">
                {lang === 'fr'
                  ? 'Vérifie ton dossier Spam ou Courriers indésirables — les emails Moody peuvent y atterrir !'
                  : 'Check your Spam or Junk folder — Moody emails sometimes land there!'}
              </p>
            </div>
          </div>

          <button onClick={() => navigate('/login')}
            className="w-full py-3 rounded-full bg-white text-[#FF7040] font-bold text-[14px] active:scale-[0.98] transition-transform mb-3">
            {lang === 'fr' ? '→ Se connecter' : '→ Log in'}
          </button>
          <p onClick={() => navigate('/')} className="text-white/60 text-[12px] cursor-pointer">
            {lang === 'fr' ? 'Retour à l\'accueil' : 'Back to home'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-app relative overflow-hidden flex flex-col min-h-[100dvh]">
      <BgBlobs />
      <div className="relative z-10 w-full max-w-[420px] mx-auto px-6 pt-12 pb-10 overflow-y-auto no-scrollbar fade-in">
        <h1 className="text-white font-extrabold text-[22px] text-center mb-4">{t('register')}</h1>
        <input className="w-full bg-white/90 rounded-full px-4 py-2.5 text-[13px] text-[#555] outline-none mb-2 border-none"
          type="text" placeholder={t('firstname')} value={prenom} onChange={e => setPrenom(e.target.value)} />
        <input className="w-full bg-white/90 rounded-full px-4 py-2.5 text-[13px] text-[#555] outline-none mb-2 border-none"
          type="email" placeholder={t('email')} value={email} onChange={e => setEmail(e.target.value)} />
        <input className="w-full bg-white/90 rounded-full px-4 py-2.5 text-[13px] text-[#555] outline-none mb-1.5 border-none"
          type="password" placeholder={t('password')} value={password} onChange={e => setPassword(e.target.value)} />

        {/* Barre de force du mot de passe */}
        {password.length > 0 && (
          <div className="mb-2 px-1">
            <div className="flex gap-1 mb-1">
              {[1,2,3,4].map(i => (
                <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
                  style={{ background: i <= strength ? strengthColor : 'rgba(255,255,255,0.25)' }} />
              ))}
            </div>
            <p className="text-[10px] font-semibold" style={{ color: strengthColor }}>{strengthLabel}</p>
            {strength < 4 && (
              <p className="text-white/55 text-[9px] mt-0.5">
                {lang === 'fr'
                  ? '8+ caractères · majuscule · chiffre · caractère spécial (!@#$…)'
                  : '8+ chars · uppercase · number · special character (!@#$…)'}
              </p>
            )}
          </div>
        )}

        {/* Champ honeypot invisible — piège les bots */}
        <input
          type="text" value={honeypot} onChange={e => setHoneypot(e.target.value)}
          style={{ opacity: 0, position: 'absolute', top: 0, left: 0, height: 0, width: 0, zIndex: -1 }}
          tabIndex={-1} autoComplete="off" aria-hidden="true"
        />
        <input className="w-full bg-white/90 rounded-full px-4 py-2.5 text-[13px] text-[#555] outline-none mb-3 border-none"
          type="password" placeholder={t('confirmPwd')} value={confirm} onChange={e => setConfirm(e.target.value)} />
        <div className="mt-1 mb-4">
          <p className="text-white/80 text-[12px] font-bold text-center mb-2">{t('chooseLanguage')}</p>
          <div className="flex gap-3">
            {['fr', 'en'].map(l => (
              <button key={l} onClick={() => setLang(l)}
                className={`flex-1 py-2.5 px-2 rounded-2xl text-[13px] font-bold text-center border-2 transition-all duration-200 ${lang === l ? 'bg-white border-white text-[#1a1a1a] scale-[1.04] shadow-md' : 'bg-white/15 border-white/35 text-white/75'}`}>
                <span className="block text-[22px] mb-1">{l === 'fr' ? '🇫🇷' : '🇬🇧'}</span>
                {l === 'fr' ? 'Français' : 'English'}
              </button>
            ))}
          </div>
        </div>
        {/* Captcha mathématique */}
        <div className="mb-3 bg-white/15 rounded-2xl px-4 py-3 border border-white/25">
          <p className="text-white/80 text-[11px] font-bold text-center mb-2 uppercase tracking-wide">
            🤖 {lang === 'fr' ? 'Vérification anti-robot' : 'Bot check'}
          </p>
          <p className="text-white text-[20px] font-extrabold text-center mb-2 tracking-wider">
            {captcha.a} + {captcha.b} = ?
          </p>
          <input
            type="number" inputMode="numeric"
            placeholder={lang === 'fr' ? 'Ta réponse…' : 'Your answer…'}
            value={captcha.answer}
            onChange={e => setCaptcha(c => ({ ...c, answer: e.target.value }))}
            className="w-full bg-white/90 rounded-full px-4 py-2 text-[14px] text-[#555] outline-none border-none text-center font-bold"
          />
        </div>

        {error && <p className="text-white text-[12px] text-center mb-3 bg-white/20 rounded-xl px-3 py-2">{error}</p>}
        <div className="flex justify-center">
          <button onClick={handleSubmit} disabled={loading}
            className="bg-white text-[#FF7040] font-bold text-[14px] rounded-full px-6 py-2.5 active:scale-[1.03] transition-transform disabled:opacity-60">
            {loading ? '...' : t('loginBtn')}
          </button>
        </div>
        <p onClick={() => navigate('/')} className="text-white/75 text-[12px] text-center mt-4 cursor-pointer">{t('back')}</p>
      </div>
    </div>
  )
}
