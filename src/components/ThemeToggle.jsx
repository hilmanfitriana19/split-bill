import React from 'react'
import { useTheme } from './ThemeProvider'

export default function ThemeToggle() {
  const { theme, setTheme, motionMode, setMotionMode } = useTheme()

  // Theme toggle kept minimal: the app is light-first. This keeps hook available for future dark mode.
  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'light' : 'light'))

  const cycleMotion = () => {
    if (motionMode === 'calm') setMotionMode('dynamic')
    else if (motionMode === 'dynamic') setMotionMode('reduced')
    else setMotionMode('calm')
  }

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <button
        className="btn ghost-soft auth-button"
        onClick={cycleMotion}
        title={`Motion: ${motionMode}`}
        aria-label="Toggle motion"
      >
        {motionMode === 'reduced' ? '⚪️' : motionMode === 'calm' ? '🌿' : '✨'}
      </button>

      <button
        className="btn ghost auth-button"
        onClick={toggleTheme}
        title="Theme"
        aria-label="Toggle theme"
      >
        ☀️
      </button>
    </div>
  )
}
