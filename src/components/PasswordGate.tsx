import { useState, useEffect, useRef, type FormEvent } from 'react';
import { Ship, Lock, Eye, EyeOff } from 'lucide-react';

const SESSION_KEY = 'jt_auth';
// Change this value to update the required password
const CORRECT_PASSWORD = 'Jamestown';

interface PasswordGateProps {
  children: React.ReactNode;
}

export default function PasswordGate({ children }: PasswordGateProps) {
  const [unlocked, setUnlocked] = useState(false);
  const [input, setInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY) === '1') {
      setUnlocked(true);
    } else {
      // Focus input once the gate mounts
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, []);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (input === CORRECT_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, '1');
      setUnlocked(true);
    } else {
      setError(true);
      setShaking(true);
      setInput('');
      setTimeout(() => setShaking(false), 600);
      inputRef.current?.focus();
    }
  }

  if (unlocked) return <>{children}</>;

  return (
    <div className="min-h-screen bg-navy-50 flex items-center justify-center px-4">
      {/* Subtle background pattern */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, rgba(30,58,138,0.06) 0%, transparent 60%), radial-gradient(circle at 80% 80%, rgba(30,58,138,0.08) 0%, transparent 60%)',
        }}
      />

      <div
        className={`relative w-full max-w-sm ${shaking ? 'animate-shake' : ''}`}
        style={{ animation: shaking ? 'shake 0.5s ease-in-out' : undefined }}
      >
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl border border-navy-100 px-8 py-10">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-navy-800 text-white flex items-center justify-center shadow-lg mb-4">
              <Ship className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-bold text-navy-900 tracking-tight">Jamestown Simulator</h1>
            <p className="text-xs text-navy-500 mt-1">Classroom Decision Experience</p>
          </div>

          {/* Lock icon + label */}
          <div className="flex items-center gap-2 mb-5">
            <Lock className="w-4 h-4 text-navy-400 shrink-0" />
            <p className="text-sm font-medium text-navy-700">Enter the access password to continue</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="relative mb-2">
              <input
                ref={inputRef}
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  if (error) setError(false);
                }}
                placeholder="Password"
                autoComplete="current-password"
                className={`w-full pr-10 pl-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 outline-none focus:ring-2 ${
                  error
                    ? 'border-red-400 focus:ring-red-200 bg-red-50 text-red-900 placeholder-red-300'
                    : 'border-navy-200 focus:ring-navy-200 focus:border-navy-400 bg-navy-50 text-navy-900 placeholder-navy-400'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-600 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <p className="text-xs text-red-600 font-medium mb-3 pl-1 animate-fade-in">
                Incorrect password. Please try again.
              </p>
            )}

            <button
              type="submit"
              className="w-full mt-3 bg-navy-800 hover:bg-navy-700 active:scale-[0.98] text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg text-sm"
            >
              Unlock
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-navy-400 mt-5">
          Contact your teacher for the password.
        </p>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15%       { transform: translateX(-7px); }
          30%       { transform: translateX(7px); }
          45%       { transform: translateX(-5px); }
          60%       { transform: translateX(5px); }
          75%       { transform: translateX(-3px); }
          90%       { transform: translateX(3px); }
        }
      `}</style>
    </div>
  );
}
