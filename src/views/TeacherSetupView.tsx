import { useState, type ChangeEvent } from 'react';
import { ArrowLeft, BookOpen, Sparkles, ChevronDown, Lightbulb } from 'lucide-react';
import type { View, StandardFocus, ReadingLevel } from '../data/types';
import { createSession, getSessionById } from '../data/store';
import { extractTextFromUpload, suggestReadingLevelFromWriting, type ReadingLevelSuggestion } from '../data/readingLevel';

export default function TeacherSetupView({ onNavigate }: { onNavigate: (v: View) => void }) {
  const [standard, setStandard] = useState<StandardFocus>('VS.3');
  const [readingLevel, setReadingLevel] = useState<ReadingLevel>('on');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [expandedStandard, setExpandedStandard] = useState(true);
  const [expandedReadingLevel, setExpandedReadingLevel] = useState(false);
  const [writingSample, setWritingSample] = useState('');
  const [sampleFileName, setSampleFileName] = useState('');
  const [analyzingSample, setAnalyzingSample] = useState(false);
  const [analysisError, setAnalysisError] = useState('');
  const [analysis, setAnalysis] = useState<ReadingLevelSuggestion | null>(null);

  function handleCreate() {
    const session = createSession(standard, readingLevel);
    setSessionId(session.id);
  }

  async function handleSampleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setAnalysisError('');
    setAnalysis(null);
    setAnalyzingSample(true);
    setSampleFileName(file.name);

    try {
      const extracted = await extractTextFromUpload(file);
      if (!extracted) {
        throw new Error('Could not extract readable text from this file.');
      }
      setWritingSample(extracted);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to process this file.';
      setAnalysisError(message);
    } finally {
      setAnalyzingSample(false);
      event.target.value = '';
    }
  }

  function handleAnalyzeSample() {
    const sample = writingSample.trim();
    if (!sample) {
      setAnalysisError('Paste or upload writing before running analysis.');
      return;
    }

    setAnalysisError('');
    const suggested = suggestReadingLevelFromWriting(sample);
    setAnalysis(suggested);
    setReadingLevel(suggested.suggestedLevel);
    setExpandedReadingLevel(true);
  }

  if (sessionId) {
    const session = getSessionById(sessionId!) ?? { code: '????' };
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md w-full card text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-7 h-7 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-200 mb-2">Session Ready!</h2>
          <p className="text-zinc-400 mb-6">Share this code with your students:</p>
          <div className="bg-zinc-50 border-2 border-zinc-200 rounded-lg py-4 px-6 mb-6">
            <span className="text-3xl font-bold tracking-widest text-zinc-900">{session.code}</span>
          </div>
          <p className="text-zinc-500 text-sm mb-6">
            Students go to "I'm a Student" and enter this code to begin.
          </p>
          <div className="flex flex-col gap-3">
            <button className="btn-primary" onClick={() => onNavigate({ kind: 'teacher-dashboard', sessionId })}>
              Open Teacher Dashboard
            </button>
            <button className="btn-secondary" onClick={() => onNavigate({ kind: 'home' })}>
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="bg-zinc-900 border-b border-zinc-800">
        <div className="max-w-xl mx-auto px-6 py-4 flex items-center gap-3">
          <button onClick={() => onNavigate({ kind: 'home' })} className="text-zinc-400 hover:text-zinc-100 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-zinc-200">Create Session</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <div className="card space-y-8">
          <div className="flex items-center gap-2 text-zinc-300">
            <BookOpen className="w-5 h-5" />
            <h2 className="font-semibold">Session Settings</h2>
          </div>

          {/* Standard Focus Section */}
          <div>
            <label className="block text-sm font-semibold text-zinc-300 mb-3">
              Standard Focus
            </label>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {(['VS.3', 'VS.4'] as StandardFocus[]).map(s => (
                <button
                  key={s}
                  onClick={() => {
                    setStandard(s);
                    setExpandedStandard(true);
                  }}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    standard === s
                      ? 'border-amber-400 bg-amber-50 text-zinc-900'
                      : 'border-zinc-700 bg-zinc-900 text-zinc-200 hover:border-zinc-500'
                  }`}
                >
                  <div className="font-bold text-lg">{s}</div>
                  <div className="text-xs mt-1">
                    {s === 'VS.3' ? 'First Permanent Settlement' : 'Colonial Virginia'}
                  </div>
                </button>
              ))}
            </div>

            {/* Standard Info Panel */}
            <div className={`bg-gradient-to-r from-blue-50 to-blue-25 border border-blue-200 rounded-lg overflow-hidden transition-all duration-300 ${expandedStandard ? 'opacity-100' : 'opacity-0 hidden'}`}>
              <button
                onClick={() => setExpandedStandard(!expandedStandard)}
                className="w-full flex items-center justify-between p-4 hover:bg-blue-100/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-zinc-900">About this standard</span>
                </div>
                <ChevronDown className={`w-5 h-5 text-blue-600 transition-transform ${expandedStandard ? 'rotate-180' : ''}`} />
              </button>

              {expandedStandard && (
                <div className="px-4 pb-4 border-t border-blue-200 space-y-3 text-sm">
                  {standard === 'VS.3' ? (
                    <>
                      <div>
                        <h4 className="font-semibold text-zinc-900 mb-1">VS.3: First Permanent Settlement (1607-1608)</h4>
                        <p className="text-zinc-700">
                          Students make <strong>survival decisions</strong> as the first 104 English settlers arrive in Virginia. Focus: where to build, how to relate to the Powhatan, food production, and leadership in a crisis.
                        </p>
                      </div>
                      <div className="bg-blue-100/70 rounded p-3 space-y-2">
                        <div className="font-semibold text-zinc-900">Decision Points:</div>
                        <ul className="text-zinc-800 space-y-1 ml-4 list-disc">
                          <li>Choosing a settlement location (inland vs. coastal vs. peninsula)</li>
                          <li>Managing relations with the Powhatan people</li>
                          <li>Food production strategies (English crops vs. local methods)</li>
                          <li>Governance under crisis (company rules vs. strong leader vs. self-governance)</li>
                        </ul>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <h4 className="font-semibold text-zinc-900 mb-1">VS.4: Colonial Virginia (1620s-1640s)</h4>
                        <p className="text-zinc-700">
                          Students navigate <strong>systemic choices</strong> as Virginia grows: expansion vs. negotiation, cash crops vs. self-sufficiency, indentured servants vs. slavery, and planter oligarchy vs. broader democracy.
                        </p>
                      </div>
                      <div className="bg-blue-100/70 rounded p-3 space-y-2">
                        <div className="font-semibold text-zinc-900">Decision Points:</div>
                        <ul className="text-zinc-800 space-y-1 ml-4 list-disc">
                          <li>Expansion strategy (rapid inland growth vs. negotiated borders vs. trading posts)</li>
                          <li>Economic model (tobacco plantations vs. diverse exports vs. self-sufficiency)</li>
                          <li>Labor systems (indentured servants vs. Native American slavery vs. African slavery)</li>
                          <li>Political power distribution (planter oligarchy vs. property-based voting vs. broader democracy)</li>
                        </ul>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
          {/* Optional Writing Analysis Section */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <h3 className="font-semibold text-zinc-200">Optional AI Reading-Level Suggestion</h3>
            </div>
            <p className="text-sm text-zinc-400 mb-3">
              Paste a student writing sample or upload a file. Analysis runs in-browser only and is not saved.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-1">
                  Upload writing sample (.txt, .docx, .pdf)
                </label>
                <input
                  type="file"
                  accept=".txt,.docx,.pdf,text/plain,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleSampleFileChange}
                  className="block w-full text-sm text-zinc-300 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-200 file:px-3 file:py-2 file:font-semibold file:text-zinc-900 hover:file:bg-zinc-300"
                />
                {sampleFileName && (
                  <p className="text-xs text-zinc-500 mt-1">Loaded file: {sampleFileName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-1">
                  Or paste student writing
                </label>
                <textarea
                  value={writingSample}
                  onChange={event => {
                    setWritingSample(event.target.value);
                    setAnalysis(null);
                    setAnalysisError('');
                  }}
                  rows={6}
                  placeholder="Paste student writing sample here..."
                  className="w-full px-4 py-3 border-2 border-zinc-100 rounded-lg focus:border-zinc-500 focus:outline-none transition-colors resize-y bg-zinc-50 text-zinc-900 placeholder-zinc-500"
                />
              </div>

              {analysisError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                  {analysisError}
                </div>
              )}

              <button
                type="button"
                onClick={handleAnalyzeSample}
                disabled={analyzingSample || !writingSample.trim()}
                className="btn-secondary"
              >
                {analyzingSample ? 'Processing file...' : 'Analyze sample'}
              </button>

              {analysis && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 space-y-2">
                  <p className="text-sm text-emerald-900">
                    Suggested reading level:{' '}
                    <span className="font-bold">
                      {readingLevelLabel(analysis.suggestedLevel)}
                    </span>
                  </p>
                  <p className="text-sm text-emerald-800">
                    Estimated grade {analysis.estimatedGrade.toFixed(1)} &middot; Confidence {analysis.confidence}
                  </p>
                  <ul className="text-sm text-emerald-800 list-disc pl-5 space-y-1">
                    {analysis.rationale.map(reason => (
                      <li key={reason}>{reason}</li>
                    ))}
                  </ul>
                  <p className="text-xs text-emerald-700">
                    Applied to the Reading Level setting below. You can still adjust it manually.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Reading Level Section */}
          <div>
            <label className="block text-sm font-semibold text-zinc-300 mb-3">
              Reading Level
            </label>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {([
                { val: 'below' as ReadingLevel, label: 'Below', desc: 'Simpler language' },
                { val: 'on' as ReadingLevel, label: 'On Level', desc: 'Grade 4 text' },
                { val: 'above' as ReadingLevel, label: 'Above', desc: 'Richer vocabulary' },
              ]).map(r => (
                <button
                  key={r.val}
                  onClick={() => {
                    setReadingLevel(r.val);
                    setExpandedReadingLevel(true);
                  }}
                  className={`p-3 rounded-lg border-2 text-center transition-all ${
                    readingLevel === r.val
                      ? 'border-amber-400 bg-amber-50 text-zinc-900'
                      : 'border-zinc-700 bg-zinc-900 text-zinc-200 hover:border-zinc-500'
                  }`}
                >
                  <div className="font-bold text-sm">{r.label}</div>
                  <div className="text-xs mt-1">{r.desc}</div>
                </button>
              ))}
            </div>

            {/* Reading Level Info Panel */}
            {expandedReadingLevel && (
              <div className="bg-gradient-to-r from-amber-50 to-amber-25 border border-amber-200 rounded-lg overflow-hidden transition-all duration-300">
                <button
                  onClick={() => setExpandedReadingLevel(!expandedReadingLevel)}
                  className="w-full flex items-center justify-between p-4 hover:bg-amber-100/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-600" />
                    <span className="font-semibold text-zinc-900">Reading level examples</span>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-amber-600 transition-transform ${expandedReadingLevel ? 'rotate-180' : ''}`} />
                </button>

                <div className="px-4 pb-4 border-t border-amber-200 space-y-4 text-sm">
                  {readingLevel === 'below' && (
                    <div className="space-y-3">
                      <div>
                        <div className="font-semibold text-zinc-900 mb-2">Below Grade Level — Simpler Language</div>
                        <p className="text-zinc-800 bg-amber-100/70 rounded p-3">
                          "The English settlers came to a new land. They did not know this place. The Powhatan people lived here. Should the settlers ask the Powhatan for help? Or should they try to do it alone?"
                        </p>
                      </div>
                      <div className="bg-amber-100/70 rounded p-3">
                        <div className="font-semibold text-zinc-900 mb-2">Use this level if students:</div>
                        <ul className="text-zinc-800 space-y-1 ml-4 list-disc">
                          <li>Struggle with multi-clause sentences</li>
                          <li>Benefit from short, direct statements</li>
                          <li>Need simplified vocabulary without losing meaning</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {readingLevel === 'on' && (
                    <div className="space-y-3">
                      <div>
                        <div className="font-semibold text-zinc-900 mb-2">On Grade Level (Grade 4) — Clear, Standard Text</div>
                        <p className="text-zinc-800 bg-amber-100/70 rounded p-3">
                          "In May 1607, English settlers arrived at the Chesapeake Bay. The Powhatan people had lived there for thousands of years. The settlers needed food and shelter. They could trade with the Powhatan, demand supplies, or try to farm on their own. What would you choose?"
                        </p>
                      </div>
                      <div className="bg-amber-100/70 rounded p-3">
                        <div className="font-semibold text-zinc-900 mb-2">Use this level if students:</div>
                        <ul className="text-zinc-800 space-y-1 ml-4 list-disc">
                          <li>Read at typical grade 4 fluency</li>
                          <li>Handle multi-sentence scenarios comfortably</li>
                          <li>Understand grade-level vocabulary in context</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {readingLevel === 'above' && (
                    <div className="space-y-3">
                      <div>
                        <div className="font-semibold text-zinc-900 mb-2">Above Grade Level — Rich Detail and Complexity</div>
                        <p className="text-zinc-800 bg-amber-100/70 rounded p-3">
                          "The Powhatan Confederacy, comprising over thirty tributary tribes, had cultivated sophisticated agricultural practices and maintained complex diplomatic relations for centuries. The English settlers' arrival disrupted these established systems, forcing difficult negotiations about land ownership, resource allocation, and sovereignty. Colonial expansion inevitably raised questions about coexistence versus displacement."
                        </p>
                      </div>
                      <div className="bg-amber-100/70 rounded p-3">
                        <div className="font-semibold text-zinc-900 mb-2">Use this level if students:</div>
                        <ul className="text-zinc-800 space-y-1 ml-4 list-disc">
                          <li>Read advanced vocabulary (confederacy, tributary, sophistication)</li>
                          <li>Grasp nuanced cause-and-effect relationships</li>
                          <li>Engage with longer, more complex sentence structures</li>
                          <li>Benefit from extended historical context and detail</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <button className="btn-primary w-full" onClick={handleCreate}>
            Generate Session Code
          </button>
        </div>
      </main>
    </div>
  );
}

function readingLevelLabel(level: ReadingLevel): string {
  if (level === 'below') return 'Below grade 4';
  if (level === 'above') return 'Above grade 4';
  return 'On grade 4';
}
