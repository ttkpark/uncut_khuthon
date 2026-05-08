'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addWork(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요합니다.' }

  const title = (formData.get('title') as string).trim()
  const category = formData.get('category') as string
  if (!title) return { error: '제목을 입력해주세요.' }

  const { error } = await supabase.from('works').insert({ user_id: user.id, title, category })
  if (error) return { error: error.message }

  revalidatePath(`/category/${category}`)
  return { success: true }
}

export async function getWorks(category: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('works')
    .select('*')
    .eq('user_id', user.id)
    .eq('category', category)
    .order('created_at', { ascending: false })

  return data ?? []
}
