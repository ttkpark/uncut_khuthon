'use client'

import { useState } from 'react'
import { signup, loginWithGoogle } from '@/app/auth/actions'
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

          {/* Google 로그인 */}
          <form action={loginWithGoogle}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 bg-white text-stone-900 rounded-lg py-2.5 text-sm font-medium hover:bg-stone-100 transition mb-5"
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
                <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
              </svg>
              Google로 시작하기
            </button>
          </form>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-stone-700" />
            <span className="text-stone-500 text-xs">또는 이메일로 가입</span>
            <div className="flex-1 h-px bg-stone-700" />
          </div>

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
