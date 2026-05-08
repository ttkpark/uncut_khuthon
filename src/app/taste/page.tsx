'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Recommendation = { title: string; category: string; reason: string; is_indie: boolean }
type TasteData = {
  taste_summary: string
  keywords: string[]
  recommendations: Recommendation[]
}

const CATEGORY_ICONS: Record<string, string> = { lp: '🎵', book: '📖', tv: '📺' }
const CATEGORY_LABELS: Record<string, string> = { lp: '음악', book: '미디어', tv: '영상' }

export default function TastePage() {
  const [data, setData] = useState<TasteData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/recommend', { method: 'POST' })
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <main className="min-h-screen bg-stone-950 text-white flex flex-col">
      <header className="flex items-center gap-4 px-8 py-6">
        <Link href="/home" className="text-stone-400 hover:text-white text-sm">← 홈</Link>
        <h1 className="text-xl font-bold">✦ 내 종합 취향</h1>
      </header>

      <div className="px-8 pb-16 max-w-2xl space-y-8">
        {loading && (
          <div className="text-stone-400 text-sm animate-pulse">
            내 감상 기록을 분석하는 중...
          </div>
        )}

        {!loading && !data?.taste_summary && (
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-8 text-center">
            <p className="text-stone-400 text-sm">아직 감상 기록이 없습니다.</p>
            <p className="text-stone-500 text-xs mt-2">작품을 추가하고 AI와 대화한 후 독서록을 생성해보세요.</p>
            <Link href="/home" className="inline-block mt-4 px-5 py-2 bg-white text-stone-950 rounded-full text-sm font-semibold hover:bg-stone-200 transition">
              기록 시작하기
            </Link>
          </div>
        )}

        {data?.taste_summary && (
          <>
            {/* 취향 요약 */}
            <section className="bg-stone-900 border border-amber-400/20 rounded-2xl p-6">
              <p className="text-amber-400 text-xs mb-3 uppercase tracking-widest">내 취향 분석</p>
              <p className="text-stone-100 leading-relaxed">{data.taste_summary}</p>
              {data.keywords?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {data.keywords.map(k => (
                    <span key={k} className="px-3 py-1 bg-amber-400/10 border border-amber-400/30 rounded-full text-amber-300 text-xs">
                      #{k}
                    </span>
                  ))}
                </div>
              )}
            </section>

            {/* 추천 */}
            {data.recommendations?.length > 0 && (
              <section>
                <p className="text-stone-400 text-xs uppercase tracking-widest mb-4">
                  공정 추천 — 볼 기회를 얻지 못한 콘텐츠
                </p>
                <div className="space-y-3">
                  {data.recommendations.map((rec, i) => (
                    <div key={i} className="bg-stone-900 border border-stone-800 rounded-2xl p-5 hover:border-stone-600 transition">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{CATEGORY_ICONS[rec.category] ?? '🎯'}</span>
                          <div>
                            <p className="font-semibold text-sm">{rec.title}</p>
                            <p className="text-stone-500 text-xs">{CATEGORY_LABELS[rec.category]}</p>
                          </div>
                        </div>
                        {rec.is_indie && (
                          <span className="shrink-0 px-2 py-0.5 bg-emerald-400/10 border border-emerald-400/30 rounded-full text-emerald-400 text-xs">
                            인디
                          </span>
                        )}
                      </div>
                      <p className="text-stone-400 text-xs mt-3 leading-relaxed italic">
                        &ldquo;{rec.reason}&rdquo;
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <button
              onClick={() => { setLoading(true); fetch('/api/recommend', { method: 'POST' }).then(r => r.json()).then(d => { setData(d); setLoading(false) }) }}
              className="text-stone-500 text-xs hover:text-stone-300 transition"
            >
              ↻ 다시 분석
            </button>
          </>
        )}
      </div>
    </main>
  )
}
