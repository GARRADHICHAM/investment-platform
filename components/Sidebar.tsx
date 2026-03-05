'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, MessageSquare, History, Home, Sun, Moon, TrendingUp } from 'lucide-react'

const NAV = [
  { href: '/',          icon: Home,         label: 'Dashboard' },
  { href: '/analyze',   icon: MessageSquare, label: 'Analyser' },
  { href: '/history',   icon: History,      label: 'Historique' },
]

export default function Sidebar({ dark, setDark }: { dark: boolean; setDark: (v: boolean) => void }) {
  const path = usePathname()

  return (
    <aside style={{
      position: 'fixed', top: 0, left: 0, bottom: 0,
      width: '240px',
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      zIndex: 50,
      transition: 'background 0.3s',
    }}>
      {/* Logo */}
      <div style={{ padding: '28px 24px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <TrendingUp size={18} color="#0a0a0a" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)', lineHeight: 1 }}>
              InvestAI
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
              ADK Multi-Agents
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px' }}>
        <div style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', padding: '0 12px', marginBottom: 8, letterSpacing: '0.1em' }}>
          NAVIGATION
        </div>
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = path === href
          return (
            <Link key={href} href={href} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 8, marginBottom: 2,
                background: active ? 'var(--accent)' : 'transparent',
                color: active ? '#0a0a0a' : 'var(--text-secondary)',
                fontWeight: active ? 600 : 400,
                fontSize: '0.9rem',
                transition: 'all 0.15s',
                cursor: 'pointer',
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--bg-primary)' }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                <Icon size={16} strokeWidth={active ? 2.5 : 2} />
                {label}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Status */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 6px var(--green)' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>API Connected</span>
        </div>
        <button
          onClick={() => setDark(!dark)}
          style={{
            width: '100%', padding: '8px 12px',
            background: 'var(--bg-primary)',
            border: '1px solid var(--border)',
            borderRadius: 8, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8,
            color: 'var(--text-secondary)', fontSize: '0.85rem',
            transition: 'all 0.15s',
          }}
        >
          {dark ? <Sun size={14} /> : <Moon size={14} />}
          {dark ? 'Mode Clair' : 'Mode Sombre'}
        </button>
      </div>
    </aside>
  )
}
