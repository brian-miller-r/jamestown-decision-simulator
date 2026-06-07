import { ArrowLeft, AlertTriangle, BookOpen, Users, ArrowRight, TrendingUp } from 'lucide-react';
import type { View, Scores, StudentResult } from '../data/types';
import { getSessionById, getResults } from '../data/store';
import { decisionNodes, misconceptionMeta } from '../data/decisions';
import ScoreBar from '../components/ScoreBar';

interface Props {
  sessionId: string;
  onNavigate: (v: View) => void;
}

export default function TeacherDashboardView({ sessionId, onNavigate }: Props) {
  const session = getSessionById(sessionId);
  const results = getResults(sessionId);

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="card text-center max-w-md">
          <h2 className="text-xl font-bold text-navy-800 mb-2">Session Not Found</h2>
          <button className="btn-primary" onClick={() => onNavigate({ kind: 'home' })}>Back to Home</button>
        </div>
      </div>
    );
  }

  // Aggregate misconceptions
  const misCounts: Record<string, number> = {};
  for (const r of results) {
    for (const tag of r.misconceptionTags) {
      misCounts[tag] = (misCounts[tag] ?? 0) + 1;
    }
  }
  const topMisconceptions = Object.entries(misCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  // Average scores
  const avgScores: Scores = { survival: 0, economy: 0, diplomacy: 0, governance: 0 };
  if (results.length > 0) {
    for (const r of results) {
      avgScores.survival += r.finalScores.survival;
      avgScores.economy += r.finalScores.economy;
      avgScores.diplomacy += r.finalScores.diplomacy;
      avgScores.governance += r.finalScores.governance;
    }
    avgScores.survival = Math.round(avgScores.survival / results.length);
    avgScores.economy = Math.round(avgScores.economy / results.length);
    avgScores.diplomacy = Math.round(avgScores.diplomacy / results.length);
    avgScores.governance = Math.round(avgScores.governance / results.length);
  }

  // Two students for comparison
  const studentA = results[0];
  const studentB = results[1];

  return (
    <div className="min-h-screen bg-navy-50">
      <header className="bg-navy-900 text-white">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-navy-300 text-sm mb-1">
                <span>Session {session.code}</span>
                <span>&middot;</span>
                <span>{session.standard}</span>
                <span>&middot;</span>
                <span>{results.length} student{results.length !== 1 ? 's' : ''}</span>
              </div>
              <h1 className="text-2xl font-bold">Teacher Insights Dashboard</h1>
            </div>
            <button
              onClick={() => onNavigate({ kind: 'home' })}
              className="text-navy-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Class Overview */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-navy-700" />
              <h2 className="text-lg font-bold text-navy-800">Class Average Scores</h2>
            </div>
            {results.length > 0 ? (
              <ScoreBar scores={avgScores} />
            ) : (
              <div className="text-center py-8 text-navy-400">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No students have completed yet.</p>
                <p className="text-sm">Share code <strong>{session.code}</strong> with your class.</p>
              </div>
            )}
          </div>

          {/* Top Misconceptions */}
          <div className="card border-l-4 border-l-amber-400">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-bold text-navy-800">Top Misconceptions</h2>
            </div>
            {topMisconceptions.length > 0 ? (
              <div className="space-y-3">
                {topMisconceptions.map(([tag, count]) => {
                  const meta = misconceptionMeta[tag];
                  if (!meta) return null;
                  return (
                    <div key={tag} className="flex items-start gap-3">
                      <span className="shrink-0 w-7 h-7 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center mt-0.5">
                        {count}
                      </span>
                      <div>
                        <div className="font-semibold text-navy-800 text-sm">{meta.label}</div>
                        <div className="text-xs text-navy-500">{meta.description}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-navy-400 text-sm">No misconceptions detected — great class!</p>
            )}
          </div>
        </div>

        {/* Reteaching Actions */}
        {topMisconceptions.length > 0 && (
          <div className="card border-l-4 border-l-blue-500">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-navy-800">Suggested Mini-Lessons</h2>
            </div>
            <div className="space-y-3">
              {topMisconceptions.map(([tag]) => {
                const meta = misconceptionMeta[tag];
                if (!meta) return null;
                return (
                  <div key={tag} className="flex items-start gap-3 bg-blue-50 rounded-lg p-3">
                    <ArrowRight className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-semibold text-navy-800 text-sm">{meta.label}</div>
                      <div className="text-sm text-navy-600">{meta.reteachAction}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Student Comparison WOW */}
        {studentA && studentB && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-navy-700" />
              <h2 className="text-lg font-bold text-navy-800">Student Comparison</h2>
              <span className="text-xs bg-emerald-100 text-emerald-700 font-semibold px-2 py-0.5 rounded-full">
                LIVE INSIGHT
              </span>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <StudentCard result={studentA} highlight="emerald" />
              <StudentCard result={studentB} highlight="amber" />
            </div>

            {/* Insight comparison */}
            <div className="card mt-6">
              <h3 className="font-bold text-navy-800 mb-3">Key Insight</h3>
              <CompareInsight a={studentA} b={studentB} />
            </div>
          </div>
        )}

        {/* Individual Results List */}
        {results.length > 0 && (
          <div className="card">
            <h2 className="text-lg font-bold text-navy-800 mb-4">All Student Results</h2>
            <div className="space-y-2">
              {results.map(r => (
                <div key={r.id} className="flex items-center justify-between p-3 bg-navy-50 rounded-lg">
                  <div>
                    <span className="font-semibold text-navy-800">{r.displayName}</span>
                    <span className="text-navy-400 text-sm ml-2">
                      Score: {Object.values(r.finalScores).reduce((a, b) => a + b, 0)}/400
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {r.misconceptionTags.slice(0, 2).map(tag => {
                      const meta = misconceptionMeta[tag];
                      return meta ? (
                        <span key={tag} className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
                          {meta.label}
                        </span>
                      ) : null;
                    })}
                    {r.misconceptionTags.length > 2 && (
                      <span className="text-xs text-navy-400">+{r.misconceptionTags.length - 2} more</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function StudentCard({ result, highlight }: { result: StudentResult; highlight: string }) {

  const borderColor = highlight === 'emerald' ? 'border-t-emerald-500' : 'border-t-amber-500';
  return (
    <div className={`card border-t-4 ${borderColor}`}>
      <h3 className="text-lg font-bold text-navy-800 mb-1">{result.displayName}</h3>
      <div className="text-xs text-navy-400 mb-3">
        Total: {Object.values(result.finalScores).reduce((a, b) => a + b, 0)}/400
      </div>
      <ScoreBar scores={result.finalScores} />

      <div className="mt-4 space-y-2">
        {result.decisions.map((d, i) => {
          const node = decisionNodes.find(n => n.id === d.nodeId);
          const opt = node?.options.find(o => o.id === d.optionId);
          return (
            <div key={d.nodeId} className="text-sm">
              <span className="font-semibold text-navy-700">{i + 1}. {node?.title}:</span>{' '}
              <span className="text-navy-600">{opt?.shortText}</span>
            </div>
          );
        })}
      </div>

      {result.misconceptionTags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {result.misconceptionTags.map(tag => {
            const meta = misconceptionMeta[tag];
            return meta ? (
              <span key={tag} className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
                {meta.label}
              </span>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
}

function CompareInsight({ a, b }: { a: StudentResult; b: StudentResult }) {
  // Find a key difference
  const aDip = a.finalScores.diplomacy;
  const bDip = b.finalScores.diplomacy;
  const aGov = a.finalScores.governance;
  const bGov = b.finalScores.governance;
  const aSurv = a.finalScores.survival;
  const bSurv = b.finalScores.survival;

  const insights: string[] = [];

  if (Math.abs(aDip - bDip) > 20) {
    const higher = aDip > bDip ? a.displayName : b.displayName;
    const lower = aDip > bDip ? b.displayName : a.displayName;
    insights.push(
      `${higher} scored much higher in Powhatan Diplomacy because they chose trade and cooperation. ${lower} chose force or avoidance, which hurt diplomatic relations — a pattern the real Jamestown colonists also experienced.`
    );
  }

  if (Math.abs(aGov - bGov) > 20) {
    const higher = aGov > bGov ? a.displayName : b.displayName;
    insights.push(
      `${higher} leaned toward self-governance, mirroring the House of Burgesses. This connected to VS.3 standard about representative government in colonial Virginia.`
    );
  }

  if (Math.abs(aSurv - bSurv) > 20) {
    const lower = aSurv < bSurv ? a.displayName : b.displayName;
    insights.push(
      `${lower}'s lower survival score shows the danger of depending on supply ships — a misconception many students share about early Jamestown.`
    );
  }

  if (insights.length === 0) {
    insights.push(
      `${a.displayName} and ${b.displayName} made different choices but ended up with similar outcomes. This is a great chance to discuss how multiple paths can lead to survival — or failure — in colonial Virginia.`
    );
  }

  return (
    <div className="space-y-3">
      {insights.map((text, i) => (
        <p key={i} className="text-navy-700 text-sm leading-relaxed">{text}</p>
      ))}
    </div>
  );
}
