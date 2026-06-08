import { ArrowRight, Trophy, Target, Lightbulb, Brain, BookOpen } from 'lucide-react';
import type { View } from '../data/types';
import { getResult } from '../data/store';
import { getDecisionNodes, misconceptionMeta } from '../data/decisions';
import { generateDebrief } from '../data/ai';
import ScoreBar from '../components/ScoreBar';

interface Props {
  sessionId: string;
  studentId: string;
  onNavigate: (v: View) => void;
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

  const decisionNodes = getDecisionNodes(result.standard || 'VS.3');
  const ai = generateDebrief(result, decisionNodes);

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
        {/* AI-generated narrative */}
        <div className="card border-l-4 border-l-amber-400">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-5 h-5 text-amber-500" />
            <h2 className="text-sm font-bold text-navy-800 uppercase tracking-wide">AI Colony Summary</h2>
          </div>
          <p className="text-navy-700 leading-relaxed">{ai.narrative}</p>
        </div>

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

        {/* AI-powered debrief cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="card text-center border-t-4 border-t-emerald-500">
            <Target className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-navy-800 uppercase mb-1">Strength</h3>
            <p className="text-navy-700 text-sm leading-relaxed">{ai.strengthNarrative}</p>
          </div>
          <div className="card text-center border-t-4 border-t-amber-500">
            <Lightbulb className="w-6 h-6 text-amber-600 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-navy-800 uppercase mb-1">Growth Area</h3>
            <p className="text-navy-700 text-sm leading-relaxed">{ai.growthNarrative}</p>
          </div>
          <div className="card text-center border-t-4 border-t-blue-500">
            <ArrowRight className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-navy-800 uppercase mb-1">Next Step</h3>
            <p className="text-navy-600 text-sm leading-relaxed">{ai.nextStepPersonalized}</p>
          </div>
        </div>

        {/* Historical connection */}
        <div className="card border-l-4 border-l-navy-600">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-navy-600" />
            <h3 className="text-sm font-bold text-navy-800 uppercase tracking-wide">SOL Connection</h3>
          </div>
          <p className="text-navy-700 text-sm leading-relaxed">{ai.historicalConnection}</p>
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
