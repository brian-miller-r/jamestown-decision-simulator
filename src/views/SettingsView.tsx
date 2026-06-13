import { useState } from 'react';
import { Key, Eye, EyeOff, Check, Trash2, ShieldCheck, ExternalLink } from 'lucide-react';
function maskKey(key: string): string {
  if (!key) return '';
  if (key.length <= 12) return `${key.slice(0, 4)}••••${key.slice(-2)}`;
  return `${key.slice(0, 8)}••••••••••••••••${key.slice(-4)}`;
}

export default function SettingsView() {
  const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [xaiKey, setXaiKey] = useState(() => localStorage.getItem('xai_api_key') || '');
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showXaiKey, setShowXaiKey] = useState(false);
  const [geminiSaveSuccess, setGeminiSaveSuccess] = useState(false);
  const [xaiSaveSuccess, setXaiSaveSuccess] = useState(false);
  const [geminiDirty, setGeminiDirty] = useState(false);
  const [xaiDirty, setXaiDirty] = useState(false);

  const storedGeminiKey = localStorage.getItem('gemini_api_key') || '';
  const storedXaiKey = localStorage.getItem('xai_api_key') || '';
  const isGeminiActive = storedGeminiKey.length > 0;
  const isXaiActive = storedXaiKey.length > 0;

  function handleGeminiChange(val: string) {
    setGeminiKey(val);
    setGeminiDirty(true);
    setGeminiSaveSuccess(false);
  }

  function handleXaiChange(val: string) {
    setXaiKey(val);
    setXaiDirty(true);
    setXaiSaveSuccess(false);
  }

  function handleGeminiSave() {
    localStorage.setItem('gemini_api_key', geminiKey.trim());
    setGeminiDirty(false);
    setGeminiSaveSuccess(true);
    setTimeout(() => setGeminiSaveSuccess(false), 2500);
  }

  function handleXaiSave() {
    localStorage.setItem('xai_api_key', xaiKey.trim());
    setXaiDirty(false);
    setXaiSaveSuccess(true);
    setTimeout(() => setXaiSaveSuccess(false), 2500);
  }

  function handleGeminiClear() {
    localStorage.removeItem('gemini_api_key');
    setGeminiKey('');
    setGeminiDirty(false);
    setGeminiSaveSuccess(false);
  }

  function handleXaiClear() {
    localStorage.removeItem('xai_api_key');
    setXaiKey('');
    setXaiDirty(false);
    setXaiSaveSuccess(false);
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-6 md:p-10">
      <div className="max-w-2xl mx-auto">

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">Settings</h1>
          <p className="text-sm text-zinc-500 mt-1">Configure your simulator preferences</p>
        </div>
        {/* Gemini key card */}
        <div className="bg-zinc-900 rounded-2xl border border-zinc-100 shadow-md overflow-hidden mb-6">

          {/* Card header */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-zinc-100 bg-zinc-50/60">
            <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
              <Key className="w-4 h-4 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-zinc-100">Gemini API Key</p>
              <p className="text-xs text-zinc-500">Powers real-time AI coaching &amp; analysis</p>
            </div>
            {isGeminiActive && (
              <span className="flex items-center gap-1 text-[11px] font-bold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full">
                <ShieldCheck className="w-3 h-3" />
                Active
              </span>
            )}
          </div>

          {/* Card body */}
          <div className="px-6 py-6 space-y-5">

            {/* Current stored key (read-only preview) */}
            {isGeminiActive && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-emerald-800 mb-0.5">Key saved in browser storage</p>
                  <code className="text-xs text-emerald-700 font-mono break-all">{maskKey(storedGeminiKey)}</code>
                </div>
              </div>
            )}

            {/* Description */}
            <p className="text-xs text-zinc-500 leading-relaxed">
              Provide a Gemini API key to enable real-time semantic analysis and Socratic coaching.
              Without a key, the simulator falls back to a local rule-based coaching engine.
              Your key is stored only in your browser's <code className="font-mono bg-zinc-100 px-1 rounded">localStorage</code> and
              never sent to any server other than Google's API.{' '}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-300 font-medium underline underline-offset-2 inline-flex items-center gap-0.5 hover:text-zinc-100"
              >
                Get a free key <ExternalLink className="w-3 h-3" />
              </a>
            </p>

            {/* Input row */}
            <div className="space-y-2">
              <label htmlFor="gemini-api-key" className="text-xs font-semibold text-zinc-300 uppercase tracking-wide">
                {isGeminiActive ? 'Replace key' : 'Enter your key'}
              </label>
              <div className="relative">
                <input
                  id="gemini-api-key"
                  type={showGeminiKey ? 'text' : 'password'}
                  value={geminiKey}
                  onChange={(e) => handleGeminiChange(e.target.value)}
                  placeholder="AIzaSy..."
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full px-4 py-3 pr-11 text-sm border-2 border-zinc-200 rounded-xl focus:border-zinc-500 focus:outline-none font-mono bg-zinc-50 text-zinc-100 placeholder-zinc-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowGeminiKey(!showGeminiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-400 transition-colors"
                  aria-label={showGeminiKey ? 'Hide key' : 'Show key'}
                >
                  {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={handleGeminiSave}
                disabled={!geminiKey.trim() || !geminiDirty}
                className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-5 rounded-xl transition-all duration-200 text-sm shadow-sm"
              >
                {geminiSaveSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    Saved!
                  </>
                ) : (
                  'Save Key'
                )}
              </button>

              {isGeminiActive && (
                <button
                  onClick={handleGeminiClear}
                  className="flex items-center gap-2 text-red-600 hover:bg-red-50 border border-red-200 hover:border-red-300 font-semibold py-2.5 px-5 rounded-xl transition-all duration-200 text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove Key
                </button>
              )}
            </div>
          </div>
        </div>

        {/* xAI key card */}
        <div className="bg-zinc-900 rounded-2xl border border-zinc-100 shadow-md overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-5 border-b border-zinc-100 bg-zinc-50/60">
            <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
              <Key className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-zinc-100">xAI API Key (Optional)</p>
              <p className="text-xs text-zinc-500">Fallback provider for decision-scene image generation</p>
            </div>
            {isXaiActive && (
              <span className="flex items-center gap-1 text-[11px] font-bold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full">
                <ShieldCheck className="w-3 h-3" />
                Active
              </span>
            )}
          </div>

          <div className="px-6 py-6 space-y-5">
            {isXaiActive && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-emerald-800 mb-0.5">xAI key saved in browser storage</p>
                  <code className="text-xs text-emerald-700 font-mono break-all">{maskKey(storedXaiKey)}</code>
                </div>
              </div>
            )}

            <p className="text-xs text-zinc-500 leading-relaxed">
              This key is optional. When present, image generation can fall back to xAI if Gemini image models are unavailable.
              It is stored only in your browser's <code className="font-mono bg-zinc-100 px-1 rounded">localStorage</code>.
            </p>

            <div className="space-y-2">
              <label htmlFor="xai-api-key" className="text-xs font-semibold text-zinc-300 uppercase tracking-wide">
                {isXaiActive ? 'Replace key' : 'Enter your key'}
              </label>
              <div className="relative">
                <input
                  id="xai-api-key"
                  type={showXaiKey ? 'text' : 'password'}
                  value={xaiKey}
                  onChange={(e) => handleXaiChange(e.target.value)}
                  placeholder="xai-..."
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full px-4 py-3 pr-11 text-sm border-2 border-zinc-200 rounded-xl focus:border-zinc-500 focus:outline-none font-mono bg-zinc-50 text-zinc-100 placeholder-zinc-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowXaiKey(!showXaiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-400 transition-colors"
                  aria-label={showXaiKey ? 'Hide key' : 'Show key'}
                >
                  {showXaiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={handleXaiSave}
                disabled={!xaiKey.trim() || !xaiDirty}
                className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-5 rounded-xl transition-all duration-200 text-sm shadow-sm"
              >
                {xaiSaveSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    Saved!
                  </>
                ) : (
                  'Save Key'
                )}
              </button>

              {isXaiActive && (
                <button
                  onClick={handleXaiClear}
                  className="flex items-center gap-2 text-red-600 hover:bg-red-50 border border-red-200 hover:border-red-300 font-semibold py-2.5 px-5 rounded-xl transition-all duration-200 text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove Key
                </button>
              )}
            </div>
          </div>
        </div>
        {/* Footer note */}
        <p className="text-center text-xs text-zinc-400 mt-8">
          VS.3 &amp; VS.4 Aligned · Virginia Standards of Learning
        </p>
      </div>
    </div>
  );
}
