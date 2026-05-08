'use client'

import { useState, useRef } from 'react'
import { addWork } from '@/app/works/actions'

const CATEGORY_LABELS: Record<string, string> = { lp: '음악', book: '미디어', tv: '영상' }

export default function AddWorkModal({ category }: { category: string }) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await addWork(new FormData(e.currentTarget))
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      formRef.current?.reset()
      setOpen(false)
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full h-full min-h-[160px] flex flex-col items-center justify-center gap-2 border-2 border-dashed border-stone-700 rounded-2xl hover:border-stone-500 hover:bg-stone-800/30 transition text-stone-500 hover:text-stone-300"
      >
        <span className="text-4xl">+</span>
        <span className="text-sm">{CATEGORY_LABELS[category]} 추가</span>
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-stone-900 border border-stone-700 rounded-2xl p-8 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-1">새 작품 추가</h3>
            <p className="text-stone-400 text-sm mb-6">
              감상한 {CATEGORY_LABELS[category]}의 제목을 입력하세요
            </p>

            <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input type="hidden" name="category" value={category} />
              <input
                name="title"
                type="text"
                required
                autoFocus
                placeholder="제목 입력..."
                className="bg-stone-800 border border-stone-700 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-stone-500 transition text-white"
              />
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <div className="flex gap-3 mt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 py-2.5 rounded-lg border border-stone-700 text-sm text-stone-400 hover:text-white transition"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-lg bg-white text-stone-950 text-sm font-semibold hover:bg-stone-200 transition disabled:opacity-50"
                >
                  {loading ? '추가 중...' : '추가'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
