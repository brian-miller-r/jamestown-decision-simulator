import { Ship, GraduationCap, Users, BarChart3 } from 'lucide-react';
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
        </div>
      </header>

      {/* Cards */}
      <main className="flex-1 flex items-start justify-center px-6 py-12">
        <div className="max-w-3xl w-full grid md:grid-cols-2 gap-6">
          <button
            onClick={() => onNavigate({ kind: 'teacher-setup' })}
            className="card text-left hover:shadow-xl hover:border-navy-300 transition-all duration-200 group cursor-pointer"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-navy-100 flex items-center justify-center group-hover:bg-navy-200 transition-colors">
                <GraduationCap className="w-5 h-5 text-navy-700" />
              </div>
              <h2 className="text-xl font-bold text-navy-800">I'm a Teacher</h2>
            </div>
            <p className="text-navy-600 text-sm leading-relaxed">
              Create a simulation session, choose your standard focus, and get real-time
              misconception insights from your students' decisions.
            </p>
            <div className="mt-4 text-navy-700 font-semibold text-sm group-hover:text-navy-900">
              Set up session &rarr;
            </div>
          </button>

          <button
            onClick={() => onNavigate({ kind: 'student-join' })}
            className="card text-left hover:shadow-xl hover:border-navy-300 transition-all duration-200 group cursor-pointer"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-navy-100 flex items-center justify-center group-hover:bg-navy-200 transition-colors">
                <Users className="w-5 h-5 text-navy-700" />
              </div>
              <h2 className="text-xl font-bold text-navy-800">I'm a Student</h2>
            </div>
            <p className="text-navy-600 text-sm leading-relaxed">
              Enter your session code and step into 1607 Jamestown. Make decisions,
              explain your thinking, and see how your colony survives.
            </p>
            <div className="mt-4 text-navy-700 font-semibold text-sm group-hover:text-navy-900">
              Join session &rarr;
            </div>
          </button>
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
