import React, { useState } from 'react';
import { ArrowRight, KeyRound, ShieldAlert } from 'lucide-react';
import { GlassInput } from '../components/glass/GlassInput';
import { GlassButton } from '../components/glass/GlassButton';
import { LiquidGlass } from '../components/glass/LiquidGlass';

interface LockScreenProps {
  onUnlock: (code: string) => boolean;
  darkSurface: boolean;
  onOpenShowcase: () => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({
  onUnlock,
  darkSurface,
  onOpenShowcase,
}) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = () => {
    const ok = onUnlock(code);
    if (!ok) {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 460);
    } else {
      setError(false);
    }
  };

  return (
    <div className="flex min-h-[760px] flex-col justify-between px-6 py-10">
      <div className="flex items-center justify-between">
        <span
          className={`text-xs font-semibold tracking-wider uppercase ${
            darkSurface ? 'text-white/55' : 'text-[#5a606e]'
          }`}
        >
          local access gate
        </span>
        <button
          type="button"
          onClick={onOpenShowcase}
          className={`text-xs font-semibold underline underline-offset-4 ${
            darkSurface ? 'text-white/75' : 'text-[#2c303b]'
          }`}
        >
          ui showcase
        </button>
      </div>

      <div className="my-auto space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1
              className={`text-[44px] font-extrabold tracking-[-0.05em] leading-none lowercase ${
                darkSurface ? 'text-white' : 'text-[#111318]'
              }`}
            >
              qinxvi
            </h1>
            <p className={`mt-2 text-sm ${darkSurface ? 'text-white/65' : 'text-[#555b69]'}`}>
              Enter access code to unlock your weekly training system.
            </p>
          </div>

          <LiquidGlass variant="cyan" shape="diamond" className="h-14 w-14 shrink-0">
            <div className="flex h-full items-center justify-center">
              <KeyRound className="h-5 w-5 text-sky-200" />
            </div>
          </LiquidGlass>
        </div>

        <LiquidGlass
          variant="primary"
          shape="arch"
          errorGlow={error}
          className={`p-5 ${shake ? 'animate-lg-shake' : ''}`}
        >
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs font-medium text-white/70">Vault portal · Session unlock</span>
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
          </div>

          <GlassInput
            value={code}
            onChange={(val) => {
              setCode(val);
              if (error) setError(false);
            }}
            onSubmit={handleSubmit}
            placeholder="Enter code (QINXVI)"
            rightIcon={<ArrowRight className="h-5 w-5" />}
            error={error}
            autoFocus
          />

          {error && (
            <div className="mt-3 flex items-center gap-2 text-xs font-medium text-[#ff8fa3]">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>Invalid code. Try QINXVI (case-insensitive).</span>
            </div>
          )}

          <div className="mt-5">
            <GlassButton
              label="Unlock QINXVI"
              variant="secondary"
              haptic="double"
              fullWidth
              onClick={handleSubmit}
            />
          </div>
        </LiquidGlass>
      </div>

      <p className={`text-center text-[11px] ${darkSurface ? 'text-white/40' : 'text-[#6e7484]'}`}>
        Offline SQLite/AsyncStorage architecture · Zero cloud dependencies
      </p>
    </div>
  );
};
