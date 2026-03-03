import { useState } from "react";

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
  { label: 'Débutant' },
  { label: 'Initié' },
  { label: 'Confirmé' },
  { label: 'Diplômé' },
];

function AchievementCard({ a }) {
  const pct = a.progress ? Math.round((a.progress.current / a.progress.target) * 100) : a.unlocked ? 100 : 0;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '7px 10px',
      borderRadius: 7,
      background: a.unlocked ? 'rgba(255,255,255,0.05)' : 'transparent',
    }}>
      <div style={{
        width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: a.unlocked ? 'rgba(255,255,255,0.12)' : 'transparent',
        border: `1.5px solid rgba(255,255,255,${a.unlocked ? '0.25' : '0.07'})`,
      }}>
        {a.unlocked && (
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.70)', lineHeight: 1 }}>&#10003;</span>
        )}
      </div>

      <span style={{
        flex: 1, fontSize: 12, fontWeight: 500,
        color: a.unlocked ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.30)',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {a.title}
      </span>

      {!a.unlocked && a.progress && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <div style={{
            width: 32, height: 2, borderRadius: 99,
            background: 'rgba(255,255,255,0.06)',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', width: `${pct}%`, borderRadius: 99,
              background: 'rgba(255,255,255,0.22)',
            }} />
          </div>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', minWidth: 22, textAlign: 'right' }}>
            {pct}%
          </span>
        </div>
      )}
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
      }}>

        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <h1 style={{
              fontSize: 20, fontWeight: 600, letterSpacing: '-0.3px',
              color: 'rgba(255,255,255,0.88)', margin: 0,
            }}>Progression</h1>
            <span style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.35)' }}>
              {unlocked} sur {total}
            </span>
          </div>

          <div style={{
            marginTop: 12, width: '100%', height: 3, borderRadius: 99,
            background: 'rgba(255,255,255,0.05)',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', width: `${globalPct}%`, borderRadius: 99,
              background: 'rgba(255,255,255,0.28)',
            }} />
          </div>
        </div>

        {/* Grid 2x2 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 14,
        }}>
          {grouped.map(({ label, items }) => {
            const groupUnlocked = items.filter(i => i.unlocked).length;
            const groupTotal = items.length;

            return (
              <div key={label} style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: 10,
                padding: 12,
                display: 'flex', flexDirection: 'column', gap: 4,
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  marginBottom: 4, padding: '0 2px',
                }}>
                  <span style={{
                    fontSize: 12, fontWeight: 600, letterSpacing: '0.2px',
                    color: 'rgba(255,255,255,0.50)',
                  }}>{label}</span>
                  <span style={{
                    fontSize: 10, color: 'rgba(255,255,255,0.22)',
                  }}>{groupUnlocked}/{groupTotal}</span>
                </div>

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
