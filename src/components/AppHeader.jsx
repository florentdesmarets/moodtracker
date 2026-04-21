import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Drawer from './Drawer'

export default function AppHeader() {
  const { profile } = useAuth()
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      <div className="flex justify-between items-center mb-5 relative z-10">
        <span className="text-white text-[14px] font-bold">
          Hello {profile?.prenom ?? ''}
        </span>
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex flex-col gap-1 p-1 z-50 bg-transparent border-none cursor-pointer"
          aria-label="Menu"
        >
          <span className={`block w-5 h-0.5 bg-white rounded transition-all duration-300 ${drawerOpen ? 'translate-y-1.5 rotate-45' : ''}`} />
          <span className={`block w-5 h-0.5 bg-white rounded transition-all duration-300 ${drawerOpen ? 'opacity-0 scale-x-0' : ''}`} />
          <span className={`block w-5 h-0.5 bg-white rounded transition-all duration-300 ${drawerOpen ? '-translate-y-1.5 -rotate-45' : ''}`} />
        </button>
      </div>
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  )
}
