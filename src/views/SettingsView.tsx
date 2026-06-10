import { useState } from 'react';
import { Key, Eye, EyeOff, Check, Trash2, ShieldCheck, ExternalLink } from 'lucide-react';

export default function SettingsView() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [showKey, setShowKey] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [dirty, setDirty] = useState(false);

  const storedKey = localStorage.getItem('gemini_api_key') || '';
  const isActive = storedKey.length > 0;

  function handleChange(val: string) {
    setApiKey(val);
    setDirty(true);
    setSaveSuccess(false);
  }

  function handleSave() {
    localStorage.setItem('gemini_api_key', apiKey.trim());
    setDirty(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  }

  function handleClear() {
    localStorage.removeItem('gemini_api_key');
    setApiKey('');
    setDirty(false);
    setSaveSuccess(false);
  }

  const maskedKey = storedKey
    ? storedKey.slice(0, 8) + '••••••••••••••••' + storedKey.slice(-4)
    : '';

  return (
    <div className="min-h-screen bg-navy-50 p-6 md:p-10">
      <div className="max-w-2xl mx-auto">

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-navy-900">Settings</h1>
          <p className="text-sm text-navy-500 mt-1">Configure your simulator preferences</p>
        </div>

        {/* API Key card */}
        <div className="bg-white rounded-2xl border border-navy-100 shadow-md overflow-hidden">

          {/* Card header */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-navy-100 bg-navy-50/60">
            <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
              <Key className="w-4 h-4 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-navy-900">Gemini API Key</p>
              <p className="text-xs text-navy-500">Powers real-time AI coaching &amp; analysis</p>
            </div>
            {isActive && (
              <span className="flex items-center gap-1 text-[11px] font-bold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full">
                <ShieldCheck className="w-3 h-3" />
                Active
              </span>
            )}
          </div>

          {/* Card body */}
          <div className="px-6 py-6 space-y-5">

            {/* Current stored key (read-only preview) */}
            {isActive && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-emerald-800 mb-0.5">Key saved in browser storage</p>
                  <code className="text-xs text-emerald-700 font-mono break-all">{maskedKey}</code>
                </div>
              </div>
            )}

            {/* Description */}
            <p className="text-xs text-navy-500 leading-relaxed">
              Provide a Gemini API key to enable real-time semantic analysis and Socratic coaching.
              Without a key, the simulator falls back to a local rule-based coaching engine.
              Your key is stored only in your browser's <code className="font-mono bg-navy-100 px-1 rounded">localStorage</code> and
              never sent to any server other than Google's API.{' '}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-navy-700 font-medium underline underline-offset-2 inline-flex items-center gap-0.5 hover:text-navy-900"
              >
                Get a free key <ExternalLink className="w-3 h-3" />
              </a>
            </p>

            {/* Input row */}
            <div className="space-y-2">
              <label htmlFor="gemini-api-key" className="text-xs font-semibold text-navy-700 uppercase tracking-wide">
                {isActive ? 'Replace key' : 'Enter your key'}
              </label>
              <div className="relative">
                <input
                  id="gemini-api-key"
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => handleChange(e.target.value)}
                  placeholder="AIzaSy..."
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full px-4 py-3 pr-11 text-sm border-2 border-navy-200 rounded-xl focus:border-navy-500 focus:outline-none font-mono bg-navy-50 text-navy-900 placeholder-navy-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-600 transition-colors"
                  aria-label={showKey ? 'Hide key' : 'Show key'}
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={handleSave}
                disabled={!apiKey.trim() || !dirty}
                className="flex items-center gap-2 bg-navy-800 hover:bg-navy-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-5 rounded-xl transition-all duration-200 text-sm shadow-sm"
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    Saved!
                  </>
                ) : (
                  'Save Key'
                )}
              </button>

              {isActive && (
                <button
                  onClick={handleClear}
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
        <p className="text-center text-xs text-navy-400 mt-8">
          VS.3 &amp; VS.4 Aligned · Virginia Standards of Learning
        </p>
      </div>
    </div>
  );
}
