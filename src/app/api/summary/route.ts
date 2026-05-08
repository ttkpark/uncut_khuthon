import { createClient } from '@/lib/supabase/server'
import { getGeminiModel } from '@/lib/gemini'
import { NextRequest } from 'next/server'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { conversationId, workId, workTitle, messages } = await req.json()

  const dialogue = messages
    .map((m: { role: string; content: string }) =>
      `${m.role === 'user' ? '나' : 'AI'}: ${m.content}`
    )
    .join('\n\n')

  const prompt = `다음은 "${workTitle}"에 대한 나의 감상 대화입니다.
이 대화를 바탕으로 독서록 형식의 감상 정리를 작성해주세요.

조건:
- 나의 고유한 언어와 감정을 살려서 작성
- AI 문체나 클리셰 표현 최소화
- 마크다운 형식 사용 (## 제목, - 항목 등)
- 구성: 한 줄 감상, 인상 깊은 부분, 핵심 키워드, 전체 감상 요약

대화 내용:
${dialogue}`

  const model = getGeminiModel('gemini-1.5-flash')
  const result = await model.generateContent(prompt)
  const content = result.response.text()

  // 기존 요약 있으면 삭제 후 재생성
  await supabase.from('summaries').delete().eq('conversation_id', conversationId)
  await supabase.from('summaries').insert({ conversation_id: conversationId, work_id: workId, content })

  return Response.json({ content })
}
