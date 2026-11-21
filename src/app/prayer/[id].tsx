import { Redirect, useLocalSearchParams } from 'expo-router';
import { resolvePrayerId } from '../../prayers';
import { PrayerReader } from '../../screens/PrayerReader';

export default function PrayerRoute() {
  const { id, resume } = useLocalSearchParams<{ id: string; resume?: string }>();
  const prayerId = resolvePrayerId(id);
  if (!prayerId) return <Redirect href="/prayers" />;
  return <PrayerReader id={prayerId} resume={resume === '1'} />;
}
