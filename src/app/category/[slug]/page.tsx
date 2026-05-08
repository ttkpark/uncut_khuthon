import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AddWorkModal from '@/components/AddWorkModal'

const CATEGORY_META: Record<string, { label: string; icon: string; desc: string }> = {
  lp:   { label: '음악',   icon: '🎵', desc: 'LP판처럼 깊게' },
  book: { label: '미디어', icon: '📖', desc: '책처럼 음미하며' },
  tv:   { label: '영상',   icon: '📺', desc: '장면 하나하나' },
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const { slug } = params
  if (!CATEGORY_META[slug]) redirect('/home')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: works } = await supabase
    .from('works')
    .select('*')
    .eq('user_id', user.id)
    .eq('category', slug)
    .order('created_at', { ascending: false })

  const meta = CATEGORY_META[slug]

  return (
    <main className="min-h-screen bg-stone-950 text-white flex flex-col">
      <header className="flex items-center gap-4 px-8 py-6">
        <Link href="/home" className="text-stone-400 hover:text-white transition text-sm">← 홈</Link>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{meta.icon}</span>
          <h1 className="text-xl font-bold">{meta.label}</h1>
        </div>
        <span className="text-stone-500 text-sm">{meta.desc}</span>
      </header>

      <section className="px-8 pb-16">
        <p className="text-stone-400 text-sm mb-6">
          {works?.length ? `${works.length}개의 기록` : '아직 기록이 없습니다. 첫 감상을 추가해보세요.'}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* 작품 카드들 */}
          {works?.map((work) => (
            <Link
              key={work.id}
              href={`/category/${slug}/${work.id}`}
              className="flex flex-col gap-3 bg-stone-900 border border-stone-800 rounded-2xl p-5 hover:border-stone-600 hover:bg-stone-800 transition"
            >
              <div className="text-3xl">{meta.icon}</div>
              <div>
                <p className="font-semibold text-sm leading-snug line-clamp-2">{work.title}</p>
                <p className="text-stone-500 text-xs mt-1">
                  {new Date(work.created_at).toLocaleDateString('ko-KR')}
                </p>
              </div>
              <span className="text-stone-500 text-xs mt-auto">감상 기록 →</span>
            </Link>
          ))}

          {/* 추가 버튼 */}
          <AddWorkModal category={slug} />
        </div>
      </section>
    </main>
  )
}
