import { DEFAULT_LANGUAGE, Language, pickLanguage } from '../i18n';

interface ErrorText {
  title: string;
  body: string;
  retry: string;
}

// Kept apart from the main dictionaries: the error screen must work even when settings failed to load.
export const ERROR_TEXT: Record<Language, ErrorText> = {
  tr: {
    title: 'Bir şeyler ters gitti',
    body: 'Uygulama beklenmedik bir hatayla karşılaştı. Yeniden denemek çoğu zaman yeterlidir.',
    retry: 'Yeniden dene',
  },
  en: {
    title: 'Something went wrong',
    body: 'The app ran into an unexpected error. Trying again usually helps.',
    retry: 'Try again',
  },
  ru: {
    title: 'Что-то пошло не так',
    body: 'В приложении произошла непредвиденная ошибка. Обычно помогает повторная попытка.',
    retry: 'Повторить',
  },
};

/** Error screen text for the device's preferred languages; English when none is supported. */
export function errorTextFor(preferred: readonly (string | null | undefined)[]): ErrorText {
  return ERROR_TEXT[preferred.length ? pickLanguage(preferred) : DEFAULT_LANGUAGE];
}
