import { BarChart3, Ship } from 'lucide-react';
import type { View } from '../data/types';
import { DEMO_SESSION_ID } from '../data/seed';

export default function HomeView({ onNavigate }: { onNavigate: (v: View) => void }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero with illustration */}
      <header className="relative bg-navy-900 text-white overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 opacity-40">
          <img
            src="/Screenshot_2026-06-07_at_8.44.59_PM.png"
            alt="Jamestown settlement on the James River"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content overlay */}
        <div className="relative max-w-4xl mx-auto px-6 py-16 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-navy-700 flex items-center justify-center shadow-lg">
              <Ship className="w-8 h-8 text-amber-400" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 drop-shadow-lg">
            Jamestown Decision Simulator
          </h1>
          <p className="text-navy-100 text-lg max-w-2xl mx-auto leading-relaxed drop-shadow-md">
            A 7-minute branching simulation where students make real Jamestown decisions
            and teachers instantly see misconception insights for SOL-aligned reteaching.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3">
            <button
              onClick={() => onNavigate({ kind: 'teacher-dashboard', sessionId: DEMO_SESSION_ID })}
              className="btn-primary bg-amber-500 hover:bg-amber-600 text-navy-900 px-10 py-4 text-base shadow-xl"
            >
              Run 90-Second Live Demo
            </button>
            <p className="text-xs text-navy-200">
              Preloaded class data • No setup needed
            </p>
          </div>
        </div>
      </header>

      {/* Cards */}
      <main className="flex-1 flex items-stretch justify-center px-6 py-10">
        <div className="max-w-6xl w-full">
          <div className="grid md:grid-cols-2 gap-8 items-stretch">
            <div className="card p-8 md:p-10 min-h-[520px] flex flex-col border-2 border-navy-100">
              <h2 className="text-3xl font-bold text-navy-800 mb-4">I'm a Teacher</h2>
              <div className="min-h-[88px]">
                <p className="text-navy-600 text-base leading-relaxed">
                  Launch a standards-aligned simulation in minutes and leave class with clear,
                  actionable reteach priorities.
                </p>
              </div>
              <div className="mt-6">
                <button
                  onClick={() => onNavigate({ kind: 'teacher-setup' })}
                  className="btn-primary w-full"
                >
                  Teacher session
                </button>
              </div>
              <div className="mt-6 overflow-hidden rounded-2xl border border-navy-200 bg-navy-50 p-2">
                <img
                  src="/teacher-photo.png"
                  alt="Teacher preparing students for a Jamestown lesson"
                  className="w-full h-auto rounded-xl object-contain"
                />
              </div>
              <div className="mt-8 min-h-[172px]">
                <h3 className="text-xs font-bold uppercase tracking-wide text-navy-500">How teachers are using it</h3>
                <ul className="mt-3 space-y-2 text-sm text-navy-700 list-disc pl-5">
                  <li>Whole-class warm-up before Virginia Studies review.</li>
                  <li>Small-group intervention for misconception-heavy standards.</li>
                  <li>Data-backed parent conversation examples.</li>
                </ul>
              </div>
            </div>

            <div className="card p-8 md:p-10 min-h-[520px] flex flex-col border-2 border-navy-100">
              <h2 className="text-3xl font-bold text-navy-800 mb-4">I'm a Student</h2>
              <div className="min-h-[88px]">
                <p className="text-navy-600 text-base leading-relaxed">
                  Step into Jamestown, make decisions, explain your thinking, and get instant coaching
                  on how your choices affect the colony.
                </p>
              </div>
              <div className="mt-6">
                <button
                  onClick={() => onNavigate({ kind: 'student-join' })}
                  className="btn-primary w-full"
                >
                  Join student session
                </button>
              </div>
              <div className="mt-6 overflow-hidden rounded-2xl border border-navy-200 bg-navy-50 p-2">
                <img
                  src="/student-photo.png"
                  alt="Student practicing colonial history reasoning"
                  className="w-full h-auto rounded-xl object-contain"
                />
              </div>
              <div className="mt-8 min-h-[172px]">
                <h3 className="text-xs font-bold uppercase tracking-wide text-navy-500">Where students use it</h3>
                <ul className="mt-3 space-y-2 text-sm text-navy-700 list-disc pl-5">
                  <li>Center rotation activity during social studies block.</li>
                  <li>At-home SOL prep with guided reasoning prompts.</li>
                  <li>Post-lesson reflection and practice before quizzes.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Demo quick-access */}
      <div className="max-w-3xl mx-auto px-6 pb-8">
        <button
          onClick={() => onNavigate({ kind: 'teacher-dashboard', sessionId: DEMO_SESSION_ID })}
          className="w-full card border-2 border-dashed border-navy-200 hover:border-navy-400 hover:bg-navy-50/50 transition-all duration-200 text-center group cursor-pointer"
        >
          <div className="flex items-center justify-center gap-2 text-navy-600 group-hover:text-navy-800">
            <BarChart3 className="w-5 h-5" />
            <span className="font-semibold text-sm">View Demo Dashboard — Pre-loaded with 2 students</span>
          </div>
        </button>
      </div>


      <footer className="text-center py-6 text-navy-400 text-xs">
        VS.3 &amp; VS.4 Aligned &middot; Virginia Standards of Learning
      </footer>
    </div>
  );
}
