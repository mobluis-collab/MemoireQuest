// DEPRECATED: This callback was used for the OAuth redirect flow.
// The app now uses client-side Google Sign-In + signInWithIdToken.
// Kept as fallback — safe to remove once the new flow is confirmed stable.

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const errorParam = requestUrl.searchParams.get('error')
  const origin = requestUrl.origin

  // Google OAuth returned an error (user denied, etc.)
  if (errorParam) {
    const desc = requestUrl.searchParams.get('error_description') ?? 'Connexion annulée.'
    return NextResponse.redirect(`${origin}/?auth_error=${encodeURIComponent(desc)}`)
  }

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(`${origin}/dashboard`)
    }

    console.error('[auth/callback] Exchange error:', error.message)
    return NextResponse.redirect(`${origin}/?auth_error=${encodeURIComponent('Erreur de connexion. Réessaie.')}`)
  }

  // No code and no error — shouldn't happen normally
  return NextResponse.redirect(origin)
}
