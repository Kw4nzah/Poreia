import { Redirect, useLocalSearchParams } from 'expo-router';
import { ReadingReader } from '../../screens/ReadingReader';

export default function ReadingRoute() {
  const { index } = useLocalSearchParams<{ index: string }>();
  const n = Number(index);
  if (!Number.isInteger(n) || n < 0) return <Redirect href="/day" />;
  return <ReadingReader index={n} />;
}
