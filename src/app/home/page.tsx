import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from '@/app/auth/actions'
import Link from 'next/link'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const nickname = user.email?.split('@')[0] ?? '사용자'

  return (
    <main className="relative w-full h-screen overflow-hidden bg-amber-50">
      {/* 배경 일러스트 */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/home-bg.jpg')" }}
      />
      {/* 배경 오버레이 (카드 가독성) */}
      <div className="absolute inset-0 bg-amber-950/10" />

      {/* 상단 네비게이션 */}
      <nav className="relative z-10 flex items-center justify-between px-10 py-5 bg-amber-50/80 backdrop-blur-sm border-b border-amber-200/50">
        <h1 className="text-xl font-bold text-stone-800 tracking-tight">취향 책장</h1>
        <div className="flex items-center gap-8">
          <Link href="/home" className="text-sm text-stone-700 hover:text-stone-900 font-medium transition">홈</Link>
          <Link href="/category/lp" className="text-sm text-stone-600 hover:text-stone-900 transition">음악</Link>
          <Link href="/category/book" className="text-sm text-stone-600 hover:text-stone-900 transition">미디어</Link>
          <Link href="/category/tv" className="text-sm text-stone-600 hover:text-stone-900 transition">영상</Link>
          <Link href="/taste" className="text-sm text-stone-600 hover:text-stone-900 transition">내 취향</Link>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-amber-700 font-medium">{nickname}님</span>
          <form action={logout}>
            <button
              type="submit"
              className="text-sm px-4 py-1.5 rounded-full border border-stone-400 text-stone-600 hover:bg-stone-100 transition"
            >
              로그아웃
            </button>
          </form>
        </div>
      </nav>

      {/* 플로팅 카드들 */}
      <div className="absolute inset-0 z-10">

        {/* 영상 카드 — TV 위 */}
        <Link
          href="/category/tv"
          className="absolute top-[35%] left-[31%] w-52 bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all border border-amber-100"
        >
          <p className="font-bold text-stone-800 text-lg mb-2">영상</p>
          <p className="text-stone-500 text-sm leading-relaxed">작은 TV 앞에서<br />떠오른 마음을 기록해요.</p>
        </Link>

        {/* 미디어 카드 — 책상/노트북 위 */}
        <Link
          href="/category/book"
          className="absolute top-[58%] left-[28%] w-52 bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all border border-amber-100"
        >
          <p className="font-bold text-stone-800 text-lg mb-2">미디어</p>
          <p className="text-stone-500 text-sm leading-relaxed">책장 한 칸에 생각의<br />조각을 꽂아둬요.</p>
        </Link>

        {/* 내 취향 카드 — 중앙 */}
        <Link
          href="/taste"
          className="absolute top-[22%] left-[50%] w-52 bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all border border-amber-100"
        >
          <p className="font-bold text-stone-800 text-lg mb-2">내 취향</p>
          <p className="text-stone-500 text-sm leading-relaxed">쌓인 감상으로<br />취향을 발견해요.</p>
        </Link>

        {/* 오늘의 추천 카드 — 우측 상단 */}
        <Link
          href="/taste"
          className="absolute top-[18%] left-[65%] w-60 bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all border border-amber-100"
        >
          <p className="text-amber-500 text-xs font-semibold mb-2">★ 오늘의 추천</p>
          <p className="text-stone-600 text-sm leading-relaxed">
            잔잔한 여운이 남는 이야기,<br />
            오늘은 &lsquo;리틀 포레스트&rsquo;를<br />
            만나볼까요?
          </p>
        </Link>

        {/* 음악 카드 — LP 선반 위 */}
        <Link
          href="/category/lp"
          className="absolute top-[60%] left-[72%] w-52 bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all border border-amber-100"
        >
          <p className="font-bold text-stone-800 text-lg mb-2">음악</p>
          <p className="text-stone-500 text-sm leading-relaxed">LP판처럼 오래 맴도는<br />감상을 남겨요.</p>
        </Link>

      </div>
    </main>
  )
}
