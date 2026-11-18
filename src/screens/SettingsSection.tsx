// One settings category, opened from the hub at /settings/<section>.

import { Redirect, useLocalSearchParams } from 'expo-router';
import { useSettings } from '../settings/SettingsProvider';
import { BackupSection } from './BackupSection';
import { AboutSection } from './settings/AboutSection';
import { LanguageSection } from './settings/LanguageSection';
import { NotificationsSection } from './settings/NotificationsSection';
import { ProfileSection } from './settings/ProfileSection';
import { SaintsSection } from './settings/SaintsSection';
import { SectionFrame } from './settings/SectionFrame';
import { UpdatesSection } from './settings/UpdatesSection';
import { SectionId, isSectionId, sectionTitle } from './settings/sections';

function Body({ id }: { id: SectionId }) {
  switch (id) {
    case 'profile':
      return <ProfileSection />;
    case 'language':
      return <LanguageSection />;
    case 'notifications':
      return <NotificationsSection />;
    case 'saints':
      return <SaintsSection />;
    case 'backup':
      return <BackupSection />;
    case 'updates':
      return <UpdatesSection />;
    case 'about':
      return <AboutSection />;
  }
}

export function SettingsSection() {
  const { section } = useLocalSearchParams<{ section?: string | string[] }>();
  const { messages: m } = useSettings();
  const id = Array.isArray(section) ? section[0] : section;

  // An unknown address (typo, old link) goes back to the hub instead of showing a blank screen.
  if (!isSectionId(id)) return <Redirect href="/settings" />;

  return (
    <SectionFrame title={sectionTitle(m, id)}>
      <Body id={id} />
    </SectionFrame>
  );
}
