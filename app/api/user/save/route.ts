import { NextResponse } from 'next/server'

/**
 * POST /api/user/save
 * Route désactivée — héritée de l'ancien système (user_progress).
 * Le nouveau maimouarkwest utilise /api/plan et memoir_plans.
 * Retourne 410 Gone pour bloquer tout accès sans exposer de vulnérabilité.
 */
export async function POST() {
  return NextResponse.json({ error: 'Endpoint désactivé' }, { status: 410 })
}
