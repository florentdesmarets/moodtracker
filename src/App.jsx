import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { LangProvider }          from './context/LangContext'
import Welcome      from './pages/Welcome'
import Login        from './pages/Login'
import Register     from './pages/Register'
import Mood         from './pages/Mood'
import MoodPositive from './pages/MoodPositive'
import Journal      from './pages/Journal'
import Sleep        from './pages/Sleep'
import Thanks       from './pages/Thanks'
import Calendar     from './pages/Calendar'
import Stats        from './pages/Stats'
import Chart        from './pages/Chart'
import Account      from './pages/Account'

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

export default function App() {
  return (
    <AuthProvider>
      <LangProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/"         element={<PublicRoute><Welcome /></PublicRoute>} />
            <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/mood"          element={<PrivateRoute><Mood /></PrivateRoute>} />
            <Route path="/mood-positive" element={<PrivateRoute><MoodPositive /></PrivateRoute>} />
            <Route path="/journal"       element={<PrivateRoute><Journal /></PrivateRoute>} />
            <Route path="/sleep"         element={<PrivateRoute><Sleep /></PrivateRoute>} />
            <Route path="/thanks"        element={<PrivateRoute><Thanks /></PrivateRoute>} />
            <Route path="/calendar"      element={<PrivateRoute><Calendar /></PrivateRoute>} />
            <Route path="/stats"         element={<PrivateRoute><Stats /></PrivateRoute>} />
            <Route path="/chart"         element={<PrivateRoute><Chart /></PrivateRoute>} />
            <Route path="/account"       element={<PrivateRoute><Account /></PrivateRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </LangProvider>
    </AuthProvider>
  )
}
