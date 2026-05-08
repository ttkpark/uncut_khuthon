'use client'

import { useState } from 'react'
import { signup } from '@/app/auth/actions'
import Link from 'next/link'

export default function SignupPage() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await signup(new FormData(e.currentTarget))
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-stone-950 text-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* 로고 */}
        <Link href="/" className="block text-center text-2xl font-bold mb-8 hover:opacity-80">
          Uncut
        </Link>

        <div className="bg-stone-900 rounded-2xl p-8 border border-stone-800">
          <h2 className="text-xl font-semibold mb-1">회원가입</h2>
          <p className="text-stone-400 text-sm mb-6">나만의 문화 기록을 시작하세요</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm text-stone-300">이메일</label>
              <input
                name="email"
                type="email"
                required
                placeholder="example@email.com"
                className="bg-stone-800 border border-stone-700 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-stone-500 transition"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-stone-300">비밀번호</label>
              <input
                name="password"
                type="password"
                required
                placeholder="6자 이상 입력하세요"
                className="bg-stone-800 border border-stone-700 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-stone-500 transition"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm text-stone-300">비밀번호 확인</label>
              <input
                name="confirm"
                type="password"
                required
                placeholder="비밀번호를 다시 입력하세요"
                className="bg-stone-800 border border-stone-700 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-stone-500 transition"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-400/10 rounded-lg px-4 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="bg-white text-stone-950 rounded-lg py-2.5 text-sm font-semibold hover:bg-stone-200 transition disabled:opacity-50 mt-1"
            >
              {loading ? '가입 중...' : '회원가입'}
            </button>
          </form>
        </div>

        {/* 로그인 링크 */}
        <p className="text-center text-stone-400 text-sm mt-5">
          이미 계정이 있으신가요?{' '}
          <Link href="/login" className="text-white underline underline-offset-2 hover:opacity-70">
            로그인
          </Link>
        </p>
      </div>
    </main>
  )
}
