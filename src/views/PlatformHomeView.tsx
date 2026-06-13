import { Brain, LineChart, BookOpen, ArrowRight } from 'lucide-react';
import type { View } from '../data/types';

export default function PlatformHomeView({ onNavigate }: { onNavigate: (v: View) => void }) {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans">
      <main className="flex-1 flex flex-col items-center justify-center px-6 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white opacity-[0.03] blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-4xl w-full text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/50 text-sm text-zinc-400 mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            Platform Preview
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
            SOL Tutor.AI
          </h1>
          
          <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-12 font-light">
            An advanced AI learning platform covering all Virginia Standards of Learning for elementary and middle school students.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24">
            <button
              onClick={() => onNavigate({ kind: 'simulator' })}
              className="group flex items-center gap-2 px-8 py-4 bg-white text-black rounded-full text-lg font-medium hover:bg-zinc-200 transition-all duration-300 transform hover:scale-105"
            >
              Get Started
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-zinc-500 text-sm mt-4 sm:mt-0 sm:ml-4">
              Currently testing: Jamestown Decision Simulator
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-left border-t border-zinc-800 pt-16">
            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold">AI Powered</h3>
              <p className="text-zinc-400 leading-relaxed">
                Adaptive learning models that respond dynamically to student choices, providing personalized feedback and coaching.
              </p>
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                <LineChart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold">Instant Teacher Insights</h3>
              <p className="text-zinc-400 leading-relaxed">
                Real-time analytics and misconception tracking to inform targeted reteaching strategies the very next day.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold">Aligned to VA SOL Standards</h3>
              <p className="text-zinc-400 leading-relaxed">
                Rigorous content mapping ensures every interaction directly supports Virginia state testing requirements.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-8 text-center text-zinc-400 text-sm border-t border-zinc-900">
        &copy; {new Date().getFullYear()} SOL Tutor.AI. Powered by Gemini.
      </footer>
    </div>
  );
}
