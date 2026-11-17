// Text field whose caret, selection and selection handles use the app's wine colour. Android
// draws those in the system accent (a bright blue) unless told otherwise.

import { TextInput, TextInputProps } from 'react-native';
import { useTheme } from './theme';

export function AppTextInput(props: TextInputProps) {
  const theme = useTheme();
  return (
    <TextInput
      cursorColor={theme.accent}
      selectionColor={theme.accent}
      selectionHandleColor={theme.accent}
      {...props}
    />
  );
}
