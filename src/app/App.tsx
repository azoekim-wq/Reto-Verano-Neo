import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AppShell, type Tab } from './AppShell';
import { DashboardView } from '@/features/dashboard/DashboardView';
import { LeaderboardView } from '@/features/leaderboard/LeaderboardView';
import { ChartsView } from '@/features/charts/ChartsView';
import { ProfileView } from '@/features/profile/ProfileView';
import { AchievementsView } from '@/features/achievements/AchievementsView';
import { RegisterView } from '@/features/register/RegisterView';

export default function App() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [profileId, setProfileId] = useState<string | null>(null);

  function openProfile(id: string) {
    setProfileId(id);
    setTab('perfil');
  }

  return (
    <AppShell tab={tab} onTabChange={setTab}>
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {tab === 'dashboard'  && <DashboardView onOpenProfile={openProfile} />}
          {tab === 'ranking'    && <LeaderboardView onOpenProfile={openProfile} />}
          {tab === 'graficas'   && <ChartsView />}
          {tab === 'perfil'     && <ProfileView participantId={profileId} onBack={() => setTab('ranking')} />}
          {tab === 'logros'     && <AchievementsView />}
          {tab === 'registrar'  && <RegisterView onDone={() => setTab('dashboard')} />}
        </motion.div>
      </AnimatePresence>
    </AppShell>
  );
}
