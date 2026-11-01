import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Coins, Star, Trophy, Sparkles } from 'lucide-react';
import { playKitestSound } from './KitestEmblem';

export interface ScoreRewardEvent {
  id: string;
  type: 'points' | 'coins' | 'stars' | 'level';
  amount: number;
  label?: string;
  x?: number;
  y?: number;
}

// Global dispatcher so any component can trigger floating score celebrations
export function triggerScoreReward(
  arg1: Omit<ScoreRewardEvent, 'id'> | 'points' | 'coins' | 'stars' | 'level',
  amount?: number,
  label?: string,
  x?: number,
  y?: number
) {
  if (typeof window !== 'undefined') {
    let detail: ScoreRewardEvent;
    if (typeof arg1 === 'string') {
      detail = {
        id: `rew_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        type: arg1,
        amount: amount ?? 1,
        label,
        x,
        y,
      };
    } else {
      detail = {
        ...arg1,
        id: `rew_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      };
    }
    window.dispatchEvent(new CustomEvent('kitest:score_reward', { detail }));
  }
}

interface FloatingScoreRewardOverlayProps {
  soundEnabled?: boolean;
}

export const FloatingScoreRewardOverlay: React.FC<FloatingScoreRewardOverlayProps> = ({
  soundEnabled = true,
}) => {
  const [rewards, setRewards] = useState<ScoreRewardEvent[]>([]);

  useEffect(() => {
    const handleEvent = (e: Event) => {
      const customEvent = e as CustomEvent<ScoreRewardEvent>;
      if (!customEvent.detail) return;
      const newReward = customEvent.detail;
      setRewards((prev) => [...prev, newReward]);
      playKitestSound('coin', soundEnabled);

      // Auto remove after animation completes
      setTimeout(() => {
        setRewards((prev) => prev.filter((r) => r.id !== newReward.id));
      }, 2400);
    };

    window.addEventListener('kitest:score_reward', handleEvent);
    return () => window.removeEventListener('kitest:score_reward', handleEvent);
  }, [soundEnabled]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      <AnimatePresence>
        {rewards.map((reward) => {
          const startX = reward.x ?? (typeof window !== 'undefined' ? window.innerWidth / 2 : 300);
          const startY = reward.y ?? (typeof window !== 'undefined' ? window.innerHeight / 2 : 400);

          return (
            <motion.div
              key={reward.id}
              initial={{
                opacity: 0,
                scale: 0.3,
                x: startX - 80,
                y: startY,
              }}
              animate={{
                opacity: [0, 1, 1, 0.9, 0],
                scale: [0.3, 1.35, 1.1, 0.7, 0.2],
                x: [startX - 80, startX - 40, startX - 20, 220, 40],
                y: [startY, startY - 70, startY - 140, 60, 20],
              }}
              transition={{
                duration: 2.1,
                times: [0, 0.2, 0.5, 0.85, 1],
                ease: 'easeInOut',
              }}
              className="absolute flex items-center gap-2 px-4 py-2 rounded-2xl shadow-2xl backdrop-blur-md border font-black text-sm select-none"
              style={{
                background:
                  reward.type === 'points'
                    ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.95), rgba(217, 119, 6, 0.95))'
                    : reward.type === 'coins'
                    ? 'linear-gradient(135deg, rgba(234, 179, 8, 0.95), rgba(202, 138, 4, 0.95))'
                    : reward.type === 'stars'
                    ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.95), rgba(99, 102, 241, 0.95))'
                    : 'linear-gradient(135deg, rgba(16, 185, 129, 0.95), rgba(5, 150, 105, 0.95))',
                borderColor: 'rgba(255, 255, 255, 0.4)',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35), 0 0 20px rgba(245, 158, 11, 0.5)',
                color: '#ffffff',
              }}
            >
              {reward.type === 'points' && <Zap className="w-5 h-5 text-yellow-200 fill-yellow-200 animate-bounce" />}
              {reward.type === 'coins' && <Coins className="w-5 h-5 text-amber-200 animate-spin" />}
              {reward.type === 'stars' && <Star className="w-5 h-5 text-purple-200 fill-purple-200 animate-pulse" />}
              {reward.type === 'level' && <Trophy className="w-5 h-5 text-emerald-200" />}

              <span className="text-base tracking-wide font-mono">
                +{reward.amount} {reward.label || (reward.type === 'points' ? 'Ball' : reward.type === 'coins' ? 'Tanga' : 'Yulduz')}
              </span>

              <Sparkles className="w-4 h-4 text-white/80 animate-ping" />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
