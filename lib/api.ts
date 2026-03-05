const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://investment-agent-449502745670.europe-west1.run.app'

export interface AnalyzeRequest {
  query: string
  user_id?: string
  session_id?: string
}

export interface AgentOutputs {
  market_analysis?:     string
  news_impact?:         string
  risk_assessment?:     string
  investment_strategy?: string
  portfolio_decision?:  string
  audit_trail?:         string[]
}

export interface AnalyzeResponse {
  session_id:     string
  final_response: string
  outputs:        AgentOutputs
  status:         string
}

export interface HistoryEntry {
  id:        string
  query:     string
  response:  AnalyzeResponse
  timestamp: string
}

export async function analyzePortfolio(req: AnalyzeRequest): Promise<AnalyzeResponse> {
  const res = await fetch(`${API_URL}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Erreur inconnue' }))
    throw new Error(err.detail || `HTTP ${res.status}`)
  }
  return res.json()
}

export async function getSymbols(): Promise<string[]> {
  const res = await fetch(`${API_URL}/symbols`)
  if (!res.ok) return []
  const data = await res.json()
  return data.symbols || []
}

export async function healthCheck(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/health`)
    return res.ok
  } catch {
    return false
  }
}

// Local history management
export function saveToHistory(query: string, response: AnalyzeResponse): void {
  if (typeof window === 'undefined') return
  const history: HistoryEntry[] = getHistory()
  const entry: HistoryEntry = {
    id: response.session_id,
    query,
    response,
    timestamp: new Date().toISOString(),
  }
  history.unshift(entry)
  // Keep only last 20
  const trimmed = history.slice(0, 20)
  sessionStorage.setItem('invest_history', JSON.stringify(trimmed))
}

export function getHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(sessionStorage.getItem('invest_history') || '[]')
  } catch {
    return []
  }
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem('invest_history')
}
