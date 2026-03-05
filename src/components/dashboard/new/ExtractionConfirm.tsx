'use client'

import { useState, useCallback } from 'react'
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
  'M\u00e9moire professionnel',
  'M\u00e9moire de recherche',
  'Rapport de stage',
  'M\u00e9moire de fin d\'\u00e9tudes',
  'Projet de fin d\'\u00e9tudes',
  'Th\u00e8se professionnelle',
  'Autre',
]

const NIVEAUX = [
  'BTS', 'Licence 3', 'Bachelor', 'Master 1', 'Master 2',
  'MBA', 'Ing\u00e9nieur', 'Doctorat', 'Autre',
]

export default function ExtractionConfirm({
  extraction,
  onConfirm,
  onReanalyze,
  isDark,
  textIntensity,
  accentColor,
}: ExtractionConfirmProps) {
  const [data, setData] = useState<ExtractionResult>({ ...extraction })
  const [newCompetence, setNewCompetence] = useState('')

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
    padding: '8px 12px',
    borderRadius: 8,
    border: `1px solid ${bg(0.10, isDark)}`,
    background: bg(0.04, isDark),
    color: tw(0.80, textIntensity, isDark),
    fontSize: 13,
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

  return (
    <div style={{
      maxWidth: 560,
      width: '100%',
      padding: '40px 24px',
      animation: 'mq-fadein 0.3s ease both',
    }}>
      <style>{`@keyframes mq-fadein { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      {/* Header */}
      <h1 style={{
        fontSize: 22, fontWeight: 700, letterSpacing: '-0.4px', margin: 0,
        color: tw(0.90, textIntensity, isDark), textAlign: 'center',
      }}>
        Analyse de ton cahier des charges
      </h1>
      <p style={{
        fontSize: 13, color: tw(0.45, textIntensity, isDark),
        textAlign: 'center', marginTop: 8, marginBottom: 28,
      }}>
        V{'\u00e9'}rifie que l{'\u0027'}IA a bien compris ton document.
      </p>

      {/* Summary */}
      <div style={{
        background: bg(0.03, isDark),
        borderRadius: 12,
        padding: 16,
        border: `1px solid ${bg(0.06, isDark)}`,
        marginBottom: 24,
      }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: tw(0.35, textIntensity, isDark), marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          R{'\u00e9'}sum{'\u00e9'}
        </div>
        <div style={{ fontSize: 13, lineHeight: 1.6, color: tw(0.65, textIntensity, isDark) }}>
          {data.resume_contenu}
        </div>
      </div>

      {/* Fields */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Type de mémoire */}
        <div>
          <label style={labelStyle}>Type de m{'\u00e9'}moire</label>
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
            <option value="">Non d{'\u00e9'}tect{'\u00e9'}</option>
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
          <label style={labelStyle}>{'\u00c9'}tablissement</label>
          <input
            type="text"
            value={data.etablissement ?? ''}
            onChange={e => update('etablissement', e.target.value || null)}
            placeholder="Non d\u00e9tect\u00e9"
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

        {/* Structure imposée */}
        <div>
          <label style={labelStyle}>Structure impos{'\u00e9'}e</label>
          <textarea
            value={data.structure_imposee ?? ''}
            onChange={e => update('structure_imposee', e.target.value || null)}
            placeholder="Aucune structure impos\u00e9e d\u00e9tect\u00e9e"
            rows={3}
            style={{ ...inputStyle, resize: 'vertical' as const, lineHeight: 1.5 }}
          />
        </div>

        {/* Compétences à valider */}
        <div>
          <label style={labelStyle}>Comp{'\u00e9'}tences {'\u00e0'} valider</label>
          <div style={{
            border: `1px solid ${bg(0.08, isDark)}`,
            borderRadius: 10,
            overflow: 'hidden',
          }}>
            {data.competences_a_valider.map((comp, idx) => (
              <div key={idx} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 12px',
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
                  style={{ ...inputStyle, border: 'none', background: 'transparent', padding: '4px 0', flex: 1 }}
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
              padding: '8px 12px',
              borderTop: data.competences_a_valider.length > 0 ? `1px solid ${bg(0.06, isDark)}` : 'none',
            }}>
              <input
                type="text"
                value={newCompetence}
                onChange={e => setNewCompetence(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCompetence() } }}
                placeholder="Ajouter une comp\u00e9tence..."
                style={{ ...inputStyle, border: 'none', background: 'transparent', padding: '4px 0', flex: 1 }}
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

        {/* Contraintes formelles */}
        <div>
          <label style={labelStyle}>Contraintes formelles</label>
          <textarea
            value={data.contraintes_formelles ?? ''}
            onChange={e => update('contraintes_formelles', e.target.value || null)}
            placeholder="Aucune contrainte d\u00e9tect\u00e9e"
            rows={2}
            style={{ ...inputStyle, resize: 'vertical' as const, lineHeight: 1.5 }}
          />
        </div>

        {/* Sujet / thème */}
        <div>
          <label style={labelStyle}>Sujet / th{'\u00e8'}me</label>
          <input
            type="text"
            value={data.sujet_ou_theme ?? ''}
            onChange={e => update('sujet_ou_theme', e.target.value || null)}
            placeholder="Non d\u00e9tect\u00e9"
            style={inputStyle}
          />
        </div>
      </div>

      {/* Actions */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 12, marginTop: 32,
      }}>
        <button
          onClick={onReanalyze}
          style={{
            background: 'transparent',
            color: tw(0.35, textIntensity, isDark),
            border: `1px solid ${bg(0.08, isDark)}`,
            borderRadius: 99,
            padding: '10px 24px',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {'\u2190'} R{'\u00e9'}-analyser
        </button>
        <button
          onClick={() => onConfirm(data)}
          style={{
            background: bg(0.08, isDark),
            color: tw(0.70, textIntensity, isDark),
            border: `1px solid ${bg(0.12, isDark)}`,
            borderRadius: 99,
            padding: '10px 24px',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          G{'\u00e9'}n{'\u00e9'}rer le plan {'\u2192'}
        </button>
      </div>

      {/* Footer hint */}
      <p style={{
        fontSize: 11, color: tw(0.25, textIntensity, isDark),
        textAlign: 'center', marginTop: 16, lineHeight: 1.5,
      }}>
        L{'\u0027'}IA va utiliser ces informations v{'\u00e9'}rifi{'\u00e9'}es pour g{'\u00e9'}n{'\u00e9'}rer un plan sur mesure.
      </p>
    </div>
  )
}
