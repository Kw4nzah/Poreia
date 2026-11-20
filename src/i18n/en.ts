// English is the reference dictionary: its shape defines `Messages`, so a key missing
// from another language is a type error.

import { names } from '../liturgy/names/en';
import type { LiturgyGroup, LiturgyId, LiturgyLanguage, LiturgySection, LiturgySpeaker } from '../liturgy/types';
import type { SaintGender } from '../prayers/saintGender';
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
import { feastPrayerTexts } from './prayers/feastsEn';

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
    /** Version of the content bundle, which moves with over-the-air updates (the app version does not). */
    contentVersion: (version: string) => string;
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
    ongoingToggle: string;
    ongoingHint: string;
    /** Name of the persistent notification's category in the phone's settings. */
    ongoingChannel: string;
    /** Button of the persistent notification that clears today's "I'm fasting" mark. */
    ongoingUndo: string;
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
    /** Tomorrow's level differs from today's. */
    changes: (today: string, tomorrow: string) => string;
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
    /** Button that shares the next year of feasts and fasts as an .ics file (fallback). */
    addToCalendar: string;
    addToCalendarHint: string;
    addToCalendarFailed: string;
    /** Writes the next 12 months straight into the phone's own calendar. */
    addToPhone: string;
    removeFromPhone: string;
    phoneHint: string;
    phoneSyncing: string;
    /** `count` events were written. */
    phoneSynced: (count: number) => string;
    phoneRemoved: string;
    phoneNothingToRemove: string;
    phonePermissionDenied: string;
    phoneNoCalendar: string;
    phoneFailed: string;
    /** Title of a day of fasting in the calendar; `level` is the fasting level title. */
    fastDayTitle: (level: string) => string;
    /** Name of the calendar created by the import. */
    calendarName: string;
  };
  note: Record<NoteId, string>;

  prayers: {
    title: string;
    /** One line under the title on the Today card. */
    summary: string;
    smaller: string;
    /** Button that shares the whole prayer or reading as text. */
    share: string;
    larger: string;
    readingMode: string;
    leaveReadingMode: string;
    /** Heading of the starred prayers and the label of the star toggle. */
    favorites: string;
    favorite: string;
    /** Small label above the last-opened prayer at the top of the list. */
    continueReading: string;
    searchPlaceholder: string;
    noResults: string;
    /** Button on a feast's card in Today and the calendar day. */
    readFeastPrayers: string;
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
    genderLabel: string;
    genderMale: string;
    genderFemale: string;
    /** Spoken hint on a saint's row: tapping switches between saint and female saint. */
    genderChange: string;
    /** `prayer` is written by the app's author per topic; `{name}` stands for the saint's name. Empty = only the topic is shown. */
    topics: Record<SaintTopicId, { label: string; prayer: string }>;
    add: string;
    remove: string;
    full: string;
    heading: string;
    /** The prayer asking a saint for intercession; `name` is what the user typed. */
    invocation: (name: string, gender: SaintGender) => string;
  };
  /** The Divine Liturgy reader; its entry shows only once a text is installed. */
  liturgy: {
    title: string;
    /** Row in the prayers list. */
    /** Name of each liturgy, as shown in the list. */
    names: Record<LiturgyId, string>;
    /** Headings of the groups in the services list. */
    groups: Record<LiturgyGroup, string>;
    /** One line on the Sources screen for all the services taken from azbyka.ru. */
    azbykaCredit: string;
    sectionsLabel: string;
    section: Record<LiturgySection, string>;
    speaker: Record<LiturgySpeaker, string>;
    languageLabel: string;
    language: Record<LiturgyLanguage, string>;
    parallel: string;
    parallelOff: string;
    /** Shown where a language has no text for a block. */
    missing: string;
    loading: string;
    loadFailed: string;
    /** Services list: row that reopens the service read last. */
    continueTitle: string;
    /** Services list: nothing matches the search. */
    noResults: string;
    /** Reader: button that scrolls to the start. */
    backToTop: string;
    /** Reader: the one bookmark per service (header buttons, toast, list rows). */
    bookmark: string;
    bookmarkHere: string;
    bookmarkGo: string;
    bookmarkRemove: string;
    bookmarkSetToast: string;
    bookmarkRemovedToast: string;
    /** Reader and list: share of the text read so far, 0 to 100. */
    percentRead: (percent: number) => string;
    /** Reader: reset the place, progress and bookmark after a confirmation. */
    startOver: string;
    startOverTitle: string;
    startOverBody: string;
    startOverCancel: string;
    /** Reader: label of the per-passage menu button, and its Share entry. */
    passageMenu: string;
    sharePassage: string;
    /** Heading of the liturgy part of the Sources screen. */
    sourcesHeading: string;
    /** General note on the Sources screen: how to ask for a text to be removed; `url` is the issues page. */
    rightsNote: (url: string) => string;
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
    whatsNewIn: (version: string) => string;
    whatsNewComing: (version: string) => string;
    whatsNewInstalled: string;
    /** Badge on a version that arrived as an update without a new app (APK) download. */
    whatsNewDelivered: string;
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
  /** Settings > Report a problem: a form that opens a ready GitHub issue. */
  bugReport: {
    title: string;
    summaryRow: string;
    intro: string;
    kindLabel: string;
    /** Problem, wrong or missing text, idea (in this order). */
    kinds: readonly [string, string, string];
    whatLabel: string;
    whatPlaceholder: string;
    stepsLabel: string;
    send: string;
    tooLong: string;
    needText: string;
    failed: string;
    previewTitle: string;
    issueWhat: string;
    issueSteps: string;
    issueKind: string;
    /** Switch that attaches the last crash caught on this phone. */
    attachError: string;
    issueError: string;
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
    contentVersion: (version) => `Content version ${version} (updates arrive without a new app)`,
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
    ongoingToggle: 'Persistent notification',
    ongoingHint:
      'Stays in the notification shade with today’s fast and foods, for those who don’t use the widget. Hidden on the lock screen.',
    ongoingChannel: 'Today’s fast (pinned)',
    ongoingUndo: 'Clear mark',
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
    changes: (today, tomorrow) => `Today: ${today}. Tomorrow: ${tomorrow}.`,
    fastBegins: 'The fast begins.',
  },

  backup: {
    title: 'Backup',
    hint: 'Keep your settings, completed days, reading progress and service bookmarks safe, or move them to another phone. Copy the backup, then paste it here to restore it.',
    copy: 'Copy backup',
    copyHint:
      'Opens the share sheet. Choose Copy, or send it to yourself. The backup is plain text with your name, saints, completed days, reading progress and bookmarks, so share it with no one else.',
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
    addToCalendar: 'Share as .ics file',
    addToCalendarHint: 'Alternative: sends the same events as a file to any calendar app.',
    addToCalendarFailed: 'No calendar app could open the file.',
    addToPhone: 'Add to my phone calendar',
    removeFromPhone: 'Remove from calendar',
    phoneHint:
      'Writes the fasting days and feasts of the next 12 months into a separate calendar named “Poreia” on this phone. Syncing again replaces them, never duplicates.',
    phoneSyncing: 'Writing to the calendar…',
    phoneSynced: (count) => `${count} events added to the “Poreia” calendar.`,
    phoneRemoved: 'The “Poreia” calendar was removed.',
    phoneNothingToRemove: 'There is no “Poreia” calendar to remove.',
    phonePermissionDenied:
      'Calendar access was not allowed. You can allow it in the phone’s settings for Poreia.',
    phoneNoCalendar: 'Could not create a calendar on this phone.',
    phoneFailed: 'Something went wrong while writing to the calendar. Nothing was lost; try again.',
    fastDayTitle: (level) => `Fast: ${level}`,
    calendarName: 'Poreia: feasts and fasts',
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
    share: 'Share',
    larger: 'Larger text',
    readingMode: 'Reading mode',
    leaveReadingMode: 'Leave reading mode',
    favorites: 'Favourites',
    favorite: 'Favourite',
    continueReading: 'Continue where you left off',
    searchPlaceholder: 'Search prayers',
    noResults: 'No prayer found.',
    readFeastPrayers: 'Read the feast prayers',
    group: {
      basic: 'Basic prayers',
      daily: 'Prayers of the day',
      lent: 'Great Lent',
      feasts: 'Feasts',
    },
    text: { ...prayerTexts, ...feastPrayerTexts },
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
    genderLabel: 'Saint or female saint?',
    genderMale: 'Saint',
    genderFemale: 'Female saint',
    genderChange: 'Tap to change',
    topics: {
      health: { label: 'Health and healing', prayer: 'In the name of the Father, and of the Son, and of the Holy Spirit. Amen.\n\nO holy {name}, faithful servant of Christ and one who stands before God!\n\nI humbly ask you: pray to our Lord Jesus Christ on my behalf. Ask Him to grant me good health, healing of body, peace of soul, patience, and strength.\n\nPray that, in the trials I am facing, I may seek refuge in His mercy, never lose hope in the face of illness, and remain steadfast in faith.\n\nAsk the Lord to grant wisdom to the physicians, bless my treatment, and strengthen me on the path to recovery.\n\nO holy {name}, intercede for me before the Lord, that He may have mercy on me and watch over and protect me according to His holy will.\n\nAmen.\n\nO holy {name}, pray to God for me.' },
      family: { label: 'My family', prayer: 'In the name of the Father, and of the Son, and of the Holy Spirit. Amen.\n\nO holy {name}, faithful servant of Christ and one who stands before God!\n\nI humbly ask you: pray to our Lord Jesus Christ for my family. Ask Him not to withhold His mercy from us, and to grant each member of my family health, peace, well-being, and strength.\n\nPray that the Lord may protect my family from all evil, dangers, illnesses, and afflictions. Ask Him to bless our home with love, understanding, patience, and unity; to remove disagreements among us and teach us to show mercy and kindness toward one another.\n\nIntercede before the Lord that every member of my family may remain steadfast in faith, find peace in their hearts, and be blessed by God\'s grace in all aspects of their lives.\n\nPray that the Lord may watch over our loved ones who are far away, strengthen those going through difficult times, and provide help to all who are in need.\n\nO holy {name}, intercede before God for my family, that the Lord may surround us with His mercy, protect us, and guide us according to His holy will.\n\nAmen.\n\nO holy {name}, pray to God for my family.' },
      children: { label: 'My children', prayer: 'In the name of the Father, and of the Son, and of the Holy Spirit. Amen.\n\nO holy {name}, faithful servant of Christ and one who stands before God!\n\nI humbly ask you: pray to our Lord Jesus Christ for my children. Ask Him to protect them in body and soul, and to plant in their hearts faith, love, humility, and wisdom.\n\nAsk the Lord to give them discernment to tell right from wrong, and to keep them from harmful friendships, destructive habits, and every kind of evil.\n\nIntercede that, as they grow, they may come to know God, love His Church, and live according to His commandments.\n\nAsk Him also to grant me wisdom to raise them with patience, justice, and love.\n\nO holy {name}, intercede before God for my children, for He is our God, Who loves children and desires the salvation of all.\n\nAmen.\n\nO holy {name}, pray to God for my children.' },
      marriage: { label: 'Marriage', prayer: 'In the name of the Father, and of the Son, and of the Holy Spirit. Amen.\n\nO holy {name}, faithful servant of Christ and one who stands before God!\n\nI humbly ask you: pray to our Lord Jesus Christ for my marriage. Ask Him to strengthen the love, faithfulness, and mutual respect between spouses.\n\nAsk the Lord to remove pride, anger, jealousy, and selfishness from our hearts. Intercede that, in times of disagreement, He may grant us patience, the willingness to listen, and the grace to forgive.\n\nPray that we may be a support and not a burden to one another, and that in joy and in hardship we may turn to God together.\n\nAsk Him to fill our home with faith, peace, and mercy, and to make our union pleasing to His holy will.\n\nO holy {name}, intercede before God for my marriage, that the Lord may surround us with His mercy and protect us.\n\nAmen.\n\nO holy {name}, pray to God for my marriage.' },
      work: { label: 'Work and livelihood', prayer: 'In the name of the Father, and of the Son, and of the Holy Spirit. Amen.\n\nO holy {name}, faithful servant of Christ and one who stands before God!\n\nI humbly ask you: pray to our Lord Jesus Christ for my work and my daily tasks. Ask Him to give strength to my hands, clarity to my mind, wisdom to my decisions, and diligence in my duties.\n\nAsk the Lord to keep me from idleness, dishonest gain, deceit, and pride. Intercede that my work may be honest and fruitful, providing for my needs and for those entrusted to my care.\n\nPray that He may teach me to act with integrity, to treat others justly, and to use what I earn for good, and that I may never forget that every blessing comes through God\'s grace.\n\nO holy {name}, intercede before God for my labour, that the Lord may bless my work.\n\nAmen.\n\nO holy {name}, pray to God for my work and livelihood.' },
      travel: { label: 'A journey', prayer: 'In the name of the Father, and of the Son, and of the Holy Spirit. Amen.\n\nO holy {name}, faithful servant of Christ and one who stands before God!\n\nI humbly ask you: pray to our Lord Jesus Christ for the journey I am about to undertake. Ask Him to accompany me and to protect me from dangers seen and unseen.\n\nAsk the Lord to make my way peaceful and to bring kind and honest people across my path. Intercede that He may grant me patience, attentiveness, and sound judgment throughout the journey.\n\nPray that I may reach my destination safely and return in health to those I love, that this journey may be according to God\'s holy will, and that I may remember to give thanks to Him at every step.\n\nO holy {name}, intercede before God for my journey, that the Lord may keep me on the way.\n\nAmen.\n\nO holy {name}, pray to God for me on my journey.' },
      study: { label: 'Study and exams', prayer: 'In the name of the Father, and of the Son, and of the Holy Spirit. Amen.\n\nO holy {name}, faithful servant of Christ and one who stands before God!\n\nI humbly ask you: pray to our Lord Jesus Christ for my studies and examinations. Ask Him, the Source of all wisdom and knowledge, to enlighten my mind and strengthen my understanding.\n\nAsk the Lord to grant me attention, patience, and diligence, and to help me comprehend and remember what I learn.\n\nIntercede that during examinations I may be kept from fear and confusion and may express honestly what I know. Ask Him to protect me from laziness, despair, and comparing myself with others.\n\nPray that any success I receive may be not a cause for pride, but an occasion to give thanks to God and to serve others.\n\nO holy {name}, intercede before God for my studies, that the Lord may enlighten my mind.\n\nAmen.\n\nO holy {name}, pray to God for my studies and exams.' },
      protection: { label: 'Protection', prayer: 'In the name of the Father, and of the Son, and of the Holy Spirit. Amen.\n\nO holy {name}, faithful servant of Christ and one who stands before God!\n\nI humbly ask you: pray to our Lord Jesus Christ to protect me. Ask Him to be my refuge and my protector, and to guard me from every evil, from injustice, and from the assaults of enemies seen and unseen.\n\nAsk the Lord to send His holy angels to accompany and watch over me, and to keep my feet from the paths of sin.\n\nIntercede that when I am afraid He may strengthen my faith, and in danger grant me discernment and courage. Ask Him to protect me not only from bodily harm, but also from everything that would draw my soul away from God.\n\nO holy {name}, intercede for me before God, for in Him alone are my trust and my hope.\n\nAmen.\n\nO holy {name}, pray to God to protect me.' },
      repentance: { label: 'Repentance and forgiveness', prayer: 'In the name of the Father, and of the Son, and of the Holy Spirit. Amen.\n\nO holy {name}, faithful servant of Christ and one who stands before God!\n\nI humbly ask you: pray to our Lord Jesus Christ for me, a sinner. Ask Him to have mercy on me; He knows the sins I have committed in thought, word, and deed.\n\nAsk the Lord to teach me to see and confess my sins sincerely, without seeking to justify myself. Intercede that He may cleanse my heart, awaken my conscience, and lead me to true repentance.\n\nPray that He may give me the strength to ask forgiveness from those I have hurt and to forgive those who have wronged me, that He may renew me through His mercy and guide my life according to His commandments.\n\nO holy {name}, intercede before God for me, a sinner, that the Lord may have mercy on me.\n\nAmen.\n\nO holy {name}, pray to God for my repentance.' },
      temptation: { label: 'Strength against temptation', prayer: 'In the name of the Father, and of the Son, and of the Holy Spirit. Amen.\n\nO holy {name}, faithful servant of Christ and one who stands before God!\n\nI humbly ask you: pray to our Lord Jesus Christ for my weakness and for the struggle within my heart. Ask Him to deliver me from thoughts, desires, and habits that lead me into sin.\n\nAsk the Lord, in times of temptation, to enlighten my mind, strengthen my will, and help me choose what is good. Intercede that He may show me the way of escape, so that I am not overcome by what is beyond my strength.\n\nPray that when I fall He may raise me up, and not allow me to surrender to despair or become accustomed to sin. Pray that He may strengthen me by the grace of His Holy Spirit.\n\nO holy {name}, intercede for me before God, that the Lord may uphold me in temptation and that I may serve Him faithfully.\n\nAmen.\n\nO holy {name}, pray to God for me against temptation.' },
      peace: { label: 'Peace and reconciliation', prayer: 'In the name of the Father, and of the Son, and of the Holy Spirit. Amen.\n\nO holy {name}, faithful servant of Christ and one who stands before God!\n\nI humbly ask you: pray to our Lord Jesus Christ for peace and reconciliation. Ask Him to remove anger, resentment, and hostility from my heart.\n\nAsk the Lord to keep me from holding grudges, seeking revenge, or speaking harshly. Intercede that He may grant me the strength to forgive those who have hurt me, to acknowledge my own faults, and, when necessary, to take the first step toward reconciliation.\n\nPray that He may place mercy and understanding also in the hearts of those with whom I am in disagreement, and that peace may be revealed not only in our words but also in our actions.\n\nO holy {name}, intercede before God for peace, that the Lord may grant His peace to our homes, our families, His Church, and the whole world.\n\nAmen.\n\nO holy {name}, pray to God for peace and reconciliation.' },
      guidance: { label: 'Guidance in a decision', prayer: 'In the name of the Father, and of the Son, and of the Holy Spirit. Amen.\n\nO holy {name}, faithful servant of Christ and one who stands before God!\n\nI humbly ask you: pray to our Lord Jesus Christ about the decision before me. Ask Him, Who knows all things and sees the hearts of men, to guide me.\n\nAsk the Lord to keep me from placing my own desires above God\'s holy will. Intercede that He may enlighten my mind, quiet my thoughts, and grant me wisdom to distinguish what is right from what is wrong.\n\nPray that He may not allow me to decide out of haste, fear, or pride, and that He may give me the courage to choose what is good, the patience to accept its consequences, and the compassion to consider how my decision may affect others.\n\nO holy {name}, intercede before God for my decision, that in all things the Lord\'s will may be done.\n\nAmen.\n\nO holy {name}, pray to God for me in my decision.' },
      patience: { label: 'Patience', prayer: 'In the name of the Father, and of the Son, and of the Holy Spirit. Amen.\n\nO holy {name}, faithful servant of Christ and one who stands before God!\n\nI humbly ask you: pray to our Lord Jesus Christ for my patience. Ask Him, Who is long-suffering and abundant in mercy, to grant me a patient heart.\n\nAsk the Lord to keep me from impatience in waiting, anger in hardship, and despair in disappointment. Intercede that He may teach me to entrust to Him what I cannot change, and to work with wisdom and at the proper time for what I can change.\n\nPray that I may not lose faith in times of difficulty, that I may show mercy toward the weaknesses of others and be measured in my words. Ask Him to teach me to trust His wisdom in every circumstance.\n\nO holy {name}, intercede before God for my patience.\n\nAmen.\n\nO holy {name}, pray to God that He grant me patience.' },
      gratitude: { label: 'Thanksgiving', prayer: 'In the name of the Father, and of the Son, and of the Holy Spirit. Amen.\n\nO holy {name}, faithful servant of Christ and one who stands before God!\n\nI humbly ask you: give thanks with me to our Lord Jesus Christ, and offer my gratitude before Him. I praise Him for my life, my health, my family, my friends, the provisions I have today, and the blessings I may not even recognize.\n\nI beg you to ask the Lord that I may never forget to thank Him in days of joy or to trust in Him in days of hardship. Ask Him to keep me from ingratitude, envy, and taking His gifts for granted.\n\nIntercede that He may teach me to share what I have received and to help those in need.\n\nO holy {name}, glorify with me the Father, the Son, and the Holy Spirit, now and ever.\n\nAmen.\n\nO holy {name}, offer my thanks to God.' },
    },
    invocation: (name, _gender) => `Pray to God for me, holy ${name}, for with fervor I run to you, swift helper and intercessor for my soul!`,
  },
  liturgy: {
    title: 'Services',
    names,
    groups: {
      liturgies: 'Divine Liturgies',
      offices: 'Daily services and prayers',
      occasional: 'Sacraments and occasional services',
      canons: 'Canons and akathists',
      feasts: 'Feasts and saints',
      lentPascha: 'Great Lent, Holy Week and Pascha',
      octoechos: 'Sunday Octoechos and readings',
      hymns: 'Troparia, kontakia and hymns',
      molitvoslov: 'Prayers (Molitvoslov)',
      prayersEn: 'Prayers in English',
    },
    azbykaCredit: 'Church Slavonic and Russian texts of the services and prayers (Molitvoslov) come from azbyka.ru and are used with its written permission.',
    sectionsLabel: 'Sections',
    section: {
      proskomedia: 'Proskomedia',
      catechumens: 'Liturgy of the Catechumens',
      faithful: 'Liturgy of the Faithful',
      service: 'Service',
      dismissal: 'Dismissal',
    },
    speaker: {
      deacon: 'Deacon',
      priest: 'Priest',
      choir: 'Choir',
      reader: 'Reader',
      people: 'People',
      rubric: 'Direction',
      omitted: 'Not read',
    },
    languageLabel: 'Language',
    language: { cu: 'Church Slavonic', en: 'English', ru: 'Russian', tr: 'Turkish' },
    parallel: 'Two languages',
    parallelOff: 'One language',
    missing: 'No text in this language',
    loading: 'Loading…',
    loadFailed: 'The text could not be loaded.',
    continueTitle: 'Continue where you left off',
    noResults: 'No service matches your search.',
    backToTop: 'Back to the beginning',
    bookmark: 'Bookmark',
    bookmarkHere: 'Bookmark here',
    bookmarkGo: 'Go to bookmark',
    bookmarkRemove: 'Remove bookmark',
    bookmarkSetToast: 'Bookmark set',
    bookmarkRemovedToast: 'Bookmark removed',
    percentRead: (percent) => `${percent}% read`,
    startOver: 'Finished / start over',
    startOverTitle: 'Start this service over?',
    startOverBody: 'Your place, your progress and the bookmark in this service will be cleared.',
    startOverCancel: 'Cancel',
    passageMenu: 'Passage options',
    sharePassage: 'Share this passage',
    sourcesHeading: 'Divine Liturgy',
    rightsNote: (url) =>
      `If you hold rights to a text here and want it removed, report it at ${url} and it will be removed.`,
  },
  sources: {
    title: 'Sources and licences',
    sections: [
      { heading: 'Scripture texts', body: 'Readings in English: New Testament from the Berean Standard Bible, Old Testament and deuterocanon from the English Septuagint (LXX2012). Readings in Russian: Synodal Translation (1876). Old Testament readings in Russian appear only where the Synodal chapter matches the Septuagint chapter verse for verse; the Synodal text follows the Hebrew, so its wording can differ from what is read in church. All three are in the public domain; the texts come from eBible.org, with the markup removed and only the verses of each reading kept.' },
      { heading: 'Saints in the prayers', body: 'The line that names your saints is the invocation of one’s patron saint in Orthodox Daily Prayers (St Tikhon’s Seminary Press, 1982). Russian: azbyka.ru, «Молитвенное призывание святого». The Turkish is translated for this app. The saint’s name is what you typed and the request is what you chose; they stay on your device.' },
      { heading: 'Bible links (YouVersion)', body: 'Under each reading, a link opens the same passage in YouVersion (bible.com), in the YouVersion app if it is installed: English in the Revised Standard Version, Catholic Interconfessional (RSVCI), Turkish in the Kutsal Kitap ve Deuterokanonik Kitaplar (KKDEU, Bible Society in Turkey), Russian in the Synodal Translation. These translations are under copyright and are not stored in this app.' },
      { heading: 'Saints and readings', body: 'Names of the saints, feast days and the references of the readings come from orthocal.info (Orthodox Church in America lectionary; the project’s code is MIT-licensed). Only names and references are used, not the lives of the saints.' },
      { heading: 'Prayers, English', body: 'Lord’s Prayer, Creed, O Heavenly King, Trisagion and the Prayer of St. Ephraim: Orthodox Daily Prayers (St Tikhon’s Seminary Press, 1982), as published by Project Gutenberg (#34981). The morning, evening and meal prayers are faithful translations prepared for this app from the Slavonic and Greek texts. The Prayer of Manasseh is the King James Version (Apocrypha, public domain).' },
      { heading: 'Prayers, Russian', body: 'Church Slavonic texts, checked against azbyka.ru (Молитвослов); used with the written permission of azbyka.ru.' },
      { heading: 'Prayers, Turkish', body: 'Translated for this app. There is no published Turkish prayer book to check them against, so they may differ from the text your church uses.' },
      { heading: 'Feast hymns', body: 'The troparion and kontakion of each feast. English: Isabel Florence Hapgood, Service Book of the Holy Orthodox-Catholic Apostolic (Greco-Russian) Church (Houghton, Mifflin and Company, 1906), from the services of the great feasts. It is in the public domain: it was published in 1906 and Hapgood died in 1928. Where that book has no usable hymn for a feast, or words it for the Russian Empire, the Russian text is shown with a note instead. Russian: Church Slavonic from azbyka.ru (calendar pages, Julian dates), used with the written permission of azbyka.ru. Turkish: translated from the English for this app and not yet reviewed by a Turkish-speaking Orthodox; it may differ from the text your church uses.' },
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
    whatsNewIn: (version) => `What’s new in ${version}`,
    whatsNewComing: (version) => `What’s new in ${version}`,
    whatsNewInstalled: 'Installed',
    whatsNewDelivered: 'Received as an update',
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

  bugReport: {
    title: 'Report a problem',
    summaryRow: 'Describe what went wrong and send it',
    intro:
      'Write what happened. “Send” opens a ready GitHub issue with your words and a few technical details (app version, Android version, phone model, language). Nothing else is added. You press “Submit” on GitHub; you need a GitHub account for that.',
    kindLabel: 'What is it about?',
    kinds: ['Problem', 'Wrong or missing text', 'Idea'],
    whatLabel: 'What happened?',
    whatPlaceholder: 'For example: the Vespers text stops halfway.',
    stepsLabel: 'What did you do before it? (optional)',
    send: 'Send via GitHub',
    tooLong: 'The text is too long to send this way. Please shorten it.',
    needText: 'Write a few words first.',
    failed: 'Could not open the link. Try again.',
    previewTitle: 'This is sent with your words:',
    issueWhat: 'What happened',
    issueSteps: 'Before it',
    issueKind: 'Kind',
    attachError: 'Attach the last error from this phone',
    issueError: 'Last error',
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
