import { ArrowLeft, AlertTriangle, BookOpen, Users, ArrowRight, TrendingUp, Brain, Sparkles, RotateCcw } from 'lucide-react';
import type { View, Scores, StudentResult, DecisionNode } from '../data/types';
import { getSessionById, getResults } from '../data/store';
import { getDecisionNodes, misconceptionMeta } from '../data/decisions';
import { generateTeacherInsights, generateSmartComparison } from '../data/ai';
import { DEMO_SESSION_ID, resetDemoData } from '../data/seed';
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

  // AI-powered insights
  const allNodes = results.length > 0 ? getDecisionNodes(results[0].standard || 'VS.3') : [];
  const aiInsights = generateTeacherInsights(results, allNodes);

  // Two students for comparison
  const studentA = results[0];
  const studentB = results[1];

  // AI-powered smart comparison
  const smartComparisons = studentA && studentB
    ? generateSmartComparison(studentA, studentB)
    : [];

  const reteachPriorities = topMisconceptions
    .map(([tag, count], index) => {
      const meta = misconceptionMeta[tag];
      if (!meta) return null;
      const studentsNeedingHelp = results
        .filter(r => r.misconceptionTags.includes(tag))
        .map(r => r.displayName);
      return {
        key: tag,
        priority: index + 1,
        count,
        label: meta.label,
        studentsNeedingHelp,
        tenMinutePlan: toTenMinutePlan(meta.reteachAction),
      };
    })
    .filter((value): value is {
      key: string;
      priority: number;
      count: number;
      label: string;
      studentsNeedingHelp: string[];
      tenMinutePlan: string;
    } => value !== null);

  function handleResetDemo() {
    resetDemoData();
    onNavigate({ kind: 'teacher-dashboard', sessionId: DEMO_SESSION_ID });
  }

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
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Brain className="w-6 h-6 text-amber-400" /> AI Insights Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleResetDemo}
                className="text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-navy-900 px-3 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Demo Data
              </button>
              <button
                onClick={() => onNavigate({ kind: 'home' })}
                className="text-navy-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Teach Tomorrow Priorities */}
        {reteachPriorities.length > 0 && (
          <div className="card border-2 border-blue-200 bg-gradient-to-br from-white to-blue-50/40">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-navy-800">Top 3 Reteach Priorities (Teach Tomorrow)</h2>
            </div>
            <div className="space-y-4">
              {reteachPriorities.map(priority => (
                <div key={priority.key} className="rounded-lg border border-blue-200 bg-white p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-navy-800">
                      Priority {priority.priority}: {priority.label}
                    </h3>
                    <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                      {priority.count} student{priority.count !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <p className="text-sm text-navy-600 mb-2">
                    <span className="font-semibold">Who needs help:</span>{' '}
                    {priority.studentsNeedingHelp.join(', ')}
                  </p>
                  <p className="text-sm text-navy-700">
                    <span className="font-semibold">10-minute activity:</span> {priority.tenMinutePlan}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
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

        {/* AI-Powered Insights — THE WOW SECTION */}
        {aiInsights.length > 0 && (
          <div className="card border-2 border-amber-200 bg-gradient-to-br from-white to-amber-50/30">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-6 h-6 text-amber-500" />
              <h2 className="text-lg font-bold text-navy-800">AI-Detected Patterns</h2>
              <span className="text-xs bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> AI ANALYSIS
              </span>
            </div>
            <div className="space-y-4">
              {aiInsights.map((insight, i) => (
                <div key={i} className={`rounded-lg p-4 border ${
                  insight.severity === 'high' ? 'bg-red-50 border-red-200' :
                  insight.severity === 'medium' ? 'bg-amber-50 border-amber-200' :
                  'bg-navy-50 border-navy-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${
                        insight.severity === 'high' ? 'bg-red-200 text-red-800' :
                        insight.severity === 'medium' ? 'bg-amber-200 text-amber-800' :
                        'bg-navy-200 text-navy-800'
                      }`}>
                        {insight.severity} priority
                      </span>
                      <span className="font-bold text-navy-800 text-sm">{insight.pattern}</span>
                    </div>
                    <span className="text-xs text-navy-400">
                      {insight.students.join(', ')}
                    </span>
                  </div>
                  <p className="text-navy-700 text-sm leading-relaxed mb-2">{insight.description}</p>
                  <div className="flex items-start gap-2 bg-white/60 rounded p-2">
                    <BookOpen className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                    <p className="text-sm text-navy-600"><span className="font-semibold">Teaching move:</span> {insight.reteachSuggestion}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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

        {/* Student Comparison with AI Smart Analysis */}
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
              <StudentCard result={studentA} highlight="emerald" decisionNodes={allNodes} />
              <StudentCard result={studentB} highlight="amber" decisionNodes={allNodes} />
            </div>

            {/* AI Smart Comparison */}
            {smartComparisons.length > 0 && (
              <div className="card mt-6 border-l-4 border-l-amber-400">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="w-5 h-5 text-amber-500" />
                  <h3 className="font-bold text-navy-800">AI Comparative Analysis</h3>
                </div>
                <div className="space-y-4">
                  {smartComparisons.map((comp, i) => (
                    <div key={i}>
                      <h4 className="font-semibold text-navy-800 text-sm mb-1">{comp.headline}</h4>
                      <p className="text-navy-700 text-sm leading-relaxed mb-2">{comp.analysis}</p>
                      <div className="flex items-start gap-2 bg-blue-50 rounded p-2">
                        <BookOpen className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                        <p className="text-sm text-navy-600"><span className="font-semibold">Teaching move:</span> {comp.teachingMove}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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

function toTenMinutePlan(reteachAction: string): string {
  return `2 min launch prompt, 6 min guided activity, 2 min exit ticket: ${reteachAction}`;
}

function StudentCard({ result, highlight, decisionNodes }: { result: StudentResult; highlight: string; decisionNodes: DecisionNode[] }) {
  const borderColor = highlight === 'emerald' ? 'border-t-emerald-500' : 'border-t-amber-500';

  // Analyze reasoning quality for each decision
  const avgWords = result.decisions.reduce((sum, d) => sum + d.reasoning.split(/\s+/).filter(Boolean).length, 0) / Math.max(result.decisions.length, 1);

  return (
    <div className={`card border-t-4 ${borderColor}`}>
      <h3 className="text-lg font-bold text-navy-800 mb-1">{result.displayName}</h3>
      <div className="flex items-center gap-3 text-xs text-navy-400 mb-3">
        <span>Total: {Object.values(result.finalScores).reduce((a, b) => a + b, 0)}/400</span>
        <span>Avg reasoning: {Math.round(avgWords)} words</span>
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
              <p className="text-navy-400 italic text-xs mt-0.5 truncate">"{d.reasoning}"</p>
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
