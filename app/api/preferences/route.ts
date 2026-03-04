import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const DEFAULT_ACCENT_COLOR = '#7C3AED'
const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/

// GET — retourne la couleur d'accent de l'utilisateur connecté
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data } = await supabase
    .from('user_preferences')
    .select('accent_color')
    .eq('user_id', user.id)
    .single()

  return NextResponse.json({ accent_color: data?.accent_color ?? DEFAULT_ACCENT_COLOR })
}

// PUT — sauvegarde la couleur d'accent
export async function PUT(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { accent_color } = body as { accent_color: unknown }

  // Validation hex
  if (typeof accent_color !== 'string' || !HEX_COLOR_REGEX.test(accent_color)) {
    return NextResponse.json({ error: 'Invalid color format. Use #XXXXXX' }, { status: 400 })
  }

  const { error } = await supabase
    .from('user_preferences')
    .upsert({
      user_id: user.id,
      accent_color,
      updated_at: new Date().toISOString(),
    })

  if (error) {
    console.error('[preferences] Error saving:', error)
    return NextResponse.json({ error: 'Failed to save preference' }, { status: 500 })
  }

  return NextResponse.json({ accent_color })
}
