// App entry: expo-router as usual, plus the home-screen widget's background task handler.
import 'expo-router/entry';

try {
  // Required lazily so a build without the widget's native module still starts.
  require('./src/widget/taskHandler');
} catch {
  // No widget support in this build; the app itself is unaffected.
}
