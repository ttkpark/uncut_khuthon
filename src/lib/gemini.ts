import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export function getGeminiModel(modelName = 'gemini-1.5-flash') {
  return genAI.getGenerativeModel({ model: modelName })
}

export const CATEGORY_PROMPTS: Record<string, string> = {
  music: '당신은 음악 감상 전문 AI입니다. 사용자가 들은 음악에 대해 깊이 있는 토론을 이끌어 주세요. 멜로디, 가사, 감정, 아티스트 배경 등을 주제로 질문하세요.',
  media: '당신은 도서 및 미디어 감상 전문 AI입니다. 사용자가 읽은 책이나 미디어에 대해 주제, 등장인물, 메시지 등을 주제로 토론을 이끌어 주세요.',
  video: '당신은 영상 콘텐츠 감상 전문 AI입니다. 사용자가 본 영화나 드라마에 대해 연출, 스토리, 배우, 주제의식 등을 주제로 토론을 이끌어 주세요.',
}

export function getFirstQuestion(category: string, title: string): string {
  const prompts: Record<string, string> = {
    music: `"${title}"을(를) 들으셨군요! 이 음악에서 가장 인상 깊었던 부분은 무엇인가요? 멜로디, 가사, 분위기 중 어떤 것이 가장 마음에 남았나요?`,
    media: `"${title}"을(를) 읽으셨군요! 이 작품에서 가장 기억에 남는 장면이나 구절이 있나요? 어떤 점이 특히 인상 깊었나요?`,
    video: `"${title}"을(를) 보셨군요! 이 작품의 전반적인 첫인상은 어떠셨나요? 특히 기억에 남는 장면이 있으신가요?`,
  }
  return prompts[category] ?? `"${title}"에 대한 감상을 자유롭게 나눠주세요!`
}
