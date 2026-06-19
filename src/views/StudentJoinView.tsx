import { useState } from 'react';
import { ArrowLeft, LogIn } from 'lucide-react';
import type { View } from '../data/types';
import { getSessionByCode } from '../data/store';

interface Props {
  onJoin: (view: View) => void;
  onBack: () => void;
}

export default function StudentJoinView({ onJoin, onBack }: Props) {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  function handleJoin() {
    const upper = code.trim().toUpperCase();
    const trimmedName = name.trim();
    if (!upper || !trimmedName) {
      setError('Please enter both a session code and your name.');
      return;
    }
    const session = getSessionByCode(upper);
    if (!session) {
      setError('Session not found. Check the code and try again.');
      return;
    }
    const studentId = crypto.randomUUID();

    if (typeof pendo !== 'undefined') {
      pendo.track('student_joined_session', {
        sessionId: session.id,
        sessionCode: upper,
        studentId,
        standard: session.standard,
        readingLevel: session.readingLevel,
      });
    }

    onJoin({ kind: 'student-sim', sessionId: session.id, studentId, studentName: trimmedName });
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="bg-zinc-900 border-b border-zinc-800">
        <div className="max-w-md mx-auto px-6 py-4 flex items-center gap-3">
          <button onClick={onBack} className="text-zinc-400 hover:text-zinc-100 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-zinc-200">Join Session</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 py-8">
        <div className="card space-y-5">
          <div className="flex items-center gap-2 text-zinc-300 mb-2">
            <LogIn className="w-5 h-5" />
            <h2 className="font-semibold">Enter Your Details</h2>
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-300 mb-1">
              Session Code
            </label>
            <input
              type="text"
              value={code}
              onChange={e => { setCode(e.target.value); setError(''); }}
              placeholder="e.g. JMS1607"
              className="w-full px-4 py-3 border-2 border-zinc-100 rounded-lg text-lg tracking-widest font-semibold
                         focus:border-zinc-500 focus:outline-none transition-colors text-center uppercase
                         bg-zinc-50 text-zinc-900 placeholder-zinc-500"
              maxLength={8}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-300 mb-1">
              Your First Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setError(''); }}
              placeholder="Enter your first name"
              className="w-full px-4 py-3 border-2 border-zinc-100 rounded-lg text-lg
                         focus:border-zinc-500 focus:outline-none transition-colors
                         bg-zinc-50 text-zinc-900 placeholder-zinc-500"
              maxLength={20}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <button className="btn-primary w-full" onClick={handleJoin}>
            Start Simulation
          </button>

          <p className="text-center text-zinc-400 text-xs">
            Demo code: JMS1607
          </p>
        </div>
      </main>
    </div>
  );
}
