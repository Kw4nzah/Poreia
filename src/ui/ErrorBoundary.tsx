import { getLocales } from 'expo-localization';
import { Component, ErrorInfo, ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { saveLastError } from '../support/lastError';
import { errorTextFor } from './errorText';
import { SERIF, radius, space, useTheme, type } from './theme';

function deviceText() {
  try {
    return errorTextFor(getLocales().map((locale) => locale.languageCode));
  } catch {
    return errorTextFor([]);
  }
}

function Fallback({ onRetry }: { onRetry: () => void }) {
  const theme = useTheme();
  const text = deviceText();
  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.ink }]}>{text.title}</Text>
      <Text style={[styles.body, { color: theme.muted }]}>{text.body}</Text>
      <Pressable
        onPress={onRetry}
        accessibilityRole="button"
        style={[styles.button, { backgroundColor: theme.accent }]}
      >
        <Text style={[styles.buttonText, { color: theme.onAccent }]}>{text.retry}</Text>
      </Pressable>
    </View>
  );
}

/** Catches render crashes anywhere below it and offers a retry instead of a blank app. */
export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Release builds log nothing: an error message or component stack could carry the user's
    // name or saints, and logcat can be read by other tools. The fallback screen shows no details.
    if (__DEV__) console.error(error, info.componentStack);
    // Kept on the phone only (name and a short cleaned message); attached to a report on request.
    void saveLastError(error);
  }

  render() {
    if (this.state.failed) return <Fallback onRetry={() => this.setState({ failed: false })} />;
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.lg },
  title: { fontFamily: SERIF, ...type.title2, textAlign: 'center', marginBottom: space.sm },
  body: { ...type.body, textAlign: 'center', marginBottom: space.lg },
  button: { paddingHorizontal: space.lg, paddingVertical: space.md, borderRadius: radius.pill },
  buttonText: { ...type.body, fontWeight: '600' },
});
