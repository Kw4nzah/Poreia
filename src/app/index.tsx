import { Onboarding } from '../screens/Onboarding';
import { Today } from '../screens/Today';
import { useSettings } from '../settings/SettingsProvider';

export default function Home() {
  const { settings } = useSettings();
  return settings.onboarded ? <Today /> : <Onboarding />;
}
