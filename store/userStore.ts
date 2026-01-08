import { create } from 'zustand'
import type { Profile } from '@/types/database'

interface UserState {
  // ユーザー情報
  userId: string | null
  profile: Profile | null
  isLoading: boolean

  // アクション
  setUserId: (id: string | null) => void
  setProfile: (profile: Profile | null) => void
  setIsLoading: (value: boolean) => void
  reset: () => void
}

export const useUserStore = create<UserState>((set) => ({
  userId: null,
  profile: null,
  isLoading: true,

  setUserId: (id) => set({ userId: id }),
  setProfile: (profile) => set({ profile }),
  setIsLoading: (value) => set({ isLoading: value }),
  reset: () =>
    set({
      userId: null,
      profile: null,
      isLoading: false,
    }),
}))
