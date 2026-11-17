// English is the reference dictionary: its shape defines `Messages`, so a key missing
// from another language is a type error.

import type { SaintTopicId } from '../prayers/saintTopics';
import type { ParsedService } from '../commemorations/service';
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
    projectLink: string;
    apkInstall: (megabytes: number) => string;
    apkDownloading: string;
    apkFailed: string;
    notificationsTitle: string;
    notificationsToggle: string;
    notificationRepeat: string;
    notificationRepeatHint: string;
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
    searchPlaceholder: string;
    noResults: string;
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
    textEnglish: string;
    openBible: string;
    service: (service: ParsedService) => string;
    noData: string;
    share: string;
    shareSaints: string;
    shareReadings: string;
    epistle: string;
    gospel: string;
    group: Record<ReadingGroupId, string>;
  };

  saints: {
    title: string;
    hint: string;
    namePlaceholder: string;
    topicLabel: string;
    topicNone: string;
    /** `prayer` is written by the app's author per topic; `{name}` stands for the saint's name. Empty = only the topic is shown. */
    topics: Record<SaintTopicId, { label: string; prayer: string }>;
    add: string;
    remove: string;
    full: string;
    heading: string;
    /** The prayer asking a saint for intercession; `name` is what the user typed. */
    invocation: (name: string) => string;
  };
  sources: {
    title: string;
    sections: readonly { heading: string; body: string }[];
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
    projectLink: 'Project on GitHub',
    apkInstall: (megabytes) => `Download and install (${megabytes} MB)`,
    apkDownloading: 'Downloading…',
    apkFailed: 'Download failed. Try again later.',
    notificationsTitle: 'Daily notification',
    notificationsToggle: "Today's fast, every morning",
    notificationRepeat: 'Keep reminding me until I open the app',
    notificationRepeatHint: 'If the notification goes unseen or is swiped away, it comes again every 5 minutes, up to 6 times. Opening the app stops it for that day.',
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
    searchPlaceholder: 'Search prayers',
    noResults: 'No prayer found.',
    group: { basic: 'Basic prayers', daily: 'Prayers of the day', lent: 'Great Lent' },
    text: prayerTexts,
  },

  readings: {
    title: 'Saints and readings',
    saints: 'Saints of the day',
    readings: 'Readings',
    more: (count) => `+${count} more`,
    namesEnglish: 'Names are shown in English.',
    textEnglish: 'No text in this language yet, English is shown.',
    openBible: 'Open in YouVersion (RSV Catholic Interconfessional)',
    service: (service) => {
      const ord = (n: number) => (n === 1 ? '1st' : n === 2 ? '2nd' : n === 3 ? '3rd' : n + 'th');
      const part = service.part ? service.part.charAt(0).toUpperCase() + service.part.slice(1) : '';
      const at = service.n ? ord(service.n) + ' ' : '';
      switch (service.kind) {
        case 'vespers':
          return part ? 'Vespers ' + part : 'Vespers';
        case 'matins':
          return at + 'Matins' + (part ? ' ' + part : '');
        case 'hour':
          return at + 'Hour' + (part ? ', ' + part : '');
        case 'passion':
          return at + 'Passion Gospel';
        case 'waters':
          return 'Great Blessing of Waters';
        case 'cross':
          return 'Cross Procession';
      }
    },
    noData: 'No saints or readings for this year yet.',
    share: 'Share',
    shareSaints: 'Saints of the day',
    shareReadings: 'Readings',
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

  saints: {
    title: 'My saints',
    hint: 'Saints you turn to. They are named in the morning and evening prayers. Enter the name only, for example Nicholas, then choose what you ask help for.',
    namePlaceholder: 'Saint’s name',
    add: 'Add',
    remove: 'Remove',
    full: 'Ten saints is the most.',
    heading: 'My saints',
    topicLabel: 'What do you ask for?',
    topicNone: 'No particular request',
    topics: {
      health: { label: 'Health and healing', prayer: 'In the name of the Father, and of the Son, and of the Holy Spirit. Amen.\n\nO holy {name}, faithful servant of Christ and one who stands before God!\n\nI humbly ask you: pray to our Lord Jesus Christ on my behalf. Ask Him to grant me good health, healing of body, peace of soul, patience, and strength.\n\nPray that, in the trials I am facing, I may seek refuge in His mercy, never lose hope in the face of illness, and remain steadfast in faith.\n\nAsk the Lord to grant wisdom to the physicians, bless my treatment, and strengthen me on the path to recovery.\n\nO holy {name}, intercede for me before the Lord, that He may have mercy on me and watch over and protect me according to His holy will.\n\nAmen.\n\nO holy {name}, pray to God for me.' },
      family: { label: 'My family', prayer: '' },
      children: { label: 'My children', prayer: '' },
      marriage: { label: 'Marriage', prayer: '' },
      work: { label: 'Work and livelihood', prayer: '' },
      travel: { label: 'A journey', prayer: '' },
      study: { label: 'Study and exams', prayer: '' },
      protection: { label: 'Protection', prayer: '' },
      repentance: { label: 'Repentance and forgiveness', prayer: '' },
      temptation: { label: 'Strength against temptation', prayer: '' },
      peace: { label: 'Peace and reconciliation', prayer: '' },
      guidance: { label: 'Guidance in a decision', prayer: '' },
      patience: { label: 'Patience', prayer: '' },
      gratitude: { label: 'Thanksgiving', prayer: '' },
    },
    invocation: (name) => `Pray to God for me, holy ${name}, for with fervor I run to you, swift helper and intercessor for my soul!`,
  },
  sources: {
    title: 'Sources and licences',
    sections: [
      { heading: 'Scripture texts', body: 'Readings in English: New Testament from the Berean Standard Bible, Old Testament and deuterocanon from the English Septuagint (LXX2012). Readings in Russian: Synodal Translation (1876). Old Testament readings in Russian appear only where the Synodal chapter matches the Septuagint chapter verse for verse; the Synodal text follows the Hebrew, so its wording can differ from what is read in church. All three are in the public domain; the texts come from eBible.org, with the markup removed and only the verses of each reading kept.' },
      { heading: 'Saints in the prayers', body: 'The line that names your saints is the invocation of one’s patron saint in Orthodox Daily Prayers (St Tikhon’s Seminary Press, 1982). Russian: azbyka.ru, «Молитвенное призывание святого». The Turkish is translated for this app. The saint’s name is what you typed and the request is what you chose; they stay on your device.' },
      { heading: 'Bible links (YouVersion)', body: 'Under each reading, a link opens the same passage in YouVersion (bible.com), in the YouVersion app if it is installed: English in the Revised Standard Version, Catholic Interconfessional (RSVCI), Turkish in the Kutsal Kitap ve Deuterokanonik Kitaplar (KKDEU, Bible Society in Turkey), Russian in the Synodal Translation. These translations are under copyright and are not stored in this app.' },
      { heading: 'Saints and readings', body: 'Names of the saints, feast days and the references of the readings come from orthocal.info (Orthodox Church in America lectionary; the project’s code is MIT-licensed). Only names and references are used, not the lives of the saints.' },
      { heading: 'Prayers, English', body: 'Lord’s Prayer, Creed, O Heavenly King, Trisagion and the Prayer of St. Ephraim: Orthodox Daily Prayers (St Tikhon’s Seminary Press, 1982), as published by Project Gutenberg (#34981). The morning, evening and meal prayers are faithful translations prepared for this app from the Slavonic and Greek texts. The Prayer of Manasseh is the King James Version (Apocrypha, public domain).' },
      { heading: 'Prayers, Russian', body: 'Church Slavonic texts in the public domain, checked against azbyka.ru (Молитвослов).' },
      { heading: 'Prayers, Turkish', body: 'Translated for this app. There is no published Turkish prayer book to check them against, so they may differ from the text your church uses.' },
      { heading: 'Fasting rules', body: 'Based on published rules of the Greek and Russian traditions. Practice differs between churches and jurisdictions; ask your spiritual father.' },
      { heading: 'About this app', body: 'Poreia is a personal aid, not an official publication of any church. The icon was drawn for this app.' },
    ],
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
