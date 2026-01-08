'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Loader2, Save, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/useToast'
import type { Profile } from '@/types/database'

type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active'
type Goal = 'lose' | 'maintain' | 'gain'

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [profile, setProfile] = useState<Partial<Profile>>({})

  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        toast({
          variant: 'destructive',
          title: 'エラー',
          description: 'プロフィールの取得に失敗しました',
        })
        return
      }

      setProfile(data)
      setIsLoading(false)
    }

    fetchProfile()
  }, [supabase, router, toast])

  const handleSave = async () => {
    setIsSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('ログインが必要です')

      const { error } = await (supabase
        .from('profiles') as any)
        .update({
          display_name: profile.display_name,
          gender: profile.gender,
          birth_date: profile.birth_date,
          height_cm: profile.height_cm,
          weight_kg: profile.weight_kg,
          target_weight_kg: profile.target_weight_kg,
          activity_level: profile.activity_level,
          goal: profile.goal,
          // BMR/TDEE/目標PFCはトリガーで自動計算される
        })
        .eq('id', user.id)

      if (error) throw error

      toast({
        title: '保存完了',
        description: 'プロフィールを更新しました',
      })

      router.refresh()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'エラー',
        description: error instanceof Error ? error.message : '保存に失敗しました',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header title="プロフィール" showDate={false} />

      <div className="container max-w-2xl mx-auto p-4 md:p-6 space-y-6">
        {/* 基本情報 */}
        <Card>
          <CardHeader>
            <CardTitle>基本情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">表示名</Label>
              <Input
                id="displayName"
                value={profile.display_name || ''}
                onChange={(e) =>
                  setProfile({ ...profile, display_name: e.target.value })
                }
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="gender">性別</Label>
                <Select
                  value={profile.gender || ''}
                  onValueChange={(value) =>
                    setProfile({ ...profile, gender: value as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">男性</SelectItem>
                    <SelectItem value="female">女性</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthDate">生年月日</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={profile.birth_date || ''}
                  onChange={(e) =>
                    setProfile({ ...profile, birth_date: e.target.value })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 身体情報 */}
        <Card>
          <CardHeader>
            <CardTitle>身体情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="height">身長 (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={profile.height_cm || ''}
                  onChange={(e) =>
                    setProfile({ ...profile, height_cm: Number(e.target.value) })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">現在の体重 (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  value={profile.weight_kg || ''}
                  onChange={(e) =>
                    setProfile({ ...profile, weight_kg: Number(e.target.value) })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetWeight">目標体重 (kg)</Label>
                <Input
                  id="targetWeight"
                  type="number"
                  step="0.1"
                  value={profile.target_weight_kg || ''}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      target_weight_kg: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="activityLevel">活動レベル</Label>
                <Select
                  value={String(profile.activity_level) || ''}
                  onValueChange={(value) =>
                    setProfile({ ...profile, activity_level: value as ActivityLevel })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">座り仕事が多い</SelectItem>
                    <SelectItem value="lightly_active">軽い運動あり</SelectItem>
                    <SelectItem value="moderately_active">適度な運動あり</SelectItem>
                    <SelectItem value="very_active">激しい運動あり</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="goal">目標</Label>
                <Select
                  value={profile.goal || ''}
                  onValueChange={(value) =>
                    setProfile({ ...profile, goal: value as Goal })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lose">減量</SelectItem>
                    <SelectItem value="maintain">維持</SelectItem>
                    <SelectItem value="gain">増量</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 計算された目標値 */}
        <Card>
          <CardHeader>
            <CardTitle>あなたの目標値（自動計算）</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{profile.bmr?.toFixed(0) || '-'}</div>
                <div className="text-xs text-muted-foreground">基礎代謝 (kcal)</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{profile.tdee?.toFixed(0) || '-'}</div>
                <div className="text-xs text-muted-foreground">消費カロリー (kcal)</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">
                  {profile.target_calories?.toFixed(0) || '-'}
                </div>
                <div className="text-xs text-muted-foreground">目標カロリー (kcal)</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="flex justify-center gap-2 text-lg font-bold">
                  <span className="text-red-500">{profile.target_protein_g?.toFixed(0) || '-'}g</span>
                  <span className="text-amber-500">{profile.target_fat_g?.toFixed(0) || '-'}g</span>
                  <span className="text-blue-500">{profile.target_carb_g?.toFixed(0) || '-'}g</span>
                </div>
                <div className="text-xs text-muted-foreground">目標 P/F/C</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* アクションボタン */}
        <div className="flex gap-3">
          <Button className="flex-1" onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            保存する
          </Button>
        </div>

        <Separator />

        {/* ログアウト */}
        <Button
          variant="outline"
          className="w-full"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          ログアウト
        </Button>
      </div>
    </div>
  )
}
