// Height (dp) of the on-screen keyboard, 0 while it is closed. The app draws edge to edge, where
// Android may not shrink the window for the keyboard, so screens with text fields add this much
// space under their scrolling content: the field can always be scrolled above the keyboard.
// (When the window does shrink, the extra space is only some blank room below the last row.)

import { useEffect, useState } from 'react';
import { Keyboard } from 'react-native';

export function useKeyboardHeight(): number {
  const [height, setHeight] = useState(0);
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', (event) =>
      setHeight(Math.max(0, Math.round(event.endCoordinates.height))),
    );
    const hide = Keyboard.addListener('keyboardDidHide', () => setHeight(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  return height;
}
