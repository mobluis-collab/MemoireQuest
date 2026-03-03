import { useState } from "react";

// Fake data for preview
const MOCK_ACHIEVEMENTS = [
  { id: 'first_section', title: 'Première section validée', group: 'Débutant', unlocked: true, progress: null },
  { id: 'streak_3', title: '3 jours consécutifs', group: 'Débutant', unlocked: true, progress: null },
  { id: 'sections_5', title: '5 sections validées', group: 'Débutant', unlocked: false, progress: { current: 3, target: 5 } },
  { id: 'first_chapter', title: 'Premier chapitre terminé', group: 'Initié', unlocked: false, progress: null },
  { id: 'streak_7', title: '7 jours consécutifs', group: 'Initié', unlocked: false, progress: { current: 3, target: 7 } },
  { id: 'sections_10', title: '10 sections validées', group: 'Initié', unlocked: false, progress: { current: 3, target: 10 } },
  { id: 'half_way', title: '50% du mémoire', group: 'Initié', unlocked: false, progress: { current: 3, target: 12 } },
  { id: 'chapters_3', title: '3 chapitres terminés', group: 'Confirmé', unlocked: false, progress: { current: 0, target: 3 } },
  { id: 'streak_14', title: '14 jours consécutifs', group: 'Confirmé', unlocked: false, progress: { current: 3, target: 14 } },
  { id: 'sections_20', title: '20 sections validées', group: 'Confirmé', unlocked: false, progress: { current: 3, target: 20 } },
  { id: 'all_done', title: 'Mémoire terminé', group: 'Diplômé', unlocked: false, progress: { current: 3, target: 24 } },
];

const GROUPS = [
  { label: 'Débutant', icon: '📘' },
  { label: 'Initié', icon: '📗' },
  { label: 'Confirmé', icon: '📙' },
  { label: 'Diplômé', icon: '📕' },
];

function AchievementCard({ a }) {
  const pct = a.progress ? Math.round((a.progress.current / a.progress.target) * 100) : a.unlocked ? 100 : 0;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '8px 12px',
      borderRadius: 8,
      background: a.unlocked ? 'rgba(255,255,255,0.06)' : 'transparent',
      border: `1px solid rgba(255,255,255,${a.unlocked ? '0.10' : '0.04'})`,
    }}>
      {/* Status icon */}
      <div style={{
        width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: a.unlocked ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.04)',
        border: `1.5px solid rgba(255,255,255,${a.unlocked ? '0.30' : '0.08'})`,
      }}>
        {a.unlocked ? (
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.80)' }}>✓</span>
        ) : (
          <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)' }}>●</span>
        )}
      </div>

      {/* Title */}
      <span style={{
        flex: 1, fontSize: 12, fontWeight: 500,
        color: a.unlocked ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.35)',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {a.title}
      </span>

      {/* Progress or badge */}
      {a.unlocked ? (
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.40)', flexShrink: 0 }}>✓</span>
      ) : a.progress ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <div style={{
            width: 36, height: 3, borderRadius: 99,
            background: 'rgba(255,255,255,0.06)',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', width: `${pct}%`, borderRadius: 99,
              background: 'rgba(255,255,255,0.25)',
            }} />
          </div>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.30)', minWidth: 24, textAlign: 'right' }}>
            {pct}%
          </span>
        </div>
      ) : null}
    </div>
  );
}

export default function AchievementsPreview() {
  const unlocked = MOCK_ACHIEVEMENTS.filter(a => a.unlocked).length;
  const total = MOCK_ACHIEVEMENTS.length;
  const globalPct = Math.round((unlocked / total) * 100);

  const grouped = GROUPS.map(g => ({
    ...g,
    items: MOCK_ACHIEVEMENTS.filter(a => a.group === g.label),
  }));

  return (
    <div style={{
      minHeight: '100vh', background: '#04030e',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      <div style={{
        width: '100%', maxWidth: 520,
        display: 'flex', flexDirection: 'column',
        gap: 0,
      }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <h1 style={{
              fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px',
              color: 'rgba(255,255,255,0.90)', margin: 0,
            }}>Progression</h1>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.50)' }}>
              {unlocked}/{total}
            </span>
          </div>

          {/* Global progress bar */}
          <div style={{
            marginTop: 12, width: '100%', height: 4, borderRadius: 99,
            background: 'rgba(255,255,255,0.06)',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', width: `${globalPct}%`, borderRadius: 99,
              background: 'rgba(255,255,255,0.30)',
              transition: 'width 0.6s ease',
            }} />
          </div>
          <div style={{
            fontSize: 11, color: 'rgba(255,255,255,0.30)',
            marginTop: 6, textAlign: 'right',
          }}>{globalPct}% complété</div>
        </div>

        {/* ── Groups as compact columns ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
        }}>
          {grouped.map(({ label, icon, items }) => {
            const groupUnlocked = items.filter(i => i.unlocked).length;
            const groupTotal = items.length;

            return (
              <div key={label} style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 12,
                padding: 14,
                display: 'flex', flexDirection: 'column', gap: 8,
              }}>
                {/* Group header */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  marginBottom: 2,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 14 }}>{icon}</span>
                    <span style={{
                      fontSize: 13, fontWeight: 600,
                      color: 'rgba(255,255,255,0.65)',
                    }}>{label}</span>
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 500,
                    color: 'rgba(255,255,255,0.30)',
                  }}>{groupUnlocked}/{groupTotal}</span>
                </div>

                {/* Achievements */}
                {items.map(a => (
                  <AchievementCard key={a.id} a={a} />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
