'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Loader, ChevronDown, ChevronUp, Bot, User, Sparkles, AlertCircle } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { analyzePortfolio, saveToHistory, getSymbols, AnalyzeResponse } from '../../lib/api'

const SUGGESTIONS = [
  "Analyse NVDA et BTC pour moi",
  "Quel est le risque de mon portefeuille AAPL 40%, MSFT 30%, BTC 30% ?",
  "Donne-moi une stratégie d'investissement aggressive sur la tech",
  "Analyse le marché crypto ETH et SOL",
  "Stratégie MODERATE sur $50,000 avec GOOGL et AMZN",
]

interface Message {
  role: 'user' | 'assistant'
  content: string
  response?: AnalyzeResponse
  loading?: boolean
  error?: string
  ts: string
}

function AgentReport({ label, content, color }: { label: string; content: string; color: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ border: `1px solid ${color}30`, borderRadius: 8, overflow: 'hidden', marginBottom: 6 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', padding: '8px 12px',
          background: `${color}10`,
          border: 'none', cursor: 'pointer',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          color: color, fontWeight: 600, fontSize: '0.8rem',
          fontFamily: 'var(--font-mono)',
        }}
      >
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

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user'
  return (
    <div style={{
      display: 'flex', gap: 10, marginBottom: 20,
      flexDirection: isUser ? 'row-reverse' : 'row',
      animation: 'fadeIn 0.3s ease',
    }}>
      {/* Avatar */}
      <div style={{
        width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
        background: isUser ? 'var(--accent)' : 'var(--bg-card)',
        border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {isUser ? <User size={15} color="#0a0a0a" /> : <Bot size={15} color="var(--accent)" />}
      </div>

      <div style={{ maxWidth: '80%', flex: 1 }}>
        {/* Bubble */}
        <div style={{
          padding: '12px 16px',
          background: isUser ? 'var(--accent)' : 'var(--bg-card)',
          color: isUser ? '#0a0a0a' : 'var(--text-primary)',
          borderRadius: isUser ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
          border: isUser ? 'none' : '1px solid var(--border)',
          fontSize: '0.88rem', lineHeight: 1.6,
        }}>
          {msg.loading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)' }}>
              <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                Pipeline en cours... (30-60s)
              </span>
            </div>
          ) : msg.error ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--red)' }}>
              <AlertCircle size={14} />
              {msg.error}
            </div>
          ) : (
            <div className={!isUser ? 'report-content' : ''}>
              {isUser ? msg.content : <ReactMarkdown>{msg.content}</ReactMarkdown>}
            </div>
          )}
        </div>

        {/* Agent reports accordion */}
        {msg.response && !msg.loading && (
          <div style={{ marginTop: 10 }}>
            {msg.response.outputs.market_analysis && (
              <AgentReport label="📈 Market Analysis" content={msg.response.outputs.market_analysis} color="#3b82f6" />
            )}
            {msg.response.outputs.news_impact && (
              <AgentReport label="📰 News & Macro" content={msg.response.outputs.news_impact} color="#8b5cf6" />
            )}
            {msg.response.outputs.risk_assessment && (
              <AgentReport label="⚠️ Risk Assessment" content={msg.response.outputs.risk_assessment} color="#f59e0b" />
            )}
            {msg.response.outputs.investment_strategy && (
              <AgentReport label="🎯 Strategy" content={msg.response.outputs.investment_strategy} color="#10b981" />
            )}
            {msg.response.outputs.portfolio_decision && (
              <AgentReport label="✅ Final Decision" content={msg.response.outputs.portfolio_decision} color="#d4a853" />
            )}
          </div>
        )}

        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 4, textAlign: isUser ? 'right' : 'left' }}>
          {msg.ts}
        </div>
      </div>
    </div>
  )
}

export default function AnalyzePage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [symbols, setSymbols]   = useState<string[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { getSymbols().then(setSymbols) }, [])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function send(query?: string) {
    const q = (query || input).trim()
    if (!q || loading) return
    setInput('')
    setLoading(true)

    const ts = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

    const userMsg: Message = { role: 'user', content: q, ts }
    const loadingMsg: Message = { role: 'assistant', content: '', loading: true, ts }

    setMessages(prev => [...prev, userMsg, loadingMsg])

    try {
      const res = await analyzePortfolio({ query: q, user_id: 'web_user' })
      const finalText = res.final_response || res.outputs.portfolio_decision || 'Analyse complète.'

      setMessages(prev => prev.map((m, i) =>
        i === prev.length - 1
          ? { ...m, loading: false, content: finalText, response: res }
          : m
      ))
      saveToHistory(q, res)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur de connexion à l\'API'
      setMessages(prev => prev.map((m, i) =>
        i === prev.length - 1
          ? { ...m, loading: false, error: msg }
          : m
      ))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'var(--font-body)' }}>

      {/* Header */}
      <div style={{ padding: '24px 40px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Sparkles size={18} color="var(--accent)" />
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Analyste IA
            </h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              5 agents · {symbols.length} symboles · gemini-2.5-flash-lite
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 40px' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', paddingTop: 60 }}>
            <Bot size={48} color="var(--accent)" style={{ margin: '0 auto 16px', display: 'block', opacity: 0.7 }} />
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
              Que voulez-vous analyser ?
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 32 }}>
              Le pipeline complet (Market → News → Risk → Strategy → Decision) sera exécuté automatiquement.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', maxWidth: 700, margin: '0 auto' }}>
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => send(s)} style={{
                  padding: '8px 14px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 100,
                  color: 'var(--text-secondary)',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  fontFamily: 'var(--font-body)',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; (e.currentTarget as HTMLElement).style.color = 'var(--accent)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)' }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '16px 40px 24px', borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', maxWidth: 900, margin: '0 auto' }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
            placeholder="Ex: Analyse NVDA, AAPL et BTC avec une stratégie aggressive..."
            disabled={loading}
            rows={2}
            style={{
              flex: 1, padding: '12px 16px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              resize: 'none',
              fontFamily: 'var(--font-body)',
              outline: 'none',
              lineHeight: 1.5,
            }}
          />
          <button
            onClick={() => send()}
            disabled={loading || !input.trim()}
            style={{
              width: 44, height: 44,
              background: loading || !input.trim() ? 'var(--border)' : 'var(--accent)',
              border: 'none', borderRadius: 10,
              cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s', flexShrink: 0,
            }}
          >
            {loading
              ? <Loader size={16} color="#0a0a0a" style={{ animation: 'spin 1s linear infinite' }} />
              : <Send size={16} color="#0a0a0a" />
            }
          </button>
        </div>
        <div style={{ textAlign: 'center', marginTop: 8, fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          Entrée pour envoyer · Maj+Entrée pour nouvelle ligne · L'analyse peut prendre 30-60 secondes
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}