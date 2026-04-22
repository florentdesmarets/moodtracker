import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { LangProvider, useLang } from './context/LangContext'
import { ThemeProvider }          from './context/ThemeContext'
import PWAInstallBanner from './components/PWAInstallBanner'
import Welcome      from './pages/Welcome'
import Login        from './pages/Login'
import Register     from './pages/Register'
import Mood         from './pages/Mood'
import MoodPositive from './pages/MoodPositive'
import Journal      from './pages/Journal'
import Sleep        from './pages/Sleep'
import Food         from './pages/Food'
import Fatigue      from './pages/Fatigue'
import Thanks       from './pages/Thanks'
import Calendar     from './pages/Calendar'
import Stats        from './pages/Stats'
import Chart        from './pages/Chart'
import Account      from './pages/Account'
import Crisis       from './pages/Crisis'
import About        from './pages/About'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? children : <Navigate to="/" replace />
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? <Navigate to="/mood" replace /> : children
}

// Panneau décoratif affiché uniquement sur desktop (lg+)
function DesktopPanel({ side }) {
  const { lang } = useLang()
  const isLeft = side === 'left'
  return (
    <div className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden"
      style={{ background: 'var(--bg-gradient, linear-gradient(160deg,#FFD07A,#FF8C5A))' }}>
      {/* Blobs */}
      <div className="absolute rounded-full blur-3xl"
        style={{ width: 320, height: 320, top: '10%', [isLeft ? 'right' : 'left']: '-5%',
          background: 'var(--blob1,#FFE08A)', opacity: 0.18 }} />
      <div className="absolute rounded-full blur-3xl"
        style={{ width: 240, height: 240, bottom: '15%', [isLeft ? 'left' : 'right']: '5%',
          background: 'var(--blob2,#FF5533)', opacity: 0.12 }} />
      <div className="absolute rounded-full blur-3xl"
        style={{ width: 180, height: 180, top: '50%', [isLeft ? 'left' : 'right']: '15%',
          background: 'var(--blob3,#FFD07A)', opacity: 0.10 }} />

      {/* Contenu du panneau */}
      <div className="relative z-10 text-center px-10 select-none">
        {isLeft ? (
          <>
            <div className="text-8xl mb-5 drop-shadow-lg">😊</div>
            <h1 className="text-white font-extrabold text-5xl mb-3 drop-shadow">Moody</h1>
            <p className="text-white/60 text-lg leading-relaxed">
              {lang === 'fr' ? 'Journal émotionnel\nbienveillant' : 'Your daily\nemotional journal'}
            </p>
            <p className="text-white/35 text-sm mt-6 leading-relaxed max-w-xs">
              {lang === 'fr'
                ? 'Suis ton humeur, ton sommeil et tes activités pour mieux te comprendre.'
                : 'Track your mood, sleep and activities to better understand yourself.'}
            </p>
          </>
        ) : (
          <div className="max-w-xs">
            <p className="text-white/25 text-[11px] leading-relaxed">
              ⚕️ {lang === 'fr'
                ? 'Moody est un outil d\'aide au suivi émotionnel. Il ne remplace pas un professionnel de santé.'
                : 'Moody is an emotional tracking tool. It does not replace a healthcare professional.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <LangProvider>
          {/* Wrapper desktop : fond plein + contenu centré */}
          <div className="flex min-h-screen"
            style={{ background: 'var(--bg-gradient, linear-gradient(160deg,#FFD07A,#FF8C5A))' }}>

            <DesktopPanel side="left" />

            {/* Zone principale — toujours 100% sur mobile, 430px max sur desktop */}
            <div className="w-full lg:max-w-[430px] lg:flex-shrink-0 relative overflow-x-hidden"
              style={{ boxShadow: '0 0 80px rgba(0,0,0,0.15)' }}>
              <BrowserRouter basename="/moodtracker">
                <PWAInstallBanner />
                <Routes>
                  <Route path="/"         element={<PublicRoute><Welcome /></PublicRoute>} />
                  <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
                  <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
                  <Route path="/mood"          element={<PrivateRoute><Mood /></PrivateRoute>} />
                  <Route path="/mood-positive" element={<PrivateRoute><MoodPositive /></PrivateRoute>} />
                  <Route path="/journal"       element={<PrivateRoute><Journal /></PrivateRoute>} />
                  <Route path="/sleep"         element={<PrivateRoute><Sleep /></PrivateRoute>} />
                  <Route path="/food"          element={<PrivateRoute><Food /></PrivateRoute>} />
                  <Route path="/fatigue"       element={<PrivateRoute><Fatigue /></PrivateRoute>} />
                  <Route path="/thanks"        element={<PrivateRoute><Thanks /></PrivateRoute>} />
                  <Route path="/calendar"      element={<PrivateRoute><Calendar /></PrivateRoute>} />
                  <Route path="/stats"         element={<PrivateRoute><Stats /></PrivateRoute>} />
                  <Route path="/chart"         element={<PrivateRoute><Chart /></PrivateRoute>} />
                  <Route path="/account"       element={<PrivateRoute><Account /></PrivateRoute>} />
                  <Route path="/crisis"        element={<PrivateRoute><Crisis /></PrivateRoute>} />
                  <Route path="/about"         element={<About />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </BrowserRouter>
            </div>

            <DesktopPanel side="right" />
          </div>
        </LangProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}
