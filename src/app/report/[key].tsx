import { useLocalSearchParams } from 'expo-router';
import { Report } from '../../screens/Report';

export default function ReportRoute() {
  const { key } = useLocalSearchParams<{ key?: string | string[] }>();
  // An unknown key gets the screen's "not available" page, with a way out.
  return <Report periodKey={Array.isArray(key) ? key[0] : key} />;
}
