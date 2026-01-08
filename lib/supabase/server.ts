import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'

// ダミー環境かどうかをチェック
export function isDemoMode() {
  return !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes('example.supabase.co')
}

export function createServerSupabaseClient() {
  const cookieStore = cookies()

  // ダミー環境の場合はダミーのURLとキーを使用
  const url = isDemoMode() ? 'https://placeholder.supabase.co' : process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = isDemoMode() ? 'placeholder-key' : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createServerClient<Database>(
    url,
    key,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // サーバーコンポーネントからの呼び出し時は無視
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // サーバーコンポーネントからの呼び出し時は無視
          }
        },
      },
    }
  )
}

export async function getSession() {
  if (isDemoMode()) return null
  
  const supabase = createServerSupabaseClient()
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return session
  } catch (error) {
    console.error('Error getting session:', error)
    return null
  }
}

export async function getUser() {
  if (isDemoMode()) return null
  
  const supabase = createServerSupabaseClient()
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    return user
  } catch (error) {
    console.error('Error getting user:', error)
    return null
  }
}
