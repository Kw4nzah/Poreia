import { Redirect, useLocalSearchParams } from 'expo-router';
import { isPrayerId } from '../../prayers';
import { PrayerReader } from '../../screens/PrayerReader';

export default function PrayerRoute() {
  const { id, resume } = useLocalSearchParams<{ id: string; resume?: string }>();
  if (!isPrayerId(id)) return <Redirect href="/prayers" />;
  return <PrayerReader id={id} resume={resume === '1'} />;
}
