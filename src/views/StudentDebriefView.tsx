import { ArrowRight, Trophy, Target, Lightbulb } from 'lucide-react';
import type { View, Scores } from '../data/types';
import { getResult } from '../data/store';
import ScoreBar from '../components/ScoreBar';
import { decisionNodes, misconceptionMeta } from '../data/decisions';

interface Props {
  sessionId: string;
  studentId: string;
  onNavigate: (v: View) => void;
}

function getStrength(scores: Scores): string {
  const entries = Object.entries(scores) as [keyof Scores, number][];
  const best = entries.sort((a, b) => b[1] - a[1])[0];
  const labels: Record<keyof Scores, string> = {
    survival: 'Survival Readiness',
    economy: 'Colony Economy',
    diplomacy: 'Powhatan Diplomacy',
    governance: 'Governance Stability',
  };
  return labels[best[0]];
}

function getGrowth(scores: Scores): string {
  const entries = Object.entries(scores) as [keyof Scores, number][];
  const worst = entries.sort((a, b) => a[1] - b[1])[0];
  const labels: Record<keyof Scores, string> = {
    survival: 'Survival Readiness',
    economy: 'Colony Economy',
    diplomacy: 'Powhatan Diplomacy',
    governance: 'Governance Stability',
  };
  return labels[worst[0]];
}

function getNextStep(scores: Scores): string {
  const entries = Object.entries(scores) as [keyof Scores, number][];
  const worst = entries.sort((a, b) => a[1] - b[1])[0];
  const hints: Record<keyof Scores, string> = {
    survival: 'Think about what colonists needed most: clean water, food, and safety from disease.',
    economy: 'Consider how trading with the Powhatan and growing local crops built wealth.',
    diplomacy: 'Reflect on how cooperation, not conflict, helped both colonists and Powhatan survive.',
    governance: 'Remember that the House of Burgesses showed people can govern themselves wisely.',
  };
  return hints[worst[0]];
}

export default function StudentDebriefView({ sessionId, studentId, onNavigate }: Props) {
  const result = getResult(studentId);

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="card text-center max-w-md">
          <h2 className="text-xl font-bold text-navy-800 mb-2">Result Not Found</h2>
          <button className="btn-primary" onClick={() => onNavigate({ kind: 'home' })}>Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-50">
      <header className="bg-navy-900 text-white">
        <div className="max-w-3xl mx-auto px-6 py-8 text-center">
          <div className="w-14 h-14 rounded-full bg-amber-400 flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-7 h-7 text-navy-900" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Simulation Complete!</h1>
          <p className="text-navy-200 text-lg">{result.displayName}'s Colony Report</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* Final Scores */}
        <div className="card">
          <h2 className="text-lg font-bold text-navy-800 mb-4">Final Colony Scores</h2>
          <ScoreBar scores={result.finalScores} />
          <div className="mt-4 text-center">
            <span className="text-3xl font-bold text-navy-800">
              {Object.values(result.finalScores).reduce((a, b) => a + b, 0)}
            </span>
            <span className="text-navy-400 text-sm ml-2">/ 400 total</span>
          </div>
        </div>

        {/* Decision Review */}
        <div className="card">
          <h2 className="text-lg font-bold text-navy-800 mb-4">Your Decisions</h2>
          <div className="space-y-4">
            {result.decisions.map((d, i) => {
              const node = decisionNodes.find(n => n.id === d.nodeId);
              const opt = node?.options.find(o => o.id === d.optionId);
              return (
                <div key={d.nodeId} className="border-l-[3px] border-navy-200 pl-4">
                  <div className="text-xs text-navy-400 font-semibold">Decision {i + 1}</div>
                  <div className="font-semibold text-navy-800">{node?.title}</div>
                  <div className="text-sm text-navy-600 mt-1">Chose: {opt?.shortText}</div>
                  <div className="text-sm text-navy-400 italic mt-1">"{d.reasoning}"</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Three-section debrief */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="card text-center border-t-4 border-t-emerald-500">
            <Target className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-navy-800 uppercase mb-1">Strength</h3>
            <p className="text-navy-700 font-semibold">{getStrength(result.finalScores)}</p>
          </div>
          <div className="card text-center border-t-4 border-t-amber-500">
            <Lightbulb className="w-6 h-6 text-amber-600 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-navy-800 uppercase mb-1">Growth Area</h3>
            <p className="text-navy-700 font-semibold">{getGrowth(result.finalScores)}</p>
          </div>
          <div className="card text-center border-t-4 border-t-blue-500">
            <ArrowRight className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-navy-800 uppercase mb-1">Next Step</h3>
            <p className="text-navy-600 text-sm">{getNextStep(result.finalScores)}</p>
          </div>
        </div>

        {/* Misconception coaching */}
        {result.misconceptionTags.length > 0 && (
          <div className="card border-l-4 border-l-amber-400">
            <h2 className="text-lg font-bold text-navy-800 mb-3">Ideas to Explore</h2>
            <div className="space-y-3">
              {result.misconceptionTags.map(tag => {
                const meta = misconceptionMeta[tag];
                if (!meta) return null;
                return (
                  <div key={tag}>
                    <div className="font-semibold text-navy-800">{meta.label}</div>
                    <div className="text-sm text-navy-600">{meta.description}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="text-center py-4">
          <button className="btn-primary" onClick={() => onNavigate({ kind: 'teacher-dashboard', sessionId })}>
            View Teacher Dashboard
          </button>
        </div>
      </main>
    </div>
  );
}
