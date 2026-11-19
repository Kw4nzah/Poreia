import { describe, expect, it } from "vitest";
import type { FeastId } from "../calendar";
import { LANGUAGES, MESSAGES } from "../i18n";
import {
  ENGLISH_FALLBACK_NOTE,
  englishFeastFallback,
} from "../i18n/prayers/feastsEn";
import { searchPrayers } from "./search";
import {
  FEAST_PRAYER_IDS,
  FeastPrayerId,
  PRAYER_GROUPS,
  PRAYER_IDS,
  isFeastPrayerId,
  isPrayerId,
} from ".";

// Compile-time: fails to build when a feast of the calendar has no prayer id.
type EveryFeastHasPrayer = FeastId extends FeastPrayerId ? true : never;
const everyFeastHasPrayer: EveryFeastHasPrayer = true;

const FEAST_IDS: readonly FeastId[] = [
  "pascha",
  "palmSunday",
  "lazarusSaturday",
  "ascension",
  "pentecost",
  "nativityOfTheotokos",
  "exaltationOfCross",
  "protectionOfTheotokos",
  "entryOfTheotokos",
  "nativityOfChrist",
  "circumcision",
  "theophany",
  "meetingOfTheLord",
  "annunciation",
  "nativityOfForerunner",
  "peterAndPaul",
  "transfiguration",
  "dormition",
  "beheadingOfJohn",
];

describe("feast prayer ids", () => {
  it("cover exactly the feasts of the calendar, each once", () => {
    expect(everyFeastHasPrayer).toBe(true);
    expect([...FEAST_PRAYER_IDS].sort()).toEqual([...FEAST_IDS].sort());
    expect(new Set(FEAST_PRAYER_IDS).size).toBe(FEAST_PRAYER_IDS.length);
  });

  it("are valid prayer ids, listed once in the feasts group and nowhere else", () => {
    const feasts = PRAYER_GROUPS.find((group) => group.id === "feasts");
    expect(feasts?.prayers).toEqual(FEAST_PRAYER_IDS);
    for (const id of FEAST_PRAYER_IDS) {
      expect(isPrayerId(id)).toBe(true);
      expect(isFeastPrayerId(id)).toBe(true);
    }
    expect(new Set(PRAYER_IDS).size).toBe(PRAYER_IDS.length);
    expect(isFeastPrayerId("creed")).toBe(false);
    expect(isFeastPrayerId("nope")).toBe(false);
  });
});

describe.each(LANGUAGES)("feast prayer texts (%s)", (language) => {
  const m = MESSAGES[language];

  it("has a troparion and a kontakion for every feast", () => {
    for (const id of FEAST_PRAYER_IDS) {
      const prayer = m.prayers.text[id];
      expect(prayer.title, id).toBe(m.feast[id]);
      expect(prayer.sections, id).toHaveLength(2);
      for (const section of prayer.sections) {
        expect(section.heading?.trim(), id).toBeTruthy();
        expect(section.paragraphs.length, id).toBeGreaterThan(0);
        for (const paragraph of section.paragraphs) {
          expect(paragraph.trim().length, id).toBeGreaterThan(20);
          expect(paragraph, id).not.toMatch(/[́{}]|undefined|\s\/\s|\/\//);
        }
      }
    }
  });

  it("has the group name and the button label", () => {
    expect(m.prayers.group.feasts.trim()).not.toBe("");
    expect(m.prayers.readFeastPrayers.trim()).not.toBe("");
  });

  it("is found by searching for a feast name", () => {
    const id: FeastPrayerId = "dormition";
    const found = searchPrayers(m.feast[id], PRAYER_IDS, m.prayers.text);
    expect(found).toContain(id);
  });
});

describe("English feast hymns", () => {
  const fallback: readonly string[] = englishFeastFallback;

  it("are public-domain texts or an explicit Russian fallback, never both", () => {
    for (const id of FEAST_PRAYER_IDS) {
      const en = MESSAGES.en.prayers.text[id];
      const ru = MESSAGES.ru.prayers.text[id];
      if (fallback.includes(id)) {
        expect(en.note, id).toBe(ENGLISH_FALLBACK_NOTE);
        expect(en.sections, id).toEqual(ru.sections);
      } else {
        expect(en.note, id).toBeUndefined();
        expect(en.sections, id).not.toEqual(ru.sections);
      }
    }
    expect(new Set(fallback).size).toBe(fallback.length);
    for (const id of fallback) expect(isFeastPrayerId(id), id).toBe(true);
  });

  it("keep the 1906 wording (thee, thy) and none of the modern OCA wording", () => {
    for (const id of FEAST_PRAYER_IDS) {
      if (fallback.includes(id)) continue;
      const text = MESSAGES.en.prayers.text[id].sections
        .flatMap((section) => section.paragraphs)
        .join(" ");
      expect(text, id).toMatch(/\b(thee|thy|thou|thine)\b/i);
      expect(text, id).not.toMatch(/\b(You|Your|Yours)\b/);
    }
  });
});

describe("unreviewed translation note", () => {
  it("is shown on every Turkish feast prayer and on nothing else", () => {
    const note = "Türkçe metin çeviridir ve gözden geçirilmektedir.";
    for (const id of PRAYER_IDS) {
      const expected = isFeastPrayerId(id) ? note : undefined;
      expect(MESSAGES.tr.prayers.text[id].note, id).toBe(expected);
      expect(MESSAGES.ru.prayers.text[id].note, id).toBeUndefined();
    }
  });

  it("keeps the Turkish hymns free of Protestant wording", () => {
    for (const id of FEAST_PRAYER_IDS) {
      const text = MESSAGES.tr.prayers.text[id].sections
        .flatMap((section) => section.paragraphs)
        .join(" ");
      expect(text, id).not.toMatch(/esenlik|peder\b|şan\b|\bTanrı/i);
    }
  });
});
