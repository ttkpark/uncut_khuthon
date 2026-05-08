import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/home')
  }

  return (
    <main className="min-h-screen bg-stone-950 text-white flex flex-col">
      {/* 헤더 */}
      <header className="flex justify-between items-center px-8 py-6">
        <h1 className="text-2xl font-bold tracking-tight">Uncut</h1>
        <div className="flex gap-3">
          <Link
            href="/login"
            className="px-5 py-2 rounded-full border border-white/30 text-sm hover:bg-white/10 transition"
          >
            로그인
          </Link>
          <Link
            href="/signup"
            className="px-5 py-2 rounded-full bg-white text-stone-950 text-sm font-medium hover:bg-stone-200 transition"
          >
            회원가입
          </Link>
        </div>
      </header>

      {/* 히어로 */}
      <section className="flex flex-col items-center justify-center flex-1 text-center px-6 gap-4 pb-10">
        <p className="text-stone-400 text-sm tracking-widest uppercase">남의 리뷰보다 먼저</p>
        <h2 className="text-4xl md:text-5xl font-bold leading-tight">
          내 감상을 먼저<br />정리합니다
        </h2>
        <p className="text-stone-400 max-w-md text-base mt-2">
          콘텐츠를 본 직후, 알고리즘과 타인의 평가 전에<br />
          AI와 대화하며 나만의 문화 기록을 만드세요.
        </p>
      </section>

      {/* 카테고리 카드 — 클릭 시 로그인으로 */}
      <section className="grid grid-cols-3 gap-4 px-8 pb-16 max-w-2xl mx-auto w-full">
        {[
          { label: '음악', icon: '🎵', desc: 'LP판처럼 깊게' },
          { label: '미디어', icon: '📖', desc: '책처럼 음미하며' },
          { label: '영상', icon: '📺', desc: '장면 하나하나' },
        ].map(({ label, icon, desc }) => (
          <Link
            key={label}
            href="/login"
            className="flex flex-col items-center justify-center gap-3 bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded-2xl py-8 transition cursor-pointer"
          >
            <span className="text-5xl">{icon}</span>
            <span className="font-semibold text-lg">{label}</span>
            <span className="text-stone-400 text-xs">{desc}</span>
          </Link>
        ))}
      </section>
    </main>
  )
}
