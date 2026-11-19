import { describe, expect, it } from 'vitest';
import { LANGUAGES, MESSAGES } from '../i18n';

const getMessages = (language: keyof typeof MESSAGES) => MESSAGES[language];
import { SAINT_TOPICS } from './saintTopics';
import { GENDER_VARIANTS, applyGender, guessSaintGender } from './saintGender';

describe('guessSaintGender', () => {
  it('knows common female names in Latin, Cyrillic and Turkish spellings', () => {
    for (const name of ['Maria', 'Meryem', 'Мария', 'Ekaterina', 'Ksenia', 'Paraskevi', 'ANNA']) {
      expect(guessSaintGender(name), name).toBe('f');
    }
    expect(guessSaintGender('Ирина')).toBe('f');
    expect(guessSaintGender('  Elisaveta of Russia')).toBe('f');
  });

  it('ignores diacritics and case', () => {
    expect(guessSaintGender('ÉLÉNA')).toBe('f');
    expect(guessSaintGender('ekaterína')).toBe('f');
    expect(guessSaintGender('Фотиния')).toBe('f');
    expect(guessSaintGender('Светлана')).toBe('f');
  });

  it('keeps male names that look female male', () => {
    for (const name of ['Nikita', 'Ilya', 'Илья', 'Luka', 'Luke', 'Лука', 'Savva', 'Foma']) {
      expect(guessSaintGender(name), name).toBe('m');
    }
  });

  it('skips a leading title and honours a female one', () => {
    expect(guessSaintGender('St Nikita')).toBe('m');
    expect(guessSaintGender('Saint Maria')).toBe('f');
    expect(guessSaintGender('Святая Анна')).toBe('f');
    expect(guessSaintGender('Azize Meryem')).toBe('f');
  });

  it('returns null when unsure, and never from endings alone', () => {
    for (const name of ['', '  ', 'Nicholas', 'Seraphim of Sarov', 'Xyza', 'Николай', 'St']) {
      expect(guessSaintGender(name), name).toBeNull();
    }
  });
});

describe('applyGender', () => {
  const messages = LANGUAGES.map((language) => ({ language, m: getMessages(language) }));

  it('leaves the male text untouched', () => {
    for (const { language, m } of messages) {
      for (const id of SAINT_TOPICS) {
        const text = m.saints.topics[id].prayer;
        expect(applyGender(text, 'm', language)).toBe(text);
      }
    }
  });

  it('leaves no markers except {name}, for every topic and gender', () => {
    for (const { language, m } of messages) {
      for (const id of SAINT_TOPICS) {
        for (const gender of ['m', 'f'] as const) {
          const text = applyGender(m.saints.topics[id].prayer, gender, language)
            .split('{name}')
            .join('X');
          expect(text, `${language} ${id} ${gender}`).not.toMatch(/[{}]/);
        }
      }
    }
  });

  it('leaves no masculine form from the table in the female text', () => {
    for (const { language, m } of messages) {
      for (const id of SAINT_TOPICS) {
        const female = applyGender(m.saints.topics[id].prayer, 'f', language);
        for (const [male] of GENDER_VARIANTS[language] ?? []) {
          expect(female, `${language} ${id}`).not.toContain(male);
        }
      }
    }
  });

  it('makes the Russian and Turkish prayers feminine', () => {
    const ru = applyGender(getMessages('ru').saints.topics.health.prayer, 'f', 'ru');
    expect(ru).toContain(
      'О святая {name}, верная служительница Христова и предстоящая перед Богом',
    );
    expect(ru).toContain('Святая {name}, моли Бога обо мне.');
    expect(ru).not.toMatch(/[Сс]вятой {name}/);
    const tr = applyGender(getMessages('tr').saints.topics.health.prayer, 'f', 'tr');
    expect(tr).toContain('huzurunda duran azize!');
  });

  it('does not change English', () => {
    const text = getMessages('en').saints.topics.health.prayer;
    expect(applyGender(text, 'f', 'en')).toBe(text);
  });

  it('has a feminine Russian invocation that agrees', () => {
    const f = getMessages('ru').saints.invocation('Анна', 'f');
    expect(f).toContain('святая угодница Божия Анна');
    expect(f).toContain('скорой помощнице и молитвеннице');
    expect(f).not.toMatch(/святый|угодниче|помощнику|молитвеннику/);
    expect(getMessages('ru').saints.invocation('Николай', 'm')).toContain('святый угодниче');
  });
});
