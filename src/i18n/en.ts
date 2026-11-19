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
import type { FoodItemId } from '../foods/lookup';
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
    namePlaceholder: string;
    churchTitle: string;
    churchHint: string;
    next: string;
    back: string;
    start: string;
  };
  church: Record<ChurchId, { name: string; calendar: string }>;

  tabs: { today: string; readings: string; scrollTop: string };

  calendar: {
    title: string;
    /** Indexed like `weekdays` (0 = Sunday). */
    weekdaysShort: readonly string[];
    previousMonth: string;
    nextMonth: string;
    back: string;
    today: string;
    /** Hint on a day of the grid: it opens the day screen. */
    openDay: string;
    /** Header button that starts / ends the "Mark days" mode. */
    markDays: string;
    markDaysDone: string;
    /** Added to the label of a day marked as fasting (the dot is not the only cue). */
    markedFasting: string;
    /** Added to the label of a day picked in the "Mark days" mode. */
    daySelected: string;
    /** Hint on a day in the "Mark days" mode. */
    selectHint: string;
    /** Line under the month while the "Mark days" mode is on. */
    markDaysHelp: string;
    selectedCount: (count: number) => string;
    markAsFasting: string;
    clearMarks: string;
    cancel: string;
    /** Spoken after the marks of the chosen days were written / removed. */
    marksSaved: string;
    marksCleared: string;
    marksFailed: string;
  };

  day: {
    previous: string;
    next: string;
    /** Shown instead of the day when the link holds no valid date. */
    invalid: string;
    allowed: string;
    avoided: string;
    nothingAvoided: string;
  };

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
    /** Read by screen readers after a food name instead of the check / cross mark. */
    foodAllowed: string;
    foodForbidden: string;
  };

  /** The one-glance answer for a day (Today card and the daily notification). */
  summary: {
    /** `name` is the fasting level title. */
    today: (name: string) => string;
    noFast: string;
    feast: (names: string) => string;
    allowed: (list: string) => string;
    avoided: (list: string) => string;
    fishDisputed: string;
    /** Lower-case names for a list, one per food group. */
    food: Record<FoodId, string>;
    wine: string;
    /** Oil alone, when wine is allowed but oil is not. */
    oil: string;
    /** What is allowed on the strictest days besides the food groups. */
    plain: { noOil: string; xerophagy: string };
  };

  /** Fasting marks: "I am fasting today" on Today, and the same for a past day on the day screen. */
  log: {
    title: string;
    /** Today screen button while today is not marked. */
    mark: string;
    /** Today screen button while today is marked. */
    marked: string;
    /** Screen-reader label of the button while today is not marked. */
    markA11y: string;
    /** Screen-reader label of the button while today is marked. */
    doneA11y: string;
    /** Day screen button for a past day, not marked / marked. */
    markPast: string;
    markedPast: string;
    markPastA11y: string;
    donePastA11y: string;
  };

  /** Fasting history and the report that closes a fast. */
  report: {
    /** Settings category and screen title. */
    title: string;
    /** One line under the category in the settings hub. */
    summary: string;
    empty: string;
    /** "32 of 40 days": the days marked out of the days of fasting. */
    count: (marked: number, total: number) => string;
    notFound: string;
    kicker: string;
    /** "Great Lent 2027". */
    heading: (name: string, year: number) => string;
    inProgress: string;
    countLead: string;
    countOf: (total: number) => string;
    percent: (value: number) => string;
    weeksTitle: string;
    week: (n: number) => string;
    gridTitle: string;
    legendMarked: string;
    legendUnmarked: string;
    legendFree: string;
    legendUpcoming: string;
    closingTitle: string;
    closingBody: string;
    share: string;
    close: string;
    /** Screen-reader label of one page of the report. */
    page: (n: number, total: number) => string;
    /** Today card. */
    readyTitle: (name: string) => string;
    readyHint: string;
    dismiss: string;
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
    eveReminder: string;
    eveReminderHint: string;
    /** Settings hub: category not covered by an existing title. */
    sectionProfile: string;
    sectionAbout: string;
    /** Hub summaries; `hour` is already formatted ("08:00"). */
    summaryNotificationsOn: (hour: string) => string;
    summaryNotificationsOff: string;
    summarySaints: (count: number) => string;
    summarySaintsNone: string;
    summaryBackup: string;
    summaryAbout: string;
    /** Download popup. Sizes are megabytes already formatted ("12.3"). */
    apkModalTitle: (version: string) => string;
    apkBytes: (done: string, total: string) => string;
    apkBytesUnknown: (done: string) => string;
    apkCancel: string;
    apkRetry: string;
    apkClose: string;
  };

  /** Evening-before reminder (fast begins, feast tomorrow). */
  eve: {
    tomorrow: string;
    fastBegins: string;
  };

  backup: {
    title: string;
    hint: string;
    copy: string;
    copyHint: string;
    /** Title of the system share dialog. */
    shareTitle: string;
    restore: string;
    pasteLabel: string;
    pastePlaceholder: string;
    confirmTitle: string;
    confirmBody: string;
    cancel: string;
    restored: (days: number) => string;
    errors: {
      empty: string;
      tooLarge: string;
      invalid: string;
      notBackup: string;
      version: string;
      storage: string;
    };
  };

  period: Record<PeriodId, string>;
  majorFast: Record<MajorFastId, string>;
  fastDay: Record<FastDayId, string>;
  feast: Record<FeastId, string>;
  level: Record<FastLevel, { title: string; detail: string }>;
  food: Record<FoodId, string>;
  /** Concrete foods for the "Can I eat this?" search; also matched in the other languages. */
  foodItem: Record<FoodItemId, string>;
  foods: {
    title: string;
    back: string;
    /** Row on the Today screen. */
    open: string;
    openHint: string;
    searchPlaceholder: string;
    today: (level: string) => string;
    sectionAllowed: string;
    sectionAvoided: string;
    statusAllowed: string;
    statusForbidden: string;
    statusDisputed: string;
    noResults: string;
  };
  upcoming: {
    title: string;
    back: string;
    /** Row on the Today screen. */
    open: string;
    openHint: string;
    hint: string;
    kindFeast: string;
    kindFast: string;
    inDays: (days: number) => string;
  };
  note: Record<NoteId, string>;

  prayers: {
    title: string;
    /** One line under the title on the Today card. */
    summary: string;
    smaller: string;
    larger: string;
    readingMode: string;
    leaveReadingMode: string;
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
  /** Notification help, "What's new" and "Report a problem" in Settings. */
  support: {
    helpTitle: string;
    helpIntro: string;
    helpCheck: string;
    helpRecheck: string;
    helpChecking: string;
    rowPermission: string;
    permissionGranted: string;
    permissionDenied: string;
    permissionUndetermined: string;
    rowChannel: string;
    importanceOff: string;
    importanceMin: string;
    importanceLow: string;
    importanceDefault: string;
    importanceHigh: string;
    rowScheduled: string;
    rowNext: string;
    rowExact: string;
    exactAllowed: string;
    exactBlocked: string;
    none: string;
    unknown: string;
    stepsTitle: string;
    /** `channel` is the notification category's name in the phone's settings. */
    stepAllow: (channel: string) => string;
    stepBattery: string;
    stepFocus: string;
    stepAutostart: string;
    /** `days` is how far ahead the app schedules. */
    stepOpenApp: (days: number) => string;
    openSettings: string;
    testButton: string;
    testScheduled: string;
    testFailed: string;
    testTitle: string;
    testBody: string;
    whatsNewTitle: string;
    whatsNewInstalled: string;
    reportButton: string;
    reportHint: string;
    reportFailed: string;
    reportTitle: string;
    reportWhat: string;
    reportWrite: string;
    reportDetails: string;
    reportApp: string;
    reportRuntime: string;
    reportAndroid: string;
    reportDevice: string;
    reportLanguage: string;
  };
  /** Home-screen widget. Short strings: they sit in small, fixed-size slots. */
  widget: {
    allowed: string;
    avoided: string;
    /** Shown in the "avoided" column when nothing is restricted. */
    nothing: string;
    complete: string;
    completed: string;
    noFast: string;
    /** "Day 35 / 40" (wide badge). */
    dayOfTotal: (day: number, total: number) => string;
    /** "Day 35" (compact badge). */
    dayShort: (day: number) => string;
    percent: (value: number) => string;
    /** Always-allowed basics, listed after the permitted food groups. */
    staples: string;
    /** Short names of the food groups, in running text. */
    foods: Record<FoodId, string>;
    /** One short phrase per fasting level, for the compact layout. */
    levelShort: Record<FastLevel, string>;
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

  tabs: { today: 'Today', readings: 'Readings', scrollTop: 'Back to top' },

  calendar: {
    title: 'Calendar',
    weekdaysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    previousMonth: 'Previous month',
    nextMonth: 'Next month',
    back: 'Back',
    today: 'today',
    openDay: 'Open the day',
    markDays: 'Mark days',
    markDaysDone: 'Done',
    markedFasting: 'marked as fasting',
    daySelected: 'selected',
    selectHint: 'Double tap to select or deselect',
    markDaysHelp: 'Choose the fasting days you kept. Days to come cannot be marked.',
    selectedCount: (count) => `Selected: ${count}`,
    markAsFasting: 'Mark as fasting',
    clearMarks: 'Clear marks',
    cancel: 'Cancel',
    marksSaved: 'Marked as fasting',
    marksCleared: 'Marks cleared',
    marksFailed: 'The marks could not be saved',
  },

  day: {
    previous: 'Previous day',
    next: 'Next day',
    invalid: 'This date cannot be shown.',
    allowed: 'Allowed',
    avoided: 'Avoided',
    nothingAvoided: 'Nothing is restricted.',
  },

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
    foodAllowed: 'allowed',
    foodForbidden: 'not allowed',
  },

  summary: {
    today: (name) => `Today: ${name}.`,
    noFast: 'No fast today.',
    feast: (names) => `Feast: ${names}.`,
    allowed: (list) => `Allowed: ${list}.`,
    avoided: (list) => `Avoid: ${list}.`,
    fishDisputed: 'Fish: traditions differ.',
    food: { meat: 'meat', dairy: 'dairy, eggs', fish: 'fish', oil: 'oil, wine' },
    wine: 'wine',
    oil: 'oil',
    plain: { noOil: 'food cooked without oil', xerophagy: 'bread, fruit, vegetables, nuts' },
  },

  log: {
    title: 'Fasting marks',
    mark: 'I’m fasting today',
    marked: 'Fasting today ✓',
    markA11y: 'Mark today as a day you are fasting',
    doneA11y: 'Marked as fasting today. Tap to undo.',
    markPast: 'I fasted this day',
    markedPast: 'Fasted this day ✓',
    markPastA11y: 'Mark this day as a day you fasted',
    donePastA11y: 'Marked as fasted. Tap to undo.',
  },

  report: {
    title: 'Fasting history',
    summary: 'A quiet look back at each fast',
    empty: 'Nothing to show yet. Mark the days you fast, and a summary of each fast will appear here.',
    count: (marked, total) => `${marked} of ${total} days`,
    notFound: 'This report is not available.',
    kicker: 'Your fast',
    heading: (name, year) => `${name} ${year}`,
    inProgress: 'The fast is still under way.',
    countLead: 'Days you marked as fasting',
    countOf: (total) => `of ${total} days`,
    percent: (value) => `${value}%`,
    weeksTitle: 'Week by week',
    week: (n) => `Week ${n}`,
    gridTitle: 'Day by day',
    legendMarked: 'Marked',
    legendUnmarked: 'Not marked',
    legendFree: 'No fast',
    legendUpcoming: 'Still to come',
    closingTitle: 'Thank you',
    closingBody: 'Thank you for keeping this fast. May you be kept in peace.',
    share: 'Share',
    close: 'Close',
    page: (n, total) => `Page ${n} of ${total}`,
    readyTitle: (name) => `Your ${name} report is ready`,
    readyHint: 'A quiet summary of your fast',
    dismiss: 'Dismiss',
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
    eveReminder: 'The evening before a fast or feast',
    eveReminderHint: 'At 20:00 the evening before a fast begins or a feast falls.',
    sectionProfile: 'Profile and tradition',
    sectionAbout: 'About',
    summaryNotificationsOn: (hour) => `Daily at ${hour}`,
    summaryNotificationsOff: 'Off',
    summarySaints: (count) => (count === 1 ? '1 saint' : `${count} saints`),
    summarySaintsNone: 'None added yet',
    summaryBackup: 'Copy or restore your data',
    summaryAbout: 'Sources and GitHub',
    apkModalTitle: (version) => `Downloading version ${version}`,
    apkBytes: (done, total) => `${done} of ${total} MB`,
    apkBytesUnknown: (done) => `${done} MB`,
    apkCancel: 'Cancel',
    apkRetry: 'Try again',
    apkClose: 'Close',
  },

  eve: {
    tomorrow: 'Tomorrow',
    fastBegins: 'The fast begins.',
  },

  backup: {
    title: 'Backup',
    hint: 'Keep your settings and completed days safe, or move them to another phone. Copy the backup, then paste it here to restore it.',
    copy: 'Copy backup',
    copyHint:
      'Opens the share sheet. Choose Copy, or send it to yourself. The backup is plain text with your name, saints and completed days, so share it with no one else.',
    shareTitle: 'Poreia backup',
    restore: 'Restore',
    pasteLabel: 'Backup text',
    pastePlaceholder: 'Paste the backup here',
    confirmTitle: 'Restore this backup?',
    confirmBody:
      'Your current settings will be replaced. Completed days in the backup are added to the ones you have.',
    cancel: 'Cancel',
    restored: (days) => `Restored. Completed days in the backup: ${days}.`,
    errors: {
      empty: 'Paste the backup text first.',
      tooLarge: 'This text is too long to be a Poreia backup.',
      invalid: 'This is not readable as a backup. Copy it again and paste the whole text.',
      notBackup: 'This text is not a Poreia backup.',
      version: 'This backup comes from a newer version of Poreia. Update the app first.',
      storage: 'The backup could not be saved on this phone. Try again.',
    },
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
  foodItem: {
    meat: 'Meat',
    beef: 'Beef',
    pork: 'Pork',
    lamb: 'Lamb',
    chicken: 'Chicken',
    sausage: 'Sausage, salami',
    broth: 'Meat broth',
    milk: 'Milk',
    cheese: 'Cheese',
    yogurt: 'Yogurt, kefir',
    butter: 'Butter',
    cream: 'Cream, sour cream',
    eggs: 'Eggs',
    iceCream: 'Ice cream',
    fish: 'Fish',
    salmon: 'Salmon, trout',
    tuna: 'Tuna',
    sardine: 'Sardines, anchovies',
    oliveOil: 'Olive oil',
    sunflowerOil: 'Sunflower oil',
    fried: 'Fried food',
    wine: 'Wine',
  },
  foods: {
    title: 'Can I eat this?',
    back: 'Back',
    open: 'Can I eat this?',
    openHint: 'Check a food against today’s fast',
    searchPlaceholder: 'Search a food, for example cheese',
    today: (level) => `Today: ${level}`,
    sectionAllowed: 'Allowed today',
    sectionAvoided: 'Avoid today',
    statusAllowed: 'Allowed today',
    statusForbidden: 'Not allowed today',
    statusDisputed: 'Traditions differ',
    noResults: 'No food found. For anything not listed, ask your spiritual father.',
  },
  upcoming: {
    title: 'Feasts and fasts ahead',
    back: 'Back',
    open: 'Feasts and fasts ahead',
    openHint: 'Days until the next feasts and fasts',
    hint: 'By the church calendar you chose.',
    kindFeast: 'Feast',
    kindFast: 'Fast begins',
    inDays: (days) => (days === 1 ? 'tomorrow' : `in ${days} days`),
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
    readingMode: 'Reading mode',
    leaveReadingMode: 'Leave reading mode',
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

  support: {
    helpTitle: 'Notifications not arriving?',
    helpIntro: 'See what the phone reports, then go through the steps below.',
    helpCheck: 'Check now',
    helpRecheck: 'Check again',
    helpChecking: 'Checking…',
    rowPermission: 'Permission',
    permissionGranted: 'Allowed',
    permissionDenied: 'Blocked',
    permissionUndetermined: 'Not asked yet',
    rowChannel: 'Notification category',
    importanceOff: 'Off',
    importanceMin: 'Minimal',
    importanceLow: 'Low',
    importanceDefault: 'Default',
    importanceHigh: 'High',
    rowScheduled: 'Scheduled',
    rowNext: 'Next one',
    rowExact: 'Exact alarms',
    exactAllowed: 'Allowed',
    exactBlocked: 'Not allowed',
    none: 'None',
    unknown: 'Unknown',
    stepsTitle: 'What usually helps',
    stepAllow: (channel) =>
      `Open the app settings with the button below, choose Notifications and make sure they are on, including the “${channel}” category.`,
    stepBattery:
      'In the same settings open Battery and choose “Unrestricted” (on some phones “No restrictions” or “Don’t optimise”). A strict battery mode can delay or drop notifications.',
    stepFocus:
      'Do Not Disturb and focus modes silence notifications. Allow Poreia there, or switch them off for a moment.',
    stepAutostart:
      'Some phones (Xiaomi, Huawei, Samsung and others) also keep an autostart or “sleeping apps” list. Make sure Poreia is not on it.',
    stepOpenApp: (days) =>
      `Poreia plans ${days} days ahead each time you open it. If you have not opened it for a month, open it once.`,
    openSettings: 'Open app settings',
    testButton: 'Send a test notification now',
    testScheduled: 'A test notification will arrive in about 5 seconds.',
    testFailed: 'The test notification could not be scheduled.',
    testTitle: 'Test notification',
    testBody: 'If you can read this, notifications reach you.',
    whatsNewTitle: 'What’s new',
    whatsNewInstalled: 'Installed',
    reportButton: 'Report a problem',
    reportHint:
      'Opens a GitHub page with the app version, Android version, device model and language filled in. Nothing else is sent. A GitHub account is needed to submit it.',
    reportFailed: 'The page could not be opened.',
    reportTitle: 'Problem report',
    reportWhat: 'What happened',
    reportWrite: '(Describe the problem and how to repeat it.)',
    reportDetails: 'Technical details (added automatically)',
    reportApp: 'App',
    reportRuntime: 'Content',
    reportAndroid: 'Android',
    reportDevice: 'Device',
    reportLanguage: 'Language',
  },

  widget: {
    allowed: 'Allowed',
    avoided: 'Avoid',
    nothing: 'Nothing',
    complete: 'I’m fasting today',
    completed: 'Fasting today',
    noFast: 'No fast',
    dayOfTotal: (day, total) => `Day ${day} / ${total}`,
    dayShort: (day) => `Day ${day}`,
    percent: (value) => `${value}%`,
    staples: 'bread, vegetables, fruit',
    foods: {
      meat: 'meat',
      dairy: 'dairy, eggs',
      fish: 'fish',
      oil: 'oil, wine',
    },
    levelShort: {
      none: 'No fast',
      noMeat: 'No Meat',
      fish: 'No Meat & Dairy',
      oil: 'No Meat, Dairy, Fish',
      noOil: 'No Oil',
      xerophagy: 'Dry Eating',
    },
  },
};
