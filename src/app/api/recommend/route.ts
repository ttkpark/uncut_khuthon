import { createClient } from '@/lib/supabase/server'
import { getGeminiModel } from '@/lib/gemini'

export const runtime = 'nodejs'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  // 사용자의 모든 독서록 수집 (works를 먼저 가져와서 join)
  const { data: userWorks } = await supabase
    .from('works')
    .select('id')
    .eq('user_id', user.id)

  const workIds = userWorks?.map(w => w.id) ?? []
  const { data: summaries } = workIds.length
    ? await supabase.from('summaries').select('content').in('work_id', workIds).limit(20)
    : { data: [] }

  const { data: works } = await supabase
    .from('works')
    .select('title, category')
    .eq('user_id', user.id)

  if (!works?.length) return Response.json({ taste: null, recommendations: [] })

  const worksList = works.map(w => `- ${w.title} (${w.category})`).join('\n')
  const summaryTexts = summaries?.map(s => s.content).join('\n\n---\n\n') ?? '아직 독서록 없음'

  const prompt = `다음은 사용자가 감상한 작품 목록과 감상 독서록입니다.

감상 작품:
${worksList}

감상 독서록:
${summaryTexts}

위 내용을 분석해서 JSON으로 응답해주세요 (마크다운 코드블록 없이 순수 JSON만):
{
  "taste_summary": "사용자의 취향을 2-3문장으로 요약",
  "keywords": ["취향 키워드 5개"],
  "recommendations": [
    {
      "title": "추천 작품명",
      "category": "lp 또는 book 또는 tv",
      "reason": "이 사용자의 취향과 연결되는 추천 이유 1문장",
      "is_indie": true
    }
  ]
}

추천 원칙:
- 유명한 작품보다 덜 알려진 독립/소규모 작품 우선
- 지역 공연, 신인 아티스트, 소규모 출판물 포함
- 추천 이유는 반드시 사용자 기록과 연결`

  const model = getGeminiModel('gemini-1.5-flash')
  const result = await model.generateContent(prompt)
  const text = result.response.text().trim()

  try {
    const json = JSON.parse(text)
    return Response.json(json)
  } catch {
    return Response.json({ taste_summary: text, keywords: [], recommendations: [] })
  }
}
