import { Redirect, useLocalSearchParams } from 'expo-router';
import { isPrayerId } from '../../prayers';
import { PrayerReader } from '../../screens/PrayerReader';

export default function PrayerRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  if (!isPrayerId(id)) return <Redirect href="/prayers" />;
  return <PrayerReader id={id} />;
}
