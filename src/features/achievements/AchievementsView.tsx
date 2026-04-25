import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Award, Check, Trophy, Flame, Target, Zap, Heart, Crown, Medal,
  Mountain, Star, Map, Rocket, Ruler, type LucideIcon,
} from 'lucide-react';
import { Chip } from '@/components/ui/Chip';
import { Avatar } from '@/components/ui/Avatar';
import { listParticipants } from '@/services/participants.service';
import { getAchievementsWithHolders, type AchievementWithHolders } from '@/services/achievements.service';
import { cn } from '@/lib/utils';

const ICONS: Record<string, LucideIcon> = {
  trophy: Trophy, flame: Flame, target: Target, zap: Zap,
  heart: Heart, crown: Crown, medal: Medal, mountain: Mountain,
  star: Star, map: Map, rocket: Rocket, ruler: Ruler, check: Check, award: Award,
};

export function AchievementsView() {
  const [achievements, setAchievements] = useState<AchievementWithHolders[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listParticipants()
      .then((ps) => setAchievements(getAchievementsWithHolders(ps)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const unlocked = achievements.filter((a) => a.holders.length > 0).length;

  return (
    <div>
      <div className="mb-8">
        <Chip className="mb-4"><Award className="w-3 h-3" /> {unlocked} de {achievements.length} logros conseguidos</Chip>
        <h1 className="font-display font-bold text-4xl md:text-5xl tracking-tight leading-none">Logros.</h1>
        <p className="text-zinc-400 mt-2 max-w-lg">Insignias por constancia, progreso y superacion. Ve quien ha conseguido cada una.</p>
      </div>

      {loading && <div className="text-zinc-500 text-center py-20">Cargando logros...</div>}

      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {achievements.map((a, i) => {
            const Icon = ICONS[a.icon] ?? Award;
            const achieved = a.holders.length > 0;
            return (
              <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className={cn('card p-5', !achieved && 'opacity-70')}>
                <div className="flex items-start justify-between mb-3">
                  <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0', achieved ? 'bg-acid' : 'bg-panel2 border border-line')}>
                    <Icon className={cn('w-6 h-6', achieved ? 'text-black' : 'text-zinc-600')} />
                  </div>
                  {achieved && <Chip tone="acid"><Check className="w-3 h-3" /> {a.holders.length} {a.holders.length === 1 ? 'persona' : 'personas'}</Chip>}
                </div>
                <div className="font-display font-bold">{a.name}</div>
                <div className="text-xs text-zinc-500 mt-1 mb-3">{a.description}</div>
                {achieved ? (
                  <div className="flex items-center gap-2 flex-wrap mt-2">
                    {a.holders.map((h) => (
                      <div key={h.userId} className="flex items-center gap-1.5">
                        <Avatar initials={h.name.slice(0, 2).toUpperCase()} color={h.color} size={24} />
                        <span className="text-xs text-zinc-400">{h.name.split(' ')[0]}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-zinc-600 italic">Nadie lo ha conseguido aun</div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
