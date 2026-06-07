import { useState } from 'react';
import { ArrowLeft, BookOpen, Sparkles } from 'lucide-react';
import type { View, StandardFocus, ReadingLevel } from '../data/types';
import { createSession, getSessionById } from '../data/store';

export default function TeacherSetupView({ onNavigate }: { onNavigate: (v: View) => void }) {
  const [standard, setStandard] = useState<StandardFocus>('VS.3');
  const [readingLevel, setReadingLevel] = useState<ReadingLevel>('on');
  const [sessionId, setSessionId] = useState<string | null>(null);

  function handleCreate() {
    const session = createSession(standard, readingLevel);
    setSessionId(session.id);
  }

  if (sessionId) {
    const session = getSessionById(sessionId!) ?? { code: '????' };
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md w-full card text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-7 h-7 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-navy-800 mb-2">Session Ready!</h2>
          <p className="text-navy-600 mb-6">Share this code with your students:</p>
          <div className="bg-navy-50 border-2 border-navy-200 rounded-lg py-4 px-6 mb-6">
            <span className="text-3xl font-bold tracking-widest text-navy-900">{session.code}</span>
          </div>
          <p className="text-navy-500 text-sm mb-6">
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
    <div className="min-h-screen bg-navy-50">
      <header className="bg-white border-b border-navy-100">
        <div className="max-w-xl mx-auto px-6 py-4 flex items-center gap-3">
          <button onClick={() => onNavigate({ kind: 'home' })} className="text-navy-500 hover:text-navy-700 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-navy-800">Create Session</h1>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-6 py-8">
        <div className="card space-y-6">
          <div className="flex items-center gap-2 text-navy-700">
            <BookOpen className="w-5 h-5" />
            <h2 className="font-semibold">Session Settings</h2>
          </div>

          <div>
            <label className="block text-sm font-semibold text-navy-700 mb-2">
              Standard Focus
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(['VS.3', 'VS.4'] as StandardFocus[]).map(s => (
                <button
                  key={s}
                  onClick={() => setStandard(s)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    standard === s
                      ? 'border-navy-700 bg-navy-50 text-navy-900'
                      : 'border-navy-100 bg-white text-navy-600 hover:border-navy-300'
                  }`}
                >
                  <div className="font-bold text-lg">{s}</div>
                  <div className="text-xs mt-1">
                    {s === 'VS.3' ? 'First Permanent Settlement' : 'Colonial Virginia'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-navy-700 mb-2">
              Reading Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {([
                { val: 'below' as ReadingLevel, label: 'Below', desc: 'Simpler language' },
                { val: 'on' as ReadingLevel, label: 'On Level', desc: 'Grade 4 text' },
                { val: 'above' as ReadingLevel, label: 'Above', desc: 'Richer vocabulary' },
              ]).map(r => (
                <button
                  key={r.val}
                  onClick={() => setReadingLevel(r.val)}
                  className={`p-3 rounded-lg border-2 text-center transition-all ${
                    readingLevel === r.val
                      ? 'border-navy-700 bg-navy-50 text-navy-900'
                      : 'border-navy-100 bg-white text-navy-600 hover:border-navy-300'
                  }`}
                >
                  <div className="font-bold text-sm">{r.label}</div>
                  <div className="text-xs mt-1">{r.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <button className="btn-primary w-full" onClick={handleCreate}>
            Generate Session Code
          </button>
        </div>
      </main>
    </div>
  );
}
