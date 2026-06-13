import type { LucideIcon } from 'lucide-react';
import { ArrowRight, BarChart3, BookOpen, Brain, ChevronRight, Image } from 'lucide-react';
import type { View } from '../data/types';
interface UseCaseTile {
  title: string;
  description: string;
  eyebrow: string;
  icon: LucideIcon;
  borderClass: string;
  gradientClass: string;
  iconClass: string;
}

const useCaseTiles: UseCaseTile[] = [
  {
    title: 'Student Reasoning Coach',
    description: 'Socratic AI feedback helps students explain choices with stronger evidence.',
    eyebrow: 'Coach',
    icon: Brain,
    borderClass: 'border-indigo-200',
    gradientClass: 'from-indigo-50 to-blue-50',
    iconClass: 'text-indigo-600',
  },
  {
    title: 'Teacher Insight Dashboard',
    description: 'Instant class-level misconception patterns guide tomorrow’s reteaching plans.',
    eyebrow: 'Analytics',
    icon: BarChart3,
    borderClass: 'border-emerald-200',
    gradientClass: 'from-emerald-50 to-teal-50',
    iconClass: 'text-emerald-600',
  },
  {
    title: 'Adaptive Reading Support',
    description: 'Prompts adjust to below, on, and above grade reading levels.',
    eyebrow: 'Adaptation',
    icon: BookOpen,
    borderClass: 'border-amber-200',
    gradientClass: 'from-amber-50 to-orange-50',
    iconClass: 'text-amber-600',
  },
  {
    title: 'SOL Scene Generation',
    description: 'AI-generated visuals make concepts across all SOL modules vivid and memorable.',
    eyebrow: 'Visuals',
    icon: Image,
    borderClass: 'border-violet-200',
    gradientClass: 'from-violet-50 to-fuchsia-50',
    iconClass: 'text-violet-600',
  },
];

export default function PlatformHomeView({ onNavigate }: { onNavigate: (v: View) => void }) {
  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900 flex flex-col font-sans">
      <main className="flex-1 px-6 py-14 md:py-20 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[760px] h-[500px] bg-indigo-200/40 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -right-16 w-[360px] h-[360px] bg-violet-200/35 blur-[100px] rounded-full pointer-events-none" />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-14 md:mb-16">
            <button
              type="button"
              onClick={() => onNavigate({ kind: 'simulator' })}
              className="group inline-flex items-center gap-3 text-zinc-600 hover:text-zinc-800 mb-8 transition-colors"
              aria-label="Open Virginia Studies SOL simulator"
            >
              <span className="inline-flex items-center rounded-full border border-orange-500 bg-white px-3 py-0.5 text-xs font-medium text-orange-600">
                New
              </span>
              <span className="text-base md:text-lg font-medium">Virginia Studies SOL</span>
              <ChevronRight className="w-4 h-4 text-zinc-500 transition-transform group-hover:translate-x-0.5" />
            </button>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-500 mb-4">
              SOLTutor.AI
            </p>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight text-zinc-950">
              Personalized AI learning for every
              <br />
              <span className="underline decoration-zinc-400 decoration-4 underline-offset-[10px]">
                Virginia SOL.
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-zinc-600 max-w-2xl mx-auto leading-relaxed font-light">
              An advanced AI learning platform covering all Virginia Standards of Learning for elementary and middle school students.
            </p>

            <div className="mt-10">
              <button
                onClick={() => onNavigate({ kind: 'simulator' })}
                className="group inline-flex items-center gap-2 px-8 py-4 bg-zinc-950 text-white rounded-full text-lg font-medium hover:bg-zinc-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 md:gap-5 border-t border-zinc-300 pt-10">
            {useCaseTiles.map(tile => {
              const Icon = tile.icon;
              return (
                <div
                  key={tile.title}
                  className={`group rounded-3xl border ${tile.borderClass} bg-gradient-to-br ${tile.gradientClass} p-6 md:p-7 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md`}
                >
                  <div className="flex items-center justify-between mb-8">
                    <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      {tile.eyebrow}
                    </span>
                    <div className="w-11 h-11 rounded-xl bg-white border border-zinc-200 flex items-center justify-center">
                      <Icon className={`w-5 h-5 ${tile.iconClass}`} />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 mb-2">{tile.title}</h3>
                  <p className="text-sm text-zinc-600 leading-relaxed">{tile.description}</p>
                  <div className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-zinc-700 group-hover:text-zinc-950">
                    Explore
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
      <footer className="py-8 text-center text-zinc-500 text-sm border-t border-zinc-200">
        &copy; {new Date().getFullYear()} SOL Tutor.AI. Powered by Gemini.
      </footer>
    </div>
  );
}
