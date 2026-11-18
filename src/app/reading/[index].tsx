import { Redirect, useLocalSearchParams } from 'expo-router';
import { parseIsoDate } from '../../calendar';
import { ReadingReader } from '../../screens/ReadingReader';

export default function ReadingRoute() {
  // `date` is set when the reading is opened from a day screen; without it the reading is today's.
  const { index, date } = useLocalSearchParams<{ index: string; date?: string }>();
  const n = Number(index);
  if (!Number.isInteger(n) || n < 0) return <Redirect href="/readings" />;
  if (date === undefined) return <ReadingReader index={n} />;
  const day = parseIsoDate(date);
  if (!day) return <Redirect href="/readings" />;
  return <ReadingReader index={n} date={day} />;
}
