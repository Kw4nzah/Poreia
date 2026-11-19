// Release notes shown in Settings > About > What's new. Newest version first.
// Wording is for the person using the app, not for developers; one short line per change.

import type { Language } from './i18n';

export interface ReleaseNote {
  version: string;
  notes: Record<Language, readonly string[]>;
}

export const RELEASE_NOTES: readonly ReleaseNote[] = [
  {
    version: '0.8.3',
    notes: {
      tr: ['Akşam hatırlatması artık yarın kuralın bugünden nasıl değiştiğini ilk satırda söylüyor.'],
      en: ['The evening reminder now says first how tomorrow’s rule differs from today’s.'],
      ru: ['Вечернее напоминание теперь сначала говорит, чем завтрашнее правило отличается от сегодняшнего.'],
    },
  },
  {
    version: '0.8.2',
    notes: {
      tr: ['Ayarlar’da yeni “Cihaz kontrolü”: güncellemeden sonra telefonda denenecekler için kısa bir liste.'],
      en: ['New “Device check” in Settings: a short list of things to try on your phone after an update.'],
      ru: ['В настройках появилась «Проверка на телефоне»: короткий список того, что стоит проверить после обновления.'],
    },
  },
  {
    version: '0.8.1',
    notes: {
      tr: ['Azizlerim: aziz mi azize mi olduğunu seçebilirsin; dualar buna göre yazılır.'],
      en: ['My saints: choose saint or female saint; the prayers follow your choice.'],
      ru: ['Мои святые: можно выбрать «святой» или «святая»; молитвы изменяются соответственно.'],
    },
  },
  {
    version: '0.8.0',
    notes: {
      tr: ['Yeni ince widget (4x1): bugünün oruç kuralı tek satırda.'],
      en: ['New slim widget (4x1): today’s fasting rule in one row.'],
      ru: ['Новый узкий виджет (4×1): сегодняшнее правило поста в одной строке.'],
    },
  },
  {
    version: '0.7.0',
    notes: {
      tr: [
        'Güvenlik için imzalı güncellemeler: uygulama yalnızca doğrulanmış güncellemeleri kabul eder.',
        'Ana ekran widget’ında başlıklar artık serif yazı tipiyle.',
        'Dua okuma kipinde ekran açık kalır.',
        'Bildirim yardımı: bildirimler gelmiyorsa telefonun bildirimle ilgili durumunu gösterir, ayarlara götürür ve deneme bildirimi gönderir.',
        'Bugün ekranında günün özeti.',
        'Ayarlar’da “Yenilikler” ve “Sorun bildir”.',
        'Oruç günlerinde yiyecek listesi yine ✓ ve ✕ işaretleriyle.',
        'Takvimde oruç tuttuğun günlerde nokta; “Günleri işaretle” ile geçmiş günleri toplu işaretleme.',
        'Favori dualar ve “Kaldığın yerden devam et”.',
        'Güncellemeler bölümünde sürümün yenilikleri.',
        'Bayram duaları: 19 bayramın tropar ve kondağı; bayram gününde Bugün ekranından açılır.',
        'İstersen bildirim alanında widget’taki bilgilerin hepsini gösteren kalıcı bir bildirim (Ayarlar > Bildirimler).',
      ],
      en: [
        'Signed updates for safety: the app only accepts verified updates.',
        'Serif titles in the home-screen widget.',
        'The screen stays awake in the prayer reading mode.',
        'Notification help: if notifications do not arrive, see what the phone reports, jump to the right settings and send a test notification.',
        'A summary of the day on the Today screen.',
        '“What’s new” and “Report a problem” in Settings.',
        'The food list is back with ✓ and ✕ marks on fasting days.',
        'A dot on the calendar for days you fasted, and “Mark days” to mark past days in bulk.',
        'Favourite prayers and “Continue where you left off”.',
        'This version’s news in the Updates section.',
        'Feast prayers: the troparion and kontakion of 19 feasts, opened from Today on the feast day.',
        'An optional persistent notification with everything the widget shows (Settings > Notifications).',
      ],
      ru: [
        'Подписанные обновления для безопасности: приложение принимает только проверенные обновления.',
        'Заголовки виджета на главном экране теперь с засечками.',
        'В режиме чтения молитв экран не гаснет.',
        'Помощь с уведомлениями: если уведомления не приходят, можно увидеть состояние на телефоне, перейти в нужные настройки и отправить тестовое уведомление.',
        'Сводка дня на экране «Сегодня».',
        'В настройках появились «Что нового» и «Сообщить о проблеме».',
        'В постные дни список продуктов снова с отметками ✓ и ✕.',
        'В календаре точка у дней, когда вы постились, и «Отметить дни» для массовой отметки прошедших дней.',
        'Избранные молитвы и «Продолжить с того места, где остановились».',
        'Новости версии в разделе «Обновления».',
        'Праздничные молитвы: тропарь и кондак 19 праздников, открываются с экрана «Сегодня» в день праздника.',
        'По желанию — постоянное уведомление со всей информацией виджета (Настройки > Уведомления).',
      ],
    },
  },
  {
    version: '0.6.1',
    notes: {
      tr: [
        'Oruç günlerini “oruç tutuyorum” diye işaretleme.',
        'Her oruç için dönem raporu.',
        'Ayarlar kategorilere ayrıldı.',
        'Uygulama güncellemesi indirilirken ilerleme penceresi ve iptal düğmesi.',
        'Listede yukarı dönmek için düğme; etkin sekmeye çift dokunmak da başa götürür.',
      ],
      en: [
        'Mark fasting days with “I’m fasting”.',
        'A report for each fast’s period.',
        'Settings are grouped into categories.',
        'A progress window with a cancel button while an app update downloads.',
        'A back-to-top button; double-tapping the active tab also scrolls to the top.',
      ],
      ru: [
        'Отметка дней поста: «Я пощусь».',
        'Отчёт за период каждого поста.',
        'Настройки разделены на категории.',
        'Окно с ходом загрузки и кнопкой отмены при скачивании обновления приложения.',
        'Кнопка «наверх»; двойное нажатие на активную вкладку тоже возвращает к началу.',
      ],
    },
  },
  {
    version: '0.6.0',
    notes: {
      tr: [
        'Bildirimlerde Ortodoks haçı simgesi.',
        'Ay takvimi ve gün ayrıntıları ekranı.',
        'Dua okuma kipi.',
        'Yiyecek arama: bugün hangi yiyecek serbest.',
        'Yaklaşan oruç ve bayramlar için geri sayım.',
        'Ayarları yedekleme ve geri yükleme; oruç ya da bayramdan önceki akşam hatırlatma.',
      ],
      en: [
        'The Orthodox cross as the notification icon.',
        'A month calendar and a day detail screen.',
        'A prayer reading mode.',
        'Food lookup: what is allowed today.',
        'A countdown to the coming fasts and feasts.',
        'Backup and restore of your settings; a reminder the evening before a fast or feast.',
      ],
      ru: [
        'Православный крест в значке уведомлений.',
        'Календарь на месяц и экран с подробностями дня.',
        'Режим чтения молитв.',
        'Поиск продуктов: что разрешено сегодня.',
        'Обратный отсчёт до ближайших постов и праздников.',
        'Резервная копия и восстановление настроек; напоминание накануне поста или праздника.',
      ],
    },
  },
  {
    version: '0.5.0',
    notes: {
      tr: [
        'Ana ekran widget’ı: günün orucu, serbest yiyecekler ve bayram.',
        'Yeni, sade bileşenlerle yenilenen arayüz.',
        'Aylık takvim.',
        'Dua arama ve günü paylaşma.',
        'Erişilebilirlik: daha okunaklı renkler, daha büyük dokunma alanları.',
      ],
      en: [
        'A home-screen widget with today’s fast, the allowed foods and the feast.',
        'A refreshed look built from simpler, consistent components.',
        'A monthly calendar.',
        'Prayer search and sharing the day.',
        'Accessibility: clearer colours and larger touch targets.',
      ],
      ru: [
        'Виджет на главном экране: пост дня, разрешённая пища и праздник.',
        'Обновлённый внешний вид из более простых единых элементов.',
        'Календарь на месяц.',
        'Поиск молитв и возможность поделиться днём.',
        'Доступность: более читаемые цвета и крупнее области нажатия.',
      ],
    },
  },
  {
    version: '0.4.1',
    notes: {
      tr: ['Alt çubukta seçili sekmenin yuvarlak vurgusu düzeltildi.'],
      en: ['The selected tab’s round highlight in the tab bar is fixed.'],
      ru: ['Исправлено круглое выделение выбранной вкладки в нижней панели.'],
    },
  },
  {
    version: '0.4.0',
    notes: {
      tr: [
        'Cam görünümlü, yüzen alt sekme çubuğu.',
        '“Azizlerim”: seçtiğin azizler sabah ve akşam dualarında anılır.',
        'Okumalar için YouVersion bağlantıları (Türkçe, İngilizce, Rusça).',
        'Rusça Eski Antlaşma okumaları.',
        'Manasse’nin Duası.',
        '2028–2030 takvim ve okuma verileri.',
        'Ayarlar’da projenin GitHub bağlantısı.',
      ],
      en: [
        'A floating tab bar with a glass effect.',
        '“My saints”: the saints you choose are named in the morning and evening prayers.',
        'YouVersion links for the readings (Turkish, English, Russian).',
        'Russian Old Testament readings.',
        'The Prayer of Manasseh.',
        'Calendar and reading data for 2028–2030.',
        'A link to the project on GitHub in Settings.',
      ],
      ru: [
        'Плавающая нижняя панель со стеклянным эффектом.',
        '«Мои святые»: выбранные вами святые поминаются в утренних и вечерних молитвах.',
        'Ссылки YouVersion на чтения (турецкий, английский, русский).',
        'Чтения из Ветхого Завета на русском.',
        'Молитва Манассии.',
        'Календарь и чтения на 2028–2030 годы.',
        'Ссылка на проект на GitHub в настройках.',
      ],
    },
  },
];

/** Notes of one language, newest version first. */
export function releaseNotesFor(
  language: Language,
): { version: string; notes: readonly string[] }[] {
  return RELEASE_NOTES.map(({ version, notes }) => ({ version, notes: notes[language] }));
}

/** True when `version` is the one installed (ignores a build suffix such as "0.7.0-rc.1"). */
export function isInstalledVersion(version: string, installed: string | null | undefined): boolean {
  return !!installed && installed.split(/[-+]/)[0] === version;
}

/** Notes for one version in one language, or null when this build has none for it. */
export function notesForVersion(language: Language, version: string): readonly string[] | null {
  const entry = RELEASE_NOTES.find((note) => note.version === version.replace(/^v/i, ''));
  return entry ? entry.notes[language] : null;
}
