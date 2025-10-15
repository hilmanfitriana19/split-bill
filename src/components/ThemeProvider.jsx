import React, { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext({
  theme: 'light',
  setTheme: () => {},
  motionMode: 'calm',
  setMotionMode: () => {}
})

export function useTheme() {
  return useContext(ThemeContext)
}

export default function ThemeProvider({ children }) {
  // Theme: stick to 'light' design but persist choice for future extensibility
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('uiTheme') || 'light'
    } catch (e) {
      return 'light'
    }
  })

  // Motion mode: 'dynamic' | 'calm' | 'reduced'
  const [motionMode, setMotionMode] = useState(() => {
    try {
      const stored = localStorage.getItem('motionMode')
      if (stored) return stored
      if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'reduced'
      return 'calm'
    } catch (e) {
      return 'calm'
    }
  })

  useEffect(() => {
    try { localStorage.setItem('uiTheme', theme) } catch (e) {}
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.setAttribute('data-theme', theme)
    }
  }, [theme])

  useEffect(() => {
    try { localStorage.setItem('motionMode', motionMode) } catch (e) {}
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.setAttribute('data-motion', motionMode)
      if (motionMode === 'reduced') {
        document.documentElement.style.setProperty('--motion-fast', '50ms')
        document.documentElement.style.setProperty('--motion-medium', '80ms')
        document.documentElement.style.setProperty('--motion-slow', '120ms')
      } else if (motionMode === 'calm') {
        document.documentElement.style.setProperty('--motion-fast', '150ms')
        document.documentElement.style.setProperty('--motion-medium', '250ms')
        document.documentElement.style.setProperty('--motion-slow', '400ms')
      } else {
        document.documentElement.style.setProperty('--motion-fast', '100ms')
        document.documentElement.style.setProperty('--motion-medium', '200ms')
        document.documentElement.style.setProperty('--motion-slow', '320ms')
      }
    }
  }, [motionMode])

  // Sync with OS reduced-motion preference
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handler = (e) => { if (e.matches) setMotionMode('reduced') }
    // initialize
    if (mq.matches) setMotionMode('reduced')
    mq.addEventListener ? mq.addEventListener('change', handler) : mq.addListener(handler)
    return () => mq.removeEventListener ? mq.removeEventListener('change', handler) : mq.removeListener(handler)
  }, [])

  const value = { theme, setTheme, motionMode, setMotionMode }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}
