'use client'
import { createClient } from '@/lib/supabase/client'

// DEPRECATED: Replaced by GoogleLogin component + signInWithIdToken in HeroSection.
// Kept for reference — safe to remove once the new flow is confirmed stable.
export async function signInWithGoogle() {
  const supabase = createClient()
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: { prompt: 'select_account' },
    },
  })
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
}
