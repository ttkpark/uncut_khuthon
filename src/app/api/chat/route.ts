import { createClient } from '@/lib/supabase/server'
import { getGeminiModel, CATEGORY_PROMPTS, getFirstQuestion } from '@/lib/gemini'
import { NextRequest } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { conversationId, workId, workTitle, category, history } = await req.json()

  // 대화 없으면 생성
  let convId = conversationId
  if (!convId) {
    const { data: conv } = await supabase
      .from('conversations')
      .insert({ work_id: workId, user_id: user.id })
      .select('id')
      .single()
    convId = conv?.id
  }

  const model = getGeminiModel()
  const systemPrompt = CATEGORY_PROMPTS[category] ?? CATEGORY_PROMPTS['tv']

  // Gemini history 형식 변환
  const geminiHistory = (history ?? []).map((m: { role: string; content: string }) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))

  const chat = model.startChat({
    history: [
      { role: 'user', parts: [{ text: `작품 정보: "${workTitle}" (카테고리: ${category})` }] },
      { role: 'model', parts: [{ text: systemPrompt }] },
      ...geminiHistory,
    ],
  })

  // 첫 메시지면 DB에 저장
  if (history?.length === 0 && convId) {
    // 첫 질문은 assistant 역할로 저장 (AI가 먼저 질문)
    await supabase.from('messages').insert({
      conversation_id: convId,
      role: 'assistant',
      content: getFirstQuestion(category, workTitle),
    })
  }

  // 사용자 메시지 저장 (history 마지막이 user인 경우)
  const lastMsg = history?.[history.length - 1]
  if (lastMsg?.role === 'user' && convId) {
    await supabase.from('messages').insert({
      conversation_id: convId,
      role: 'user',
      content: lastMsg.content,
    })
  }

  const result = await chat.sendMessageStream(
    history?.length === 0 ? getFirstQuestion(category, workTitle) : lastMsg?.content ?? ''
  )

  const encoder = new TextEncoder()
  let fullResponse = ''

  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of result.stream) {
        const text = chunk.text()
        fullResponse += text
        controller.enqueue(encoder.encode(text))
      }
      // AI 응답 DB 저장
      if (convId && fullResponse) {
        await supabase.from('messages').insert({
          conversation_id: convId,
          role: 'assistant',
          content: fullResponse,
        })
      }
      controller.enqueue(encoder.encode(`\n__CONV_ID__${convId}__`))
      controller.close()
    },
  })

  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
