'use client'

import './globals.css'
import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(true)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  return (
    <html lang="fr" className="dark">
      <head>
        <title>InvestAI — Plateforme d'Investissement ADK</title>
        <meta name="description" content="Plateforme d'investissement automatisée propulsée par Google ADK Multi-Agents" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <Sidebar dark={dark} setDark={setDark} />
          <main style={{
            flex: 1,
            marginLeft: '240px',
            minHeight: '100vh',
            background: 'var(--bg-primary)',
            transition: 'background 0.3s',
          }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
