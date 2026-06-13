import type { Scores } from '../data/types';

const labels: Record<keyof Scores, { label: string; color: string }> = {
  survival: { label: 'Survival Readiness', color: 'bg-red-500' },
  economy: { label: 'Colony Economy', color: 'bg-amber-500' },
  diplomacy: { label: 'Powhatan Diplomacy', color: 'bg-emerald-500' },
  governance: { label: 'Governance Stability', color: 'bg-blue-500' },
};

export default function ScoreBar({ scores, showValues = true }: { scores: Scores; showValues?: boolean }) {
  return (
    <div className="space-y-3">
      {(Object.keys(labels) as (keyof Scores)[]).map(key => {
        const { label, color } = labels[key];
        const val = scores[key];
        return (
          <div key={key}>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-zinc-300">{label}</span>
              {showValues && <span className="text-zinc-500 font-semibold">{val}</span>}
            </div>
            <div className="score-bar">
              <div className={`score-fill ${color}`} style={{ width: `${val}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
