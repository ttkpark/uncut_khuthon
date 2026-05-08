'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

type Message = { role: 'user' | 'assistant'; content: string }

const CATEGORY_LABELS: Record<string, string> = { lp: '음악', book: '미디어', tv: '영상' }

export default function WorkChatPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const workId = params.workId as string

  const [work, setWork] = useState<{ title: string; category: string } | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [convId, setConvId] = useState<string | null>(null)
  const [showSummary, setShowSummary] = useState(false)
  const [summary, setSummary] = useState('')
  const [summaryLoading, setSummaryLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('works').select('title, category').eq('id', workId).single()
      .then(({ data }) => {
        if (!data) { router.push('/home'); return }
        setWork(data)
        supabase.from('conversations')
          .select('id')
          .eq('work_id', workId)
          .order('started_at', { ascending: false })
          .limit(1)
          .single()
          .then(({ data: conv }) => {
            if (conv) {
              setConvId(conv.id)
              supabase.from('messages')
                .select('role, content')
                .eq('conversation_id', conv.id)
                .order('created_at')
                .then(({ data: msgs }) => {
                  if (msgs?.length) setMessages(msgs as Message[])
                  else {
                    setLoading(true)
                    fetch('/api/chat', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ conversationId: null, workId, workTitle: data.title, category: data.category, history: [] }),
                    }).then(res => streamResponse(res)).finally(() => setLoading(false))
                  }
                })
            } else {
              setLoading(true)
              fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ conversationId: null, workId, workTitle: data.title, category: data.category, history: [] }),
              }).then(res => streamResponse(res)).finally(() => setLoading(false))
            }
          })
      })
  }, [workId, router])

  async function streamResponse(res: Response) {
    if (!res.body) return

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let aiText = ''
    setMessages(prev => [...prev, { role: 'assistant', content: '' }])

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      const chunk = decoder.decode(value)

      if (chunk.includes('__CONV_ID__')) {
        const match = chunk.match(/__CONV_ID__(.+)__/)
        if (match) setConvId(match[1])
        aiText += chunk.replace(/\n__CONV_ID__.+__/, '')
      } else {
        aiText += chunk
      }

      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = { role: 'assistant', content: aiText }
        return updated
      })
    }
  }

  async function sendMessage() {
    if (!input.trim() || loading || !work) return
    const userMsg: Message = { role: 'user', content: input.trim() }
    const newHistory = [...messages, userMsg]
    setMessages(newHistory)
    setInput('')
    setLoading(true)
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId: convId, workId, workTitle: work.title, category: work.category, history: newHistory }),
    })
    await streamResponse(res)
    setLoading(false)
  }

  async function generateSummary() {
    if (!convId || !work) return
    setSummaryLoading(true)
    setShowSummary(true)
    const res = await fetch('/api/summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId: convId, workId, workTitle: work.title, messages }),
    })
    const { content } = await res.json()
    setSummary(content)
    setSummaryLoading(false)
  }

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  if (!work) return <div className="min-h-screen bg-stone-950 text-stone-400 flex items-center justify-center">불러오는 중...</div>

  return (
    <main className="min-h-screen bg-stone-950 text-white flex flex-col">
      {/* 헤더 */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-stone-800">
        <div className="flex items-center gap-3">
          <Link href={`/category/${slug}`} className="text-stone-400 hover:text-white text-sm">←</Link>
          <div>
            <p className="text-xs text-stone-400">{CATEGORY_LABELS[slug]}</p>
            <h1 className="font-bold text-base leading-tight">{work.title}</h1>
          </div>
        </div>
        <button
          onClick={generateSummary}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/40 text-amber-400 text-xs hover:bg-amber-400/20 transition"
        >
          📝 독서록 생성
        </button>
      </header>

      {/* 채팅 + 독서록 패널 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 채팅 영역 */}
        <div className={`flex flex-col flex-1 ${showSummary ? 'hidden md:flex' : ''}`}>
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-white text-stone-950 rounded-br-sm'
                    : 'bg-stone-800 text-stone-100 rounded-bl-sm'
                }`}>
                  {m.content || <span className="animate-pulse text-stone-400">▋</span>}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* 입력창 */}
          <div className="px-6 pb-6 pt-2 border-t border-stone-800">
            <div className="flex gap-3 items-end">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                placeholder="내 감상을 입력하세요... (Shift+Enter 줄바꿈)"
                rows={2}
                className="flex-1 bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-stone-500 transition resize-none text-white"
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="px-4 py-3 bg-white text-stone-950 rounded-xl text-sm font-semibold hover:bg-stone-200 transition disabled:opacity-40"
              >
                전송
              </button>
            </div>
          </div>
        </div>

        {/* 독서록 패널 */}
        {showSummary && (
          <div className="w-full md:w-96 border-l border-stone-800 flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800">
              <h2 className="font-semibold text-sm">📝 독서록</h2>
              <div className="flex gap-2">
                <button onClick={() => setShowSummary(false)} className="text-stone-400 hover:text-white text-xs md:hidden">채팅으로</button>
                <button onClick={() => setShowSummary(false)} className="text-stone-400 hover:text-white text-xs hidden md:block">닫기 ✕</button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5">
              {summaryLoading ? (
                <div className="text-stone-400 text-sm animate-pulse">독서록 생성 중...</div>
              ) : (
                <div className="text-stone-200 text-sm leading-relaxed whitespace-pre-wrap">{summary}</div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
