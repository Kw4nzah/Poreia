// English is the reference dictionary: its shape defines `Messages`, so a key missing
// from another language is a type error.

import type {
  ChurchId,
  FastDayId,
  FastLevel,
  FeastId,
  FoodId,
  GreekFishPractice,
  MajorFastId,
  NoteId,
  PeriodId,
} from '../calendar';
import type { ReadingGroupId } from '../commemorations';
import type { PrayerGroupId, PrayerId, PrayerText } from '../prayers';
import { prayerTexts } from './prayers/en';

export interface Messages {
  /** Name of the language in the language itself. */
  languageName: string;
  /** Sunday first, matching the engine's `Weekday`. */
  weekdays: readonly string[];
  /** Month names in the form used after a day number. */
  months: readonly string[];
  date: (day: number, month: string, year: number) => string;
  dayMonth: (day: number, month: string) => string;

  onboarding: {
    tagline: string;
    languageTitle: string;
    nameTitle: string;
    nameHint: string;
    namePlaceholder: string;
    churchTitle: string;
    churchHint: string;
    next: string;
    back: string;
    start: string;
  };
  church: Record<ChurchId, { name: string; calendar: string }>;

  tabs: { today: string; readings: string };

  today: {
    greeting: (name: string) => string;
    churchDate: (date: string) => string;
    feast: string;
    dayOf: (day: number, total: number) => string;
    daysLeft: (days: number) => string;
    lastDay: string;
    upcomingTitle: string;
    startsIn: (days: number) => string;
    daysToPascha: (days: number) => string;
    disclaimer: string;
    settings: string;
    newVersion: string;
  };

  settings: {
    title: string;
    back: string;
    name: string;
    church: string;
    fishTitle: string;
    fishHint: string;
    fish: Record<GreekFishPractice, { title: string; subtitle: string }>;
    language: string;
    updatesTitle: string;
    version: (version: string) => string;
    apkAvailable: (version: string) => string;
    /** Release time of the content bundle that is running. */
    contentUpdated: (when: string) => string;
    /** No downloaded update yet: the bundle that shipped inside the APK. */
    contentShipped: string;
    apkInstall: (megabytes: number) => string;
    apkDownloading: string;
    apkFailed: string;
    notificationsTitle: string;
    notificationsToggle: string;
    notificationsTime: string;
    notificationsDenied: string;
    /** Name of the notification category in the phone's settings. */
    notificationsChannel: string;
  };

  period: Record<PeriodId, string>;
  majorFast: Record<MajorFastId, string>;
  fastDay: Record<FastDayId, string>;
  feast: Record<FeastId, string>;
  level: Record<FastLevel, { title: string; detail: string }>;
  food: Record<FoodId, string>;
  note: Record<NoteId, string>;

  prayers: {
    title: string;
    /** One line under the title on the Today card. */
    summary: string;
    smaller: string;
    larger: string;
    group: Record<PrayerGroupId, string>;
    text: Record<PrayerId, PrayerText>;
  };

  readings: {
    title: string;
    saints: string;
    readings: string;
    more: (count: number) => string;
    /** Saint and feast names come from an English-only source. */
    namesEnglish: string;
    noData: string;
    epistle: string;
    gospel: string;
    group: Record<ReadingGroupId, string>;
  };

  updates: {
    check: string;
    disabled: string;
    checking: string;
    upToDate: string;
    downloading: string;
    failed: string;
  };
}

function plural(n: number, one: string, many: string): string {
  return n === 1 ? one : many;
}

export const en: Messages = {
  languageName: 'English',
  weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  months: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  date: (day, month, year) => `${day} ${month} ${year}`,
  dayMonth: (day, month) => `${day} ${month}`,

  onboarding: {
    tagline: 'A companion for the fasts of the Church',
    languageTitle: 'Choose your language',
    nameTitle: 'What should we call you?',
    nameHint: 'Only used to greet you. It stays on this phone.',
    namePlaceholder: 'Your name',
    churchTitle: 'Which tradition do you follow?',
    churchHint: 'This sets the calendar and the fasting customs.',
    next: 'Continue',
    back: 'Back',
    start: 'Begin',
  },
  church: {
    greek: { name: 'Greek tradition', calendar: 'New calendar' },
    russian: { name: 'Russian tradition', calendar: 'Old (Julian) calendar' },
  },

  tabs: { today: 'Today', readings: 'Readings' },

  today: {
    greeting: (name) => (name ? `Peace to you, ${name}` : 'Peace to you'),
    churchDate: (date) => `Church calendar: ${date}`,
    feast: 'Feast',
    dayOf: (day, total) => `Day ${day} of ${total}`,
    daysLeft: (days) => `${days} ${plural(days, 'day', 'days')} left`,
    lastDay: 'Last day',
    upcomingTitle: 'Next fast',
    startsIn: (days) => (days === 1 ? 'Starts tomorrow' : `Starts in ${days} days`),
    daysToPascha: (days) => `${days} ${plural(days, 'day', 'days')} to Pascha`,
    disclaimer:
      'General guidance from the parish calendars. Local custom and the advice of your spiritual father come first. Allowances on saints’ days are only partly included.',
    settings: 'Settings',
    newVersion: 'A new version is ready to install',
  },

  settings: {
    title: 'Settings',
    back: 'Back',
    name: 'Name',
    church: 'Tradition',
    fishTitle: 'Fish in the Nativity and Apostles’ Fasts',
    fishHint: 'Greek sources differ. Pick the rule your parish follows.',
    fish: {
      unsure: { title: 'Not sure', subtitle: 'Show the stricter reading and mark disputed days' },
      weekends: { title: 'Weekends only', subtitle: 'Fish on Saturday and Sunday' },
      studite: { title: 'Tuesday, Thursday and weekends', subtitle: 'Studite typikon' },
      greece: { title: 'Every day but Wednesday and Friday', subtitle: 'Church of Greece, GOARCH' },
    },
    language: 'Language',
    updatesTitle: 'Updates',
    version: (version) => `Version ${version}`,
    apkAvailable: (version) => `Version ${version} is available`,
    contentUpdated: (when) => `Content updated ${when}`,
    contentShipped: 'Content as shipped with the app',
    apkInstall: (megabytes) => `Download and install (${megabytes} MB)`,
    apkDownloading: 'Downloading…',
    apkFailed: 'Download failed. Try again later.',
    notificationsTitle: 'Daily notification',
    notificationsToggle: "Today's fast, every morning",
    notificationsTime: 'Time',
    notificationsDenied:
      'Notifications are blocked for Poreia. Allow them in the phone settings, then turn this on again.',
    notificationsChannel: 'Daily fast',
  },

  period: {
    publicanWeek: 'Week of the Publican and the Pharisee',
    cheesefareWeek: 'Cheesefare Week',
    greatLent: 'Great Lent',
    holyWeek: 'Holy Week',
    brightWeek: 'Bright Week',
    trinityWeek: 'Week after Pentecost',
    apostlesFast: "Apostles' Fast",
    dormitionFast: 'Dormition Fast',
    nativityFast: 'Nativity Fast',
    christmastide: 'Christmastide',
  },
  majorFast: {
    greatLent: 'Great Lent',
    apostlesFast: "Apostles' Fast",
    dormitionFast: 'Dormition Fast',
    nativityFast: 'Nativity Fast',
  },
  fastDay: {
    wednesday: 'Wednesday fast',
    friday: 'Friday fast',
    theophanyEve: 'Eve of Theophany',
    beheadingOfJohn: 'Fast of the Beheading of St John',
    exaltationOfCross: 'Fast of the Exaltation of the Cross',
  },
  feast: {
    pascha: 'Holy Pascha',
    palmSunday: 'Palm Sunday',
    lazarusSaturday: 'Lazarus Saturday',
    ascension: 'Ascension of the Lord',
    pentecost: 'Pentecost',
    nativityOfTheotokos: 'Nativity of the Theotokos',
    exaltationOfCross: 'Exaltation of the Holy Cross',
    protectionOfTheotokos: 'Protection of the Theotokos',
    entryOfTheotokos: 'Entry of the Theotokos into the Temple',
    nativityOfChrist: 'Nativity of Christ',
    circumcision: 'Circumcision of the Lord',
    theophany: 'Holy Theophany',
    meetingOfTheLord: 'Meeting of the Lord',
    annunciation: 'Annunciation',
    nativityOfForerunner: 'Nativity of St John the Forerunner',
    peterAndPaul: 'Holy Apostles Peter and Paul',
    transfiguration: 'Transfiguration of the Lord',
    dormition: 'Dormition of the Theotokos',
    beheadingOfJohn: 'Beheading of St John the Forerunner',
  },
  level: {
    none: { title: 'No fasting', detail: 'All foods are allowed today.' },
    noMeat: { title: 'No meat', detail: 'Dairy, eggs and fish are allowed.' },
    fish: { title: 'Fish allowed', detail: 'Fish, wine and oil are allowed.' },
    oil: { title: 'Wine and oil allowed', detail: 'No fish today.' },
    noOil: { title: 'No oil', detail: 'Cooked food prepared without oil.' },
    xerophagy: {
      title: 'Dry eating',
      detail: 'Bread, fruit, vegetables and nuts, without oil.',
    },
  },
  food: {
    meat: 'Meat',
    dairy: 'Dairy and eggs',
    fish: 'Fish',
    oil: 'Wine and oil',
  },
  note: {
    totalAbstinence: 'Those who are able keep a complete fast today.',
    caviarAllowed: 'Fish roe is allowed today.',
    feastRelaxation: 'The fast is lightened for the feast.',
    fishDisputed:
      'Traditions differ on fish today: some allow it, stricter ones do not. Ask your spiritual father.',
    wineOnly: 'Wine is allowed today, but not oil.',
  },

  prayers: {
    title: 'Prayers',
    summary: 'The Lord’s Prayer, the Creed, morning and evening prayers',
    smaller: 'Smaller text',
    larger: 'Larger text',
    group: { basic: 'Basic prayers', daily: 'Prayers of the day' },
    text: prayerTexts,
  },

  readings: {
    title: 'Saints and readings',
    saints: 'Saints of the day',
    readings: 'Readings',
    more: (count) => `+${count} more`,
    namesEnglish: 'Names are shown in English.',
    noData: 'No saints or readings for this year yet.',
    epistle: 'Epistle',
    gospel: 'Gospel',
    group: {
      liturgy: 'Divine Liturgy',
      vespers: 'Vespers',
      matins: 'Matins',
      hours: 'Hours',
      other: 'Other services',
    },
  },

  updates: {
    check: 'Check for updates',
    disabled: 'Updates are off in this build.',
    checking: 'Checking…',
    upToDate: 'You have the latest version.',
    downloading: 'Downloading…',
    failed: 'Update failed. Try again later.',
  },
};
