import { Redirect, useLocalSearchParams } from 'expo-router';
import { getAvailableLanguages, isLiturgyId } from '../../liturgy/registry';
import { LiturgyReader } from '../../screens/LiturgyReader';

export default function LiturgyRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  if (!isLiturgyId(id) || getAvailableLanguages(id).length === 0) {
    return <Redirect href="/prayers" />;
  }
  return <LiturgyReader id={id} />;
}
