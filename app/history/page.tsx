'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Trash2, ChevronDown, ChevronUp, Search, Clock, Bot } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { getHistory, clearHistory, HistoryEntry } from '../../lib/api'

function AgentReport({ label, content, color }: { label: string; content: string; color: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ border: `1px solid ${color}30`, borderRadius: 8, overflow: 'hidden', marginBottom: 6 }}>
      <button onClick={() => setOpen(!open)} style={{
        width: '100%', padding: '8px 12px',
        background: `${color}10`, border: 'none', cursor: 'pointer',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        color, fontWeight: 600, fontSize: '0.8rem', fontFamily: 'var(--font-mono)',
      }}>
        {label}
        {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>
      {open && (
        <div style={{ padding: '12px', background: 'var(--bg-primary)' }} className="report-content">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      )}
    </div>
  )
}

export default function HistoryPage() {
  const [history, setHistory]       = useState<HistoryEntry[]>([])
  const [search, setSearch]         = useState('')
  const [selected, setSelected]     = useState<string | null>(null)
  const params = useSearchParams()

  useEffect(() => {
    const h = getHistory()
    setHistory(h)
    const id = params.get('id')
    if (id) setSelected(id)
    else if (h.length > 0) setSelected(h[0].id)
  }, [params])

  const filtered = history.filter(e => e.query.toLowerCase().includes(search.toLowerCase()))
  const selectedEntry = history.find(e => e.id === selected)

  function handleClear() {
    if (confirm('Effacer tout l\'historique ?')) {
      clearHistory()
      setHistory([])
      setSelected(null)
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'var(--font-body)' }}>

      {/* Sidebar list */}
      <div style={{
        width: 320, flexShrink: 0,
        borderRight: '1px solid var(--border)',
        background: 'var(--bg-secondary)',
        display: 'flex', flexDirection: 'column',
        height: '100vh', overflowY: 'auto',
      }}>
        <div style={{ padding: '24px 20px 12px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Historique
            </h1>
            {history.length > 0 && (
              <button onClick={handleClear} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)', padding: 4 }}>
                <Trash2 size={15} />
              </button>
            )}
          </div>
          <div style={{ position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher..."
              style={{
                width: '100%', padding: '8px 10px 8px 30px',
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 8, color: 'var(--text-primary)', fontSize: '0.82rem',
                fontFamily: 'var(--font-body)', outline: 'none',
              }}
            />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <Clock size={24} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.4 }} />
              {history.length === 0 ? 'Aucune analyse' : 'Aucun résultat'}
            </div>
          ) : (
            filtered.map(entry => (
              <div
                key={entry.id}
                onClick={() => setSelected(entry.id)}
                style={{
                  padding: '12px 20px', cursor: 'pointer',
                  borderLeft: `3px solid ${selected === entry.id ? 'var(--accent)' : 'transparent'}`,
                  background: selected === entry.id ? 'var(--bg-card)' : 'transparent',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 500, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {entry.query}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  {new Date(entry.timestamp).toLocaleString('fr-FR')}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Detail panel */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '32px 40px' }}>
        {!selectedEntry ? (
          <div style={{ textAlign: 'center', paddingTop: 80, color: 'var(--text-muted)' }}>
            <Bot size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
            <p>Sélectionnez une analyse</p>
          </div>
        ) : (
          <div style={{ maxWidth: 800 }}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                {new Date(selectedEntry.timestamp).toLocaleString('fr-FR')} · {selectedEntry.id.slice(0, 8)}
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
                {selectedEntry.query}
              </h2>

              {/* Final response */}
              {selectedEntry.response.final_response && (
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, marginBottom: 16 }} className="report-content">
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--accent)', marginBottom: 10, fontWeight: 600 }}>
                    RÉPONSE FINALE
                  </div>
                  <ReactMarkdown>{selectedEntry.response.final_response}</ReactMarkdown>
                </div>
              )}

              {/* Agent reports */}
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 10, fontWeight: 600 }}>
                RAPPORTS DES AGENTS
              </div>
              {selectedEntry.response.outputs.market_analysis && (
                <AgentReport label="📈 Market Analysis" content={selectedEntry.response.outputs.market_analysis} color="#3b82f6" />
              )}
              {selectedEntry.response.outputs.news_impact && (
                <AgentReport label="📰 News & Macro" content={selectedEntry.response.outputs.news_impact} color="#8b5cf6" />
              )}
              {selectedEntry.response.outputs.risk_assessment && (
                <AgentReport label="⚠️ Risk Assessment" content={selectedEntry.response.outputs.risk_assessment} color="#f59e0b" />
              )}
              {selectedEntry.response.outputs.investment_strategy && (
                <AgentReport label="🎯 Strategy" content={selectedEntry.response.outputs.investment_strategy} color="#10b981" />
              )}
              {selectedEntry.response.outputs.portfolio_decision && (
                <AgentReport label="✅ Final Decision" content={selectedEntry.response.outputs.portfolio_decision} color="#d4a853" />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}