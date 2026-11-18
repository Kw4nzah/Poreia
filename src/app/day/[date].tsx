import { useLocalSearchParams } from 'expo-router';
import { parseIsoDate } from '../../calendar';
import { DayDetail } from '../../screens/DayDetail';

export default function DayRoute() {
  const { date } = useLocalSearchParams<{ date: string }>();
  // An invalid date gets the screen's empty state, with a way back.
  return <DayDetail date={parseIsoDate(date)} />;
}
