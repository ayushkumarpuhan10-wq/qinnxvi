import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Bell, Droplets, Flame, Sparkles, Timer, Trophy, X } from 'lucide-react';
import { BubblyNotificationItem } from '../../types/workout';

interface BubblyNotificationsProps {
  toasts: BubblyNotificationItem[];
  onDismiss: (id: string) => void;
}

const TONE_STYLES: Record<
  BubblyNotificationItem['tone'],
  { gradient: string; glow: string; icon: React.ReactNode }
> = {
  celebrate: {
    gradient: 'linear-gradient(135deg, rgba(236,72,153,0.92), rgba(249,115,22,0.9))',
    glow: '0 18px 34px -8px rgba(236,72,153,0.58)',
    icon: <Sparkles className="h-4 w-4 text-amber-200" />,
  },
  boost: {
    gradient: 'linear-gradient(135deg, rgba(59,130,246,0.9), rgba(139,92,246,0.92))',
    glow: '0 18px 34px -8px rgba(99,102,241,0.58)',
    icon: <Flame className="h-4 w-4 text-amber-300" />,
  },
  hydration: {
    gradient: 'linear-gradient(135deg, rgba(6,182,212,0.9), rgba(16,185,129,0.9))',
    glow: '0 18px 34px -8px rgba(6,182,212,0.55)',
    icon: <Droplets className="h-4 w-4 text-cyan-100" />,
  },
  timer: {
    gradient: 'linear-gradient(135deg, rgba(139,92,246,0.92), rgba(14,165,233,0.9))',
    glow: '0 18px 34px -8px rgba(139,92,246,0.55)',
    icon: <Timer className="h-4 w-4 text-sky-100" />,
  },
  rank: {
    gradient: 'linear-gradient(135deg, rgba(220,38,38,0.94), rgba(245,158,11,0.9))',
    glow: '0 18px 34px -8px rgba(220,38,38,0.62)',
    icon: <Trophy className="h-4 w-4 text-amber-200" />,
  },
  info: {
    gradient: 'linear-gradient(135deg, rgba(30,34,46,0.95), rgba(56,189,248,0.75))',
    glow: '0 18px 34px -8px rgba(56,189,248,0.42)',
    icon: <Bell className="h-4 w-4 text-sky-200" />,
  },
};

export const BubblyNotifications: React.FC<BubblyNotificationsProps> = ({
  toasts,
  onDismiss,
}) => {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-14 z-50 flex flex-col items-center gap-2 px-4">
      <AnimatePresence>
        {toasts.map((item) => {
          const style = TONE_STYLES[item.tone];
          return (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: -24, scale: 0.78 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.84 }}
              transition={{ type: 'spring', stiffness: 460, damping: 22 }}
              className="pointer-events-auto relative w-full max-w-[356px] overflow-hidden rounded-full border border-white/45 px-3.5 py-2.5 text-white backdrop-blur-xl"
              style={{
                background: style.gradient,
                boxShadow: `${style.glow}, inset 0 1.5px 2px rgba(255,255,255,0.5)`,
              }}
            >
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/35 bg-white/15">
                  {style.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-extrabold tracking-tight text-white">
                    {item.title}
                  </p>
                  <p className="truncate text-[11px] font-medium text-white/90">
                    {item.message}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onDismiss(item.id)}
                  aria-label="Dismiss notification"
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black/20 text-white/80 hover:bg-black/35"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
