import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

const SEVEN_MINUTES = 7 * 60;

export default function Timer({ startedAt, finished }: { startedAt: number; finished: boolean }) {
  const [remaining, setRemaining] = useState(SEVEN_MINUTES);

  useEffect(() => {
    if (finished) return;
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      setRemaining(Math.max(0, SEVEN_MINUTES - elapsed));
    }, 1000);
    return () => clearInterval(interval);
  }, [startedAt, finished]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const pct = (remaining / SEVEN_MINUTES) * 100;
  const urgent = remaining <= 60;

  return (
    <div className={`flex items-center gap-2 text-sm font-semibold ${urgent ? 'text-red-600' : 'text-navy-700'}`}>
      <Clock className="w-4 h-4" />
      <span>{minutes}:{String(seconds).padStart(2, '0')}</span>
      <div className="w-20 h-2 rounded-full bg-navy-100 overflow-hidden ml-1">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${urgent ? 'bg-red-500' : 'bg-navy-600'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
