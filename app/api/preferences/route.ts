import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const DEFAULT_ACCENT_COLOR = '#6366f1'
const DEFAULT_TEXT_INTENSITY = 1.2
const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/
const TEXT_INTENSITY_MIN = 0.5
const TEXT_INTENSITY_MAX = 1.5

// GET — retourne les préférences de l'utilisateur connecté
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data } = await supabase
    .from('user_preferences')
    .select('accent_color, text_intensity')
    .eq('user_id', user.id)
    .single()

  return NextResponse.json({
    accent_color: data?.accent_color ?? DEFAULT_ACCENT_COLOR,
    text_intensity: data?.text_intensity ?? DEFAULT_TEXT_INTENSITY,
  })
}

// PUT — sauvegarde les préférences (partial update supporté)
export async function PUT(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body: Record<string, unknown> = await request.json()
  const { accent_color, text_intensity } = body

  // Au moins un champ doit être fourni
  const hasAccentColor = accent_color !== undefined
  const hasTextIntensity = text_intensity !== undefined

  if (!hasAccentColor && !hasTextIntensity) {
    return NextResponse.json(
      { error: 'At least one field required: accent_color or text_intensity' },
      { status: 400 }
    )
  }

  // Validation accent_color si fourni
  if (hasAccentColor) {
    if (typeof accent_color !== 'string' || !HEX_COLOR_REGEX.test(accent_color)) {
      return NextResponse.json({ error: 'Invalid color format. Use #XXXXXX' }, { status: 400 })
    }
  }

  // Validation text_intensity si fourni
  if (hasTextIntensity) {
    if (typeof text_intensity !== 'number' || !Number.isFinite(text_intensity)) {
      return NextResponse.json({ error: 'text_intensity must be a finite number' }, { status: 400 })
    }
    if (text_intensity < TEXT_INTENSITY_MIN || text_intensity > TEXT_INTENSITY_MAX) {
      return NextResponse.json(
        { error: `text_intensity must be between ${TEXT_INTENSITY_MIN} and ${TEXT_INTENSITY_MAX}` },
        { status: 400 }
      )
    }
  }

  // Construire l'objet de mise à jour avec uniquement les champs fournis
  const updatePayload: {
    user_id: string
    updated_at: string
    accent_color?: string
    text_intensity?: number
  } = {
    user_id: user.id,
    updated_at: new Date().toISOString(),
  }

  if (hasAccentColor) {
    updatePayload.accent_color = accent_color as string
  }
  if (hasTextIntensity) {
    updatePayload.text_intensity = text_intensity as number
  }

  const { error } = await supabase
    .from('user_preferences')
    .upsert(updatePayload)

  if (error) {
    console.error('[preferences] Error saving:', error)
    return NextResponse.json({ error: 'Failed to save preference' }, { status: 500 })
  }

  // Retourner uniquement les champs qui ont été mis à jour
  const response: { accent_color?: string; text_intensity?: number } = {}
  if (hasAccentColor) response.accent_color = accent_color as string
  if (hasTextIntensity) response.text_intensity = text_intensity as number

  return NextResponse.json(response)
}
