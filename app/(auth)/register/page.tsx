'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/useToast'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'エラー',
        description: 'パスワードが一致しません',
      })
      return
    }

    if (password.length < 6) {
      toast({
        variant: 'destructive',
        title: 'エラー',
        description: 'パスワードは6文字以上で入力してください',
      })
      return
    }

    setIsLoading(true)

    try {
      // ユーザー登録
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
        },
      })

      if (error) {
        toast({
          variant: 'destructive',
          title: '登録エラー',
          description: error.message,
        })
        return
      }

      if (data.user) {
        // プロフィール作成（デフォルト値で初期化）
        const profileData = {
          id: data.user.id,
          email: email,
          display_name: displayName || '塚田',
          height_cm: 172,
          weight_kg: 76,
          age: 30,
          gender: 'male' as const,
          goal_type: 'diet' as const,
        }
        const { error: profileError } = await supabase
          .from('profiles')
          .insert(profileData as any)

        if (profileError) {
          console.error('Profile creation error:', profileError)
        }
      }

      toast({
        title: '登録完了',
        description: 'アカウントが作成されました。プロフィールを設定してください。',
      })

      router.push('/profile')
      router.refresh()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'エラー',
        description: '予期せぬエラーが発生しました',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="text-4xl mb-2">🥗</div>
        <CardTitle className="text-2xl">新規登録</CardTitle>
        <CardDescription>
          アカウントを作成して始めましょう
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* 表示名 */}
          <div className="space-y-2">
            <Label htmlFor="displayName">お名前</Label>
            <Input
              id="displayName"
              type="text"
              placeholder="塚田"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* メールアドレス */}
          <div className="space-y-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              type="email"
              placeholder="mail@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          {/* パスワード */}
          <div className="space-y-2">
            <Label htmlFor="password">パスワード</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="6文字以上"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          {/* パスワード確認 */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">パスワード（確認）</Label>
            <Input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="パスワードを再入力"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            アカウント作成
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            すでにアカウントをお持ちの方は{' '}
            <Link href="/login" className="text-primary hover:underline">
              ログイン
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
