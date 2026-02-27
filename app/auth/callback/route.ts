import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Session établie avec succès - redirect vers dashboard
      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  // Si pas de code ou erreur - redirect vers home
  return NextResponse.redirect(origin)
}
