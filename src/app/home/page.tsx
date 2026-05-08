import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from '@/app/auth/actions'
import Link from 'next/link'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/')

  return (
    <main className="min-h-screen bg-stone-950 text-white flex flex-col">
      {/* 헤더 */}
      <header className="flex justify-between items-center px-8 py-6">
        <h1 className="text-2xl font-bold tracking-tight">Uncut</h1>
        <div className="flex items-center gap-4">
          <Link
            href="/taste"
            className="px-4 py-2 rounded-full border border-amber-400 text-amber-400 text-sm hover:bg-amber-400/10 transition"
          >
            ✦ 내 종합 취향
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="text-stone-500 text-sm hover:text-white transition"
            >
              로그아웃
            </button>
          </form>
        </div>
      </header>

      {/* 인삿말 */}
      <section className="px-8 pt-4 pb-8">
        <p className="text-stone-400 text-sm">안녕하세요,</p>
        <h2 className="text-2xl font-bold mt-1">
          오늘 어떤 콘텐츠를 감상하셨나요?
        </h2>
        <p className="text-stone-500 text-sm mt-2">
          남의 리뷰보다 먼저 — 지금 바로 내 감상을 기록하세요.
        </p>
      </section>

      {/* 카테고리 카드 */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5 px-8 pb-16 max-w-3xl">
        {[
          {
            label: '음악',
            slug: 'music',
            icon: '🎵',
            desc: '들은 음악, 앨범, 아티스트',
            color: 'from-purple-900/40 to-stone-900',
          },
          {
            label: '미디어',
            slug: 'media',
            icon: '📖',
            desc: '읽은 책, 웹툰, 만화',
            color: 'from-emerald-900/40 to-stone-900',
          },
          {
            label: '영상',
            slug: 'video',
            icon: '📺',
            desc: '본 영화, 드라마, 다큐',
            color: 'from-blue-900/40 to-stone-900',
          },
        ].map(({ label, slug, icon, desc, color }) => (
          <Link
            key={slug}
            href={`/category/${slug}`}
            className={`flex flex-col gap-4 bg-gradient-to-br ${color} border border-stone-800 rounded-2xl p-6 hover:border-stone-600 transition`}
          >
            <span className="text-5xl">{icon}</span>
            <div>
              <p className="font-bold text-lg">{label}</p>
              <p className="text-stone-400 text-sm mt-0.5">{desc}</p>
            </div>
            <span className="text-stone-500 text-sm mt-auto">기록 보기 →</span>
          </Link>
        ))}
      </section>
    </main>
  )
}
