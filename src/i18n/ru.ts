import type { Messages } from './en';
import { prayerTexts } from './prayers/ru';

/** Russian plural forms: 1 день, 2 дня, 5 дней. */
export function pluralRu(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

const days = (n: number) => `${n} ${pluralRu(n, 'день', 'дня', 'дней')}`;

export const ru: Messages = {
  languageName: 'Русский',
  weekdays: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
  months: [
    'января',
    'февраля',
    'марта',
    'апреля',
    'мая',
    'июня',
    'июля',
    'августа',
    'сентября',
    'октября',
    'ноября',
    'декабря',
  ],
  date: (day, month, year) => `${day} ${month} ${year}`,
  dayMonth: (day, month) => `${day} ${month}`,

  onboarding: {
    tagline: 'Спутник в постах Церкви',
    languageTitle: 'Выберите язык',
    nameTitle: 'Как к вам обращаться?',
    nameHint: 'Только для приветствия. Имя остаётся на этом телефоне.',
    namePlaceholder: 'Ваше имя',
    churchTitle: 'Какой традиции вы следуете?',
    churchHint: 'От этого зависят календарь и устав поста.',
    next: 'Далее',
    back: 'Назад',
    start: 'Начать',
  },
  church: {
    greek: { name: 'Греческая традиция', calendar: 'Новый стиль' },
    russian: { name: 'Русская традиция', calendar: 'Старый стиль (юлианский)' },
  },

  today: {
    greeting: (name) => (name ? `Мир вам, ${name}` : 'Мир вам'),
    churchDate: (date) => `По церковному календарю: ${date}`,
    feast: 'Праздник',
    dayOf: (day, total) => `День ${day} из ${total}`,
    daysLeft: (n) => `${pluralRu(n, 'Остался', 'Осталось', 'Осталось')} ${days(n)}`,
    lastDay: 'Последний день',
    upcomingTitle: 'Следующий пост',
    startsIn: (n) => (n === 1 ? 'Начинается завтра' : `Начинается через ${days(n)}`),
    daysToPascha: (n) => `До Пасхи ${days(n)}`,
    disclaimer:
      'Это общие указания церковных календарей. Местный обычай и совет духовника важнее. Послабления в дни памяти святых учтены лишь частично.',
    settings: 'Настройки',
    newVersion: 'Новая версия готова к установке',
  },

  settings: {
    title: 'Настройки',
    back: 'Назад',
    name: 'Имя',
    church: 'Традиция',
    language: 'Язык',
    updatesTitle: 'Обновления',
    version: (version) => `Версия ${version}`,
    apkAvailable: (version) => `Доступна версия ${version}`,
    apkInstall: (megabytes) => `Скачать и установить (${megabytes} МБ)`,
    apkDownloading: 'Загрузка…',
    apkFailed: 'Не удалось скачать. Попробуйте позже.',
    notificationsTitle: 'Ежедневное уведомление',
    notificationsToggle: 'Пост на сегодня, каждое утро',
    notificationsTime: 'Время',
    notificationsDenied:
      'Уведомления для Poreia запрещены. Разрешите их в настройках телефона и включите снова.',
    notificationsChannel: 'Пост на день',
  },

  period: {
    publicanWeek: 'Седмица мытаря и фарисея',
    cheesefareWeek: 'Сырная седмица',
    greatLent: 'Великий пост',
    holyWeek: 'Страстная седмица',
    brightWeek: 'Светлая седмица',
    trinityWeek: 'Троицкая седмица',
    apostlesFast: 'Петров пост',
    dormitionFast: 'Успенский пост',
    nativityFast: 'Рождественский пост',
    christmastide: 'Святки',
  },
  majorFast: {
    greatLent: 'Великий пост',
    apostlesFast: 'Петров пост',
    dormitionFast: 'Успенский пост',
    nativityFast: 'Рождественский пост',
  },
  fastDay: {
    wednesday: 'Пост в среду',
    friday: 'Пост в пятницу',
    theophanyEve: 'Крещенский сочельник',
    beheadingOfJohn: 'Пост в день Усекновения главы Иоанна Предтечи',
    exaltationOfCross: 'Пост в день Воздвижения Креста',
  },
  feast: {
    pascha: 'Светлое Христово Воскресение',
    palmSunday: 'Вход Господень в Иерусалим',
    lazarusSaturday: 'Лазарева суббота',
    ascension: 'Вознесение Господне',
    pentecost: 'День Святой Троицы',
    nativityOfTheotokos: 'Рождество Пресвятой Богородицы',
    exaltationOfCross: 'Воздвижение Креста Господня',
    protectionOfTheotokos: 'Покров Пресвятой Богородицы',
    entryOfTheotokos: 'Введение во храм Пресвятой Богородицы',
    nativityOfChrist: 'Рождество Христово',
    circumcision: 'Обрезание Господне',
    theophany: 'Крещение Господне',
    meetingOfTheLord: 'Сретение Господне',
    annunciation: 'Благовещение Пресвятой Богородицы',
    nativityOfForerunner: 'Рождество Иоанна Предтечи',
    peterAndPaul: 'Святых апостолов Петра и Павла',
    transfiguration: 'Преображение Господне',
    dormition: 'Успение Пресвятой Богородицы',
    beheadingOfJohn: 'Усекновение главы Иоанна Предтечи',
  },
  level: {
    none: { title: 'Поста нет', detail: 'Сегодня разрешена любая пища.' },
    noMeat: { title: 'Без мяса', detail: 'Разрешены молочное, яйца и рыба.' },
    fish: { title: 'Разрешена рыба', detail: 'Разрешены рыба, вино и масло.' },
    oil: { title: 'Разрешены вино и масло', detail: 'Сегодня без рыбы.' },
    noOil: { title: 'Без масла', detail: 'Горячая пища без масла.' },
    xerophagy: {
      title: 'Сухоядение',
      detail: 'Хлеб, фрукты, овощи и орехи, без масла.',
    },
  },
  food: {
    meat: 'Мясо',
    dairy: 'Молочное и яйца',
    fish: 'Рыба',
    oil: 'Вино и масло',
  },
  note: {
    totalAbstinence: 'Кто в силах, сегодня полностью воздерживается от пищи.',
    caviarAllowed: 'Сегодня разрешена рыбная икра.',
    feastRelaxation: 'Ради праздника пост ослабляется.',
    fishDisputed:
      'Обычаи различаются: в одних рыба сегодня разрешена, в более строгих — нет. Спроси духовника.',
    wineOnly: 'Сегодня разрешено вино, но не елей.',
  },

  prayers: {
    title: 'Молитвы',
    summary: 'Отче наш, Символ веры, утренние и вечерние молитвы',
    smaller: 'Уменьшить текст',
    larger: 'Увеличить текст',
    group: { basic: 'Основные молитвы', daily: 'Молитвы дня' },
    text: prayerTexts,
  },

  updates: {
    check: 'Проверить обновления',
    disabled: 'В этой сборке обновления отключены.',
    checking: 'Проверка…',
    upToDate: 'У вас последняя версия.',
    downloading: 'Загрузка…',
    failed: 'Не удалось обновить. Попробуйте позже.',
  },
};
