import { Redirect } from 'expo-router';
import { Onboarding } from '../screens/Onboarding';
import { useSettings } from '../settings/SettingsProvider';

// First-run questions have no tab bar; once they are done the app lives in the tabs.
export default function Home() {
  const { settings } = useSettings();
  return settings.onboarded ? <Redirect href="/today" /> : <Onboarding />;
}
