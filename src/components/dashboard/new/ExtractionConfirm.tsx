'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import type { ExtractionResult } from '@/types/extraction'
import { tw, bg } from '@/lib/color-utils'

interface ExtractionConfirmProps {
  extraction: ExtractionResult
  onConfirm: (correctedExtraction: ExtractionResult) => void
  onReanalyze: () => void
  isDark: boolean
  textIntensity: number
  accentColor: string
}

const TYPES_MEMOIRE = [
  'Mémoire professionnel',
  'Mémoire de recherche',
  'Rapport de stage',
  'Mémoire de fin d\'études',
  'Projet de fin d\'études',
  'Thèse professionnelle',
  'Autre',
]

const NIVEAUX = [
  'BTS', 'Licence 3', 'Bachelor', 'Master 1', 'Master 2',
  'MBA', 'Ingénieur', 'Doctorat', 'Autre',
]

const SECTION_LABELS = ['Général', 'Structure', 'Contenu', 'Confirmer']

export default function ExtractionConfirm({
  extraction,
  onConfirm,
  onReanalyze,
  isDark,
  textIntensity,
}: ExtractionConfirmProps) {
  const [data, setData] = useState<ExtractionResult>({ ...extraction })
  const [newCompetence, setNewCompetence] = useState('')
  const [activeSectionIdx, setActiveSectionIdx] = useState(0)
  const snapRef = useRef<HTMLDivElement>(null)

  const labelStyle = {
    fontSize: 11,
    fontWeight: 600 as const,
    color: tw(0.40, textIntensity, isDark),
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    marginBottom: 6,
    display: 'block' as const,
  }

  const inputStyle = {
    width: '100%',
    height: 44,
    padding: '8px 14px',
    borderRadius: 8,
    border: `1px solid ${bg(0.10, isDark)}`,
    background: bg(0.04, isDark),
    color: tw(0.80, textIntensity, isDark),
    fontSize: 14,
    fontFamily: 'inherit',
    outline: 'none',
    boxSizing: 'border-box' as const,
  }

  const selectStyle = {
    ...inputStyle,
    cursor: 'pointer' as const,
    appearance: 'none' as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M3 4.5l3 3 3-3'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    paddingRight: 32,
  }

  const textareaStyle = {
    width: '100%',
    minHeight: 120,
    padding: '12px 14px',
    borderRadius: 8,
    border: `1px solid ${bg(0.10, isDark)}`,
    background: bg(0.04, isDark),
    color: tw(0.80, textIntensity, isDark),
    fontSize: 14,
    fontFamily: 'inherit',
    outline: 'none',
    boxSizing: 'border-box' as const,
    resize: 'vertical' as const,
    lineHeight: 1.6,
  }

  const update = useCallback(<K extends keyof ExtractionResult>(key: K, value: ExtractionResult[K]) => {
    setData(prev => ({ ...prev, [key]: value }))
  }, [])

  const removeCompetence = useCallback((idx: number) => {
    setData(prev => ({
      ...prev,
      competences_a_valider: prev.competences_a_valider.filter((_, i) => i !== idx),
    }))
  }, [])

  const addCompetence = useCallback(() => {
    const trimmed = newCompetence.trim()
    if (!trimmed) return
    setData(prev => ({
      ...prev,
      competences_a_valider: [...prev.competences_a_valider, trimmed],
    }))
    setNewCompetence('')
  }, [newCompetence])

  // Ensure extracted type/niveau are in dropdown options
  const typeOptions = data.type_memoire && !TYPES_MEMOIRE.includes(data.type_memoire)
    ? [data.type_memoire, ...TYPES_MEMOIRE]
    : TYPES_MEMOIRE

  const niveauOptions = data.niveau && !NIVEAUX.includes(data.niveau)
    ? [data.niveau, ...NIVEAUX]
    : NIVEAUX

  // Scroll to section
  const scrollToSection = useCallback((idx: number) => {
    const container = snapRef.current
    if (!container) return
    const slide = container.querySelector(`[data-section="${idx}"]`) as HTMLElement
    if (slide) slide.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // IntersectionObserver for active section tracking
  useEffect(() => {
    const container = snapRef.current
    if (!container) return

    const slides = container.querySelectorAll<HTMLElement>('[data-section]')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = parseInt(entry.target.getAttribute('data-section') || '0')
            setActiveSectionIdx(idx)
          }
        })
      },
      { root: container, threshold: 0.6 }
    )

    slides.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  const sectionTitleStyle = {
    fontSize: 18, fontWeight: 700 as const, letterSpacing: '-0.3px',
    color: tw(0.85, textIntensity, isDark),
    marginBottom: 4,
  }

  const sectionSubtitleStyle = {
    fontSize: 12, color: tw(0.40, textIntensity, isDark),
    marginBottom: 20,
  }

  return (
    <div style={{
      width: '100%',
      maxWidth: 700,
      height: '100%',
      position: 'relative',
      animation: 'mq-fadein 0.3s ease both',
    }}>
      <style>{`@keyframes mq-fadein { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      {/* Scroll snap container */}
      <div
        ref={snapRef}
        style={{
          width: '100%',
          height: '100%',
          overflowY: 'auto',
          scrollSnapType: 'y mandatory',
          scrollBehavior: 'smooth',
        }}
      >
        {/* ─── Section 1 — Informations générales ─── */}
        <div
          data-section={0}
          style={{
            scrollSnapAlign: 'start',
            minHeight: '100%',
            padding: '32px 24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 16,
          }}
        >
          <div>
            <h3 style={sectionTitleStyle}>Informations générales</h3>
            <p style={sectionSubtitleStyle}>Type de document, niveau et établissement</p>
          </div>

          {/* Type de mémoire */}
          <div>
            <label style={labelStyle}>Type de mémoire</label>
            <select
              value={data.type_memoire}
              onChange={e => update('type_memoire', e.target.value)}
              style={selectStyle}
            >
              {typeOptions.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Niveau */}
          <div>
            <label style={labelStyle}>Niveau</label>
            <select
              value={data.niveau ?? ''}
              onChange={e => update('niveau', e.target.value || null)}
              style={selectStyle}
            >
              <option value="">Non détecté</option>
              {niveauOptions.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          {/* Discipline */}
          <div>
            <label style={labelStyle}>Discipline</label>
            <input
              type="text"
              value={data.discipline ?? ''}
              onChange={e => update('discipline', e.target.value || null)}
              placeholder="Ex: Marketing digital"
              style={inputStyle}
            />
          </div>

          {/* Établissement */}
          <div>
            <label style={labelStyle}>Établissement</label>
            <input
              type="text"
              value={data.etablissement ?? ''}
              onChange={e => update('etablissement', e.target.value || null)}
              placeholder="Non détecté"
              style={inputStyle}
            />
          </div>

          {/* Scroll hint */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 4, opacity: 0.25, marginTop: 12, pointerEvents: 'none',
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={tw(0.4, textIntensity, isDark)} strokeWidth="1.5" strokeLinecap="round">
              <path d="M4 6l4 4 4-4" />
            </svg>
            <span style={{ fontSize: 9, color: tw(0.3, textIntensity, isDark) }}>scroll</span>
          </div>
        </div>

        {/* ─── Section 2 — Structure et contraintes ─── */}
        <div
          data-section={1}
          style={{
            scrollSnapAlign: 'start',
            minHeight: '100%',
            padding: '32px 24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 16,
          }}
        >
          <div>
            <h3 style={sectionTitleStyle}>Structure et contraintes</h3>
            <p style={sectionSubtitleStyle}>Organisation du document et exigences formelles</p>
          </div>

          {/* Structure imposée */}
          <div>
            <label style={labelStyle}>Structure imposée</label>
            <textarea
              value={data.structure_imposee ?? ''}
              onChange={e => update('structure_imposee', e.target.value || null)}
              placeholder="Aucune structure imposée détectée"
              style={textareaStyle}
            />
          </div>

          {/* Contraintes formelles */}
          <div>
            <label style={labelStyle}>Contraintes formelles</label>
            <textarea
              value={data.contraintes_formelles ?? ''}
              onChange={e => update('contraintes_formelles', e.target.value || null)}
              placeholder="Aucune contrainte détectée"
              style={textareaStyle}
            />
          </div>

          {/* Nombre de pages */}
          <div>
            <label style={labelStyle}>Nombre de pages</label>
            <input
              type="text"
              value={data.nombre_pages ?? ''}
              onChange={e => update('nombre_pages', e.target.value || null)}
              placeholder="Ex: 40-60"
              style={inputStyle}
            />
          </div>

          {/* Deadline */}
          <div>
            <label style={labelStyle}>Deadline</label>
            <input
              type="date"
              value={data.deadline ?? ''}
              onChange={e => update('deadline', e.target.value || null)}
              style={{ ...inputStyle, cursor: 'pointer' }}
            />
          </div>
        </div>

        {/* ─── Section 3 — Contenu et compétences ─── */}
        <div
          data-section={2}
          style={{
            scrollSnapAlign: 'start',
            minHeight: '100%',
            padding: '32px 24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 16,
          }}
        >
          <div>
            <h3 style={sectionTitleStyle}>Contenu et compétences</h3>
            <p style={sectionSubtitleStyle}>Sujet, résumé et compétences à valider</p>
          </div>

          {/* Sujet / thème */}
          <div>
            <label style={labelStyle}>Sujet / thème</label>
            <input
              type="text"
              value={data.sujet_ou_theme ?? ''}
              onChange={e => update('sujet_ou_theme', e.target.value || null)}
              placeholder="Non détecté"
              style={inputStyle}
            />
          </div>

          {/* Résumé */}
          <div>
            <label style={labelStyle}>Résumé du contenu</label>
            <textarea
              value={data.resume_contenu}
              onChange={e => update('resume_contenu', e.target.value)}
              style={textareaStyle}
            />
          </div>

          {/* Compétences à valider */}
          <div>
            <label style={labelStyle}>Compétences à valider</label>
            <div style={{
              border: `1px solid ${bg(0.08, isDark)}`,
              borderRadius: 10,
              overflow: 'hidden',
            }}>
              {data.competences_a_valider.map((comp, idx) => (
                <div key={idx} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 14px',
                  borderBottom: idx < data.competences_a_valider.length - 1 ? `1px solid ${bg(0.06, isDark)}` : 'none',
                }}>
                  <input
                    type="text"
                    value={comp}
                    onChange={e => {
                      const updated = [...data.competences_a_valider]
                      updated[idx] = e.target.value
                      update('competences_a_valider', updated)
                    }}
                    style={{ ...inputStyle, border: 'none', background: 'transparent', padding: '4px 0', height: 'auto', flex: 1, fontSize: 14 }}
                  />
                  <button
                    onClick={() => removeCompetence(idx)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: tw(0.30, textIntensity, isDark), fontSize: 14,
                      padding: '2px 6px', borderRadius: 4, flexShrink: 0,
                    }}
                  >
                    {'\u2715'}
                  </button>
                </div>
              ))}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 14px',
                borderTop: data.competences_a_valider.length > 0 ? `1px solid ${bg(0.06, isDark)}` : 'none',
              }}>
                <input
                  type="text"
                  value={newCompetence}
                  onChange={e => setNewCompetence(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCompetence() } }}
                  placeholder="Ajouter une compétence..."
                  style={{ ...inputStyle, border: 'none', background: 'transparent', padding: '4px 0', height: 44, flex: 1, fontSize: 14 }}
                />
                <button
                  onClick={addCompetence}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: tw(0.40, textIntensity, isDark), fontSize: 12, fontWeight: 600,
                    padding: '4px 8px', borderRadius: 4, flexShrink: 0,
                  }}
                >
                  + Ajouter
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Section 4 — Confirmation ─── */}
        <div
          data-section={3}
          style={{
            scrollSnapAlign: 'start',
            minHeight: '100%',
            padding: '32px 24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 16,
          }}
        >
          <div>
            <h3 style={sectionTitleStyle}>Confirmation</h3>
            <p style={sectionSubtitleStyle}>Vérifie le récapitulatif avant de générer ton plan</p>
          </div>

          {/* Recap */}
          <div style={{
            background: bg(0.03, isDark),
            borderRadius: 12,
            padding: 20,
            border: `1px solid ${bg(0.06, isDark)}`,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}>
            {[
              ['Type', data.type_memoire],
              ['Niveau', data.niveau ?? 'Non renseigné'],
              ['Discipline', data.discipline ?? 'Non renseignée'],
              ['Établissement', data.etablissement ?? 'Non renseigné'],
              ['Pages', data.nombre_pages ?? 'Non renseigné'],
              ['Deadline', data.deadline ?? 'Aucune'],
              ['Sujet', data.sujet_ou_theme ?? 'Non renseigné'],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: tw(0.40, textIntensity, isDark), fontWeight: 500 }}>{label}</span>
                <span style={{ fontSize: 13, color: tw(0.75, textIntensity, isDark), fontWeight: 500, textAlign: 'right', maxWidth: '60%' }}>{value}</span>
              </div>
            ))}

            {data.competences_a_valider.length > 0 && (
              <div style={{ borderTop: `1px solid ${bg(0.06, isDark)}`, paddingTop: 10, marginTop: 2 }}>
                <span style={{ fontSize: 12, color: tw(0.40, textIntensity, isDark), fontWeight: 500 }}>Compétences</span>
                <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {data.competences_a_valider.map((c, i) => (
                    <span key={i} style={{
                      fontSize: 11, padding: '3px 10px', borderRadius: 99,
                      background: bg(0.06, isDark), color: tw(0.60, textIntensity, isDark),
                    }}>{c}</span>
                  ))}
                </div>
              </div>
            )}

            {data.structure_imposee && (
              <div style={{ borderTop: `1px solid ${bg(0.06, isDark)}`, paddingTop: 10, marginTop: 2 }}>
                <span style={{ fontSize: 12, color: tw(0.40, textIntensity, isDark), fontWeight: 500 }}>Structure imposée</span>
                <div style={{ fontSize: 12, color: tw(0.55, textIntensity, isDark), marginTop: 4, lineHeight: 1.5 }}>{data.structure_imposee}</div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 12, marginTop: 12,
          }}>
            <button
              onClick={onReanalyze}
              style={{
                background: 'transparent',
                color: tw(0.35, textIntensity, isDark),
                border: `1px solid ${bg(0.08, isDark)}`,
                borderRadius: 99,
                padding: '12px 28px',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {'\u2190'} Ré-analyser
            </button>
            <button
              onClick={() => onConfirm(data)}
              style={{
                background: bg(0.08, isDark),
                color: tw(0.70, textIntensity, isDark),
                border: `1px solid ${bg(0.12, isDark)}`,
                borderRadius: 99,
                padding: '12px 28px',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Générer le plan {'\u2192'}
            </button>
          </div>

          {/* Footer hint */}
          <p style={{
            fontSize: 11, color: tw(0.25, textIntensity, isDark),
            textAlign: 'center', marginTop: 8, lineHeight: 1.5,
          }}>
            L{'\''}IA va utiliser ces informations vérifiées pour générer un plan sur mesure.
          </p>
        </div>
      </div>

      {/* Dots — vertical column on the right */}
      <div style={{
        position: 'absolute',
        right: 12,
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        zIndex: 10,
      }}>
        {SECTION_LABELS.map((_, idx) => (
          <div
            key={idx}
            onClick={() => scrollToSection(idx)}
            style={{
              width: activeSectionIdx === idx ? 6 : 5,
              height: activeSectionIdx === idx ? 18 : 5,
              borderRadius: 99,
              background: activeSectionIdx === idx
                ? tw(0.6, textIntensity, isDark)
                : tw(0.12, textIntensity, isDark),
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(.4,0,.2,1)',
            }}
          />
        ))}
      </div>
    </div>
  )
}
