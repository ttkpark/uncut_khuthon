'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })
  if (error) return { error: error.message }
  redirect('/home')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()
  const password = formData.get('password') as string
  const confirm = formData.get('confirm') as string

  if (password !== confirm) return { error: '비밀번호가 일치하지 않습니다.' }
  if (password.length < 6) return { error: '비밀번호는 6자 이상이어야 합니다.' }

  const { error } = await supabase.auth.signUp({
    email: formData.get('email') as string,
    password,
    options: { emailRedirectTo: undefined },
  })
  if (error) return { error: error.message }

  // 이메일 인증 없이 바로 로그인
  const { error: loginError } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password,
  })
  if (loginError) return { error: '가입 완료. 로그인 페이지에서 로그인해주세요.' }
  redirect('/home')
}

export async function loginWithGoogle() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://uncut-khuthon.vercel.app'}/auth/callback`,
    },
  })
  if (error || !data.url) redirect('/login')
  redirect(data.url)
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}
