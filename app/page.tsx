'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { TrendingUp, TrendingDown, Activity, MessageSquare, History, Zap, ArrowRight, BarChart2 } from 'lucide-react'
import { getSymbols, getHistory, healthCheck, HistoryEntry } from '../lib/api'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

// Mock sparkline data per symbol
function mockSparkline(base: number) {
  return Array.from({ length: 12 }, (_, i) => ({
    i,
    v: base + (Math.random() - 0.48) * base * 0.08
  }))
}

const SYMBOL_DATA: Record<string, { price: number; change: number; color: string }> = {
  NVDA: { price: 875.30, change: 3.2,  color: '#22c55e' },
  AAPL: { price: 189.50, change: -0.8, color: '#ef4444' },
  BTC:  { price: 67500,  change: 2.1,  color: '#22c55e' },
  MSFT: { price: 415.80, change: 1.4,  color: '#22c55e' },
  ETH:  { price: 3800,   change: -1.2, color: '#ef4444' },
  TSLA: { price: 248.70, change: -2.4, color: '#ef4444' },
}

export default function Dashboard() {
  const [symbols, setSymbols]   = useState<string[]>([])
  const [history, setHistory]   = useState<HistoryEntry[]>([])
  const [online, setOnline]     = useState(false)
  const [time, setTime]         = useState(new Date())

  useEffect(() => {
    getSymbols().then(setSymbols)
    setHistory(getHistory())
    healthCheck().then(setOnline)
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{ padding: '40px 48px', maxWidth: 1200, fontFamily: 'var(--font-body)' }}>

      {/* Header */}
      <div style={{ marginBottom: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 8, letterSpacing: '0.15em' }}>
            {time.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
            Tableau de bord
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 6, fontSize: '0.9rem' }}>
            Plateforme d'investissement propulsée par Google ADK Multi-Agents
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 100 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: online ? 'var(--green)' : 'var(--red)', boxShadow: online ? '0 0 8px var(--green)' : 'none' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {online ? 'API Active' : 'API Hors ligne'}
          </span>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Analyses', value: history.length, icon: BarChart2, color: 'var(--accent)' },
          { label: 'Symboles', value: symbols.length || 19, icon: Activity, color: 'var(--blue)' },
          { label: 'Agents IA', value: 5, icon: Zap, color: 'var(--green)' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={20} color={color} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 3 }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Market Overview */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '24px', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Aperçu Marché
          </h2>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>Données simulées</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {Object.entries(SYMBOL_DATA).map(([sym, data]) => {
            const sparkData = mockSparkline(data.price)
            const up = data.change >= 0
            return (
              <div key={sym} style={{ background: 'var(--bg-primary)', borderRadius: 10, padding: '14px 16px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{sym}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                      ${data.price.toLocaleString()}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3, color: data.color, fontSize: '0.8rem', fontWeight: 600 }}>
                    {up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                    {up ? '+' : ''}{data.change}%
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={40}>
                  <AreaChart data={sparkData}>
                    <defs>
                      <linearGradient id={`g-${sym}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={data.color} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={data.color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="v" stroke={data.color} strokeWidth={1.5} fill={`url(#g-${sym})`} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )
          })}
        </div>
      </div>

      {/* CTA + Recent */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* CTA */}
        <Link href="/analyze" style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'var(--accent)',
            borderRadius: 16, padding: '28px',
            cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
          >
            <MessageSquare size={28} color="#0a0a0a" strokeWidth={2} />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 800, color: '#0a0a0a', margin: '12px 0 6px' }}>
              Lancer une analyse
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'rgba(0,0,0,0.6)', marginBottom: 16 }}>
              Demandez à l'IA d'analyser n'importe quel actif financier
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#0a0a0a', fontWeight: 600, fontSize: '0.85rem' }}>
              Commencer <ArrowRight size={14} />
            </div>
          </div>
        </Link>

        {/* Recent history */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>
              Analyses récentes
            </h3>
            <Link href="/history" style={{ fontSize: '0.75rem', color: 'var(--accent)', textDecoration: 'none', fontFamily: 'var(--font-mono)' }}>
              Voir tout →
            </Link>
          </div>
          {history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <History size={28} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.4 }} />
              Aucune analyse pour l'instant
            </div>
          ) : (
            history.slice(0, 4).map(entry => (
              <Link key={entry.id} href={`/history?id=${entry.id}`} style={{ textDecoration: 'none' }}>
                <div style={{ padding: '10px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 500, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {entry.query}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {new Date(entry.timestamp).toLocaleString('fr-FR')}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}