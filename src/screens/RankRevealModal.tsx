import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Award, Flame, Shield, Skull } from 'lucide-react';
import { GlassButton } from '../components/glass/GlassButton';
import { LiquidGlass } from '../components/glass/LiquidGlass';
import { RANK_THEMES, RankTier } from '../theme/tokens';
import { triggerHaptic } from '../utils/feedback';

interface RankRevealModalProps {
  rank: RankTier;
  missedCount: number;
  completionPct: number;
  streak: number;
  onClose: () => void;
}

export const RankRevealModal: React.FC<RankRevealModalProps> = ({
  rank,
  missedCount,
  completionPct,
  streak,
  onClose,
}) => {
  const theme = RANK_THEMES[rank];
  const isDemon = rank === 'DEMON';

  useEffect(() => {
    triggerHaptic(rank === 'DEMON' ? 'rankReveal' : 'celebrate');
  }, [rank]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-5 backdrop-blur-xl"
    >
      {/* Confetti Glow Burst for DEMON rank */}
      {isDemon && (
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          {Array.from({ length: 18 }).map((_, i) => (
            <motion.span
              key={i}
              initial={{
                opacity: 0,
                scale: 0.4,
                x: '50vw',
                y: '45vh',
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0.5, 1.4, 0.8],
                x: `${10 + ((i * 47) % 80)}vw`,
                y: `${8 + ((i * 31) % 80)}vh`,
              }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                delay: i * 0.08,
                ease: 'easeOut',
              }}
              className="absolute h-3 w-3 rounded-full blur-[1px]"
              style={{
                background: i % 2 === 0 ? '#FF2A4D' : '#FBBF24',
                boxShadow: '0 0 18px currentColor',
              }}
            />
          ))}
        </div>
      )}

      <motion.div
        initial={{ scale: 0.82, y: 24, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 24 }}
        className="w-full max-w-[360px]"
      >
        <LiquidGlass shape="squircle" active className="p-6 text-center">
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: theme.gradient, boxShadow: theme.shadow }}
          />
          <div className="relative z-10 flex flex-col items-center pt-2">
            <LiquidGlass
              variant={rank === 'DEMON' ? 'secondary' : 'primary'}
              shape="diamond"
              priority={rank === 'DEMON' ? 'R' : rank === 'BEAST' ? 'B' : undefined}
              className="h-20 w-20"
            >
              <div className="flex h-full items-center justify-center">
                {rank === 'DEMON' ? (
                  <Skull className="h-9 w-9 text-[#FF2A4D]" />
                ) : rank === 'BEAST' ? (
                  <Flame className="h-9 w-9 text-amber-400" />
                ) : (
                  <Shield className="h-9 w-9 text-slate-300" />
                )}
              </div>
            </LiquidGlass>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-white/65">
              End-of-Day Rank
            </p>
            <h2
              className="mt-1 text-[44px] font-black tracking-tight leading-none text-white"
              style={{ textShadow: `0 0 28px ${theme.accent}` }}
            >
              {theme.title}
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-white/80">{theme.subtitle}</p>

            <div className="mt-5 grid w-full grid-cols-3 gap-2 rounded-2xl border border-white/15 bg-black/35 p-3">
              <div>
                <p className="text-[10px] text-white/55">Completion</p>
                <p className="text-sm font-bold text-white tabular-nums">{completionPct}%</p>
              </div>
              <div>
                <p className="text-[10px] text-white/55">Missed</p>
                <p className="text-sm font-bold text-white tabular-nums">{missedCount}</p>
              </div>
              <div>
                <p className="text-[10px] text-white/55">Streak</p>
                <p className="flex items-center justify-center gap-1 text-sm font-bold text-white tabular-nums">
                  <Award className="h-3.5 w-3.5 text-amber-300" />
                  {streak}d
                </p>
              </div>
            </div>

            <div className="mt-6 w-full">
              <GlassButton label="Continue" variant="primary" fullWidth onClick={onClose} />
            </div>
          </div>
        </LiquidGlass>
      </motion.div>
    </motion.div>
  );
};
