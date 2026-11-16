import type { Messages } from './en';
import { prayerTexts } from './prayers/tr';

export const tr: Messages = {
  languageName: 'Türkçe',
  weekdays: ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'],
  months: [
    'Ocak',
    'Şubat',
    'Mart',
    'Nisan',
    'Mayıs',
    'Haziran',
    'Temmuz',
    'Ağustos',
    'Eylül',
    'Ekim',
    'Kasım',
    'Aralık',
  ],
  date: (day, month, year) => `${day} ${month} ${year}`,
  dayMonth: (day, month) => `${day} ${month}`,

  onboarding: {
    tagline: 'Kilisenin oruçlarında yol arkadaşın',
    languageTitle: 'Dilini seç',
    nameTitle: 'Sana nasıl hitap edelim?',
    nameHint: 'Yalnızca seni selamlamak için. Bu telefonda kalır.',
    namePlaceholder: 'Adın',
    churchTitle: 'Hangi geleneği izliyorsun?',
    churchHint: 'Takvim ve oruç âdetleri buna göre belirlenir.',
    next: 'Devam',
    back: 'Geri',
    start: 'Başla',
  },
  church: {
    greek: { name: 'Rum (Yunan) geleneği', calendar: 'Yeni takvim' },
    russian: { name: 'Rus geleneği', calendar: 'Eski (Jülyen) takvim' },
  },

  tabs: { today: 'Bugün', readings: 'Okumalar' },

  today: {
    greeting: (name) => (name ? `Hoş geldin, ${name}` : 'Hoş geldin'),
    churchDate: (date) => `Kilise takvimi: ${date}`,
    feast: 'Bayram',
    dayOf: (day, total) => `${total} günün ${day}. günü`,
    daysLeft: (days) => `${days} gün kaldı`,
    lastDay: 'Son gün',
    upcomingTitle: 'Sıradaki oruç',
    startsIn: (days) => (days === 1 ? 'Yarın başlıyor' : `${days} gün sonra başlıyor`),
    daysToPascha: (days) => `Paskalya'ya ${days} gün`,
    disclaimer:
      'Kilise takvimlerine dayanan genel bir rehberdir. Yerel âdet ve ruhani babanın öğüdü önce gelir. Azizlerin anma günlerinde verilen izinlerin yalnızca bir kısmı yer alır.',
    settings: 'Ayarlar',
    newVersion: 'Yeni sürüm kurulmaya hazır',
  },

  settings: {
    title: 'Ayarlar',
    back: 'Geri',
    name: 'Ad',
    church: 'Gelenek',
    fishTitle: 'Noel ve Havariler Orucu’nda balık',
    fishHint: 'Rum kaynakları ayrışıyor. Cemaatinin izlediği kuralı seç.',
    fish: {
      unsure: { title: 'Emin değilim', subtitle: 'Katı olanı göster, tartışmalı günleri işaretle' },
      weekends: { title: 'Yalnızca hafta sonu', subtitle: 'Cumartesi ve Pazar günleri balık' },
      studite: { title: 'Salı, Perşembe ve hafta sonu', subtitle: 'Studios tipikonu' },
      greece: { title: 'Çarşamba ve Cuma dışında her gün', subtitle: 'Yunanistan Kilisesi, GOARCH' },
    },
    language: 'Dil',
    updatesTitle: 'Güncellemeler',
    version: (version) => `Sürüm ${version}`,
    apkAvailable: (version) => `${version} sürümü yayında`,
    contentUpdated: (when) => `İçerik güncellemesi: ${when}`,
    contentShipped: 'İçerik uygulamayla gelen haliyle',
    apkInstall: (megabytes) => `İndir ve kur (${megabytes} MB)`,
    apkDownloading: 'İndiriliyor…',
    apkFailed: 'İndirilemedi. Daha sonra yeniden dene.',
    notificationsTitle: 'Günlük bildirim',
    notificationsToggle: 'Her sabah günün orucu',
    notificationsTime: 'Saat',
    notificationsDenied:
      'Poreia için bildirimler kapalı. Telefon ayarlarından izin ver, sonra burayı yeniden aç.',
    notificationsChannel: 'Günlük oruç',
  },

  period: {
    publicanWeek: 'Vergi Görevlisi ve Ferisi Haftası',
    cheesefareWeek: 'Peynir Haftası',
    greatLent: 'Büyük Oruç',
    holyWeek: 'Kutsal Hafta',
    brightWeek: 'Aydınlık Hafta',
    trinityWeek: 'Pentikost sonrası hafta',
    apostlesFast: 'Havariler Orucu',
    dormitionFast: 'Meryem Ana Orucu',
    nativityFast: 'Noel Orucu',
    christmastide: 'Noel günleri',
  },
  majorFast: {
    greatLent: 'Büyük Oruç',
    apostlesFast: 'Havariler Orucu',
    dormitionFast: 'Meryem Ana Orucu',
    nativityFast: 'Noel Orucu',
  },
  fastDay: {
    wednesday: 'Çarşamba orucu',
    friday: 'Cuma orucu',
    theophanyEve: 'Teofani arifesi',
    beheadingOfJohn: 'Vaftizci Yahya’nın şehadeti orucu',
    exaltationOfCross: 'Haç’ın Yüceltilmesi orucu',
  },
  feast: {
    pascha: 'Kutsal Paskalya',
    palmSunday: 'Palmiye Pazarı',
    lazarusSaturday: 'Lazar Cumartesisi',
    ascension: 'Rab’bin Göğe Yükselişi',
    pentecost: 'Pentikost',
    nativityOfTheotokos: 'Meryem Ana’nın Doğuşu',
    exaltationOfCross: 'Kutsal Haç’ın Yüceltilmesi',
    protectionOfTheotokos: 'Meryem Ana’nın Koruyuculuğu',
    entryOfTheotokos: 'Meryem Ana’nın Tapınağa Girişi',
    nativityOfChrist: 'Mesih’in Doğuşu',
    circumcision: 'Rab’bin Sünneti',
    theophany: 'Kutsal Teofani',
    meetingOfTheLord: 'Rab’bin Tapınağa Sunuluşu',
    annunciation: 'Müjde Bayramı',
    nativityOfForerunner: 'Vaftizci Yahya’nın Doğuşu',
    peterAndPaul: 'Kutsal Havariler Petrus ve Pavlus',
    transfiguration: 'Rab’bin Görünüm Değiştirmesi',
    dormition: 'Meryem Ana’nın Uykuya Dalışı',
    beheadingOfJohn: 'Vaftizci Yahya’nın Başının Kesilmesi',
  },
  level: {
    none: { title: 'Oruç yok', detail: 'Bugün her şey yenebilir.' },
    noMeat: { title: 'Et yok', detail: 'Süt ürünleri, yumurta ve balık serbest.' },
    fish: { title: 'Balık serbest', detail: 'Balık, şarap ve zeytinyağı serbest.' },
    oil: { title: 'Şarap ve zeytinyağı serbest', detail: 'Bugün balık yok.' },
    noOil: { title: 'Yağsız', detail: 'Yağsız pişirilmiş yemekler.' },
    xerophagy: {
      title: 'Kuru yeme',
      detail: 'Ekmek, meyve, sebze ve kuruyemiş; yağ yok.',
    },
  },
  food: {
    meat: 'Et',
    dairy: 'Süt ürünleri ve yumurta',
    fish: 'Balık',
    oil: 'Şarap ve zeytinyağı',
  },
  note: {
    totalAbstinence: 'Gücü yetenler bugün hiçbir şey yemeden oruç tutar.',
    caviarAllowed: 'Bugün balık yumurtası serbest.',
    feastRelaxation: 'Bayram nedeniyle oruç hafifletilir.',
    fishDisputed:
      'Balık konusunda gelenekler ayrışıyor: bazıları bugün balığa izin verir, daha katı olanlar vermez. Ruhani babana danış.',
    wineOnly: 'Bugün yalnızca şarap serbest, zeytinyağı değil.',
  },

  prayers: {
    title: 'Dualar',
    summary: 'Göklerdeki Babamız, İman İkrarı, sabah ve akşam duaları',
    smaller: 'Yazıyı küçült',
    larger: 'Yazıyı büyüt',
    group: { basic: 'Temel dualar', daily: 'Günün duaları', lent: 'Büyük Perhiz' },
    text: prayerTexts,
  },

  // Unreviewed by the user: church terms and book names.
  readings: {
    title: 'Azizler ve okumalar',
    saints: 'Günün azizleri',
    readings: 'Okumalar',
    more: (count) => `+${count} daha`,
    namesEnglish: 'Adlar İngilizce gösterilir.',
    textEnglish: 'Türkçe metin henüz yok, İngilizcesi gösteriliyor.',
    openTurkish: 'Türkçesini aç (KKDEU, Kutsal Kitap ve Deuterokanonik Kitaplar)',
    service: (service) => {
      const part = { gospel: 'İncil', epistle: 'Mektup', prophecy: 'Peygamberlik okuması' };
      const kind = service.part ? part[service.part] : '';
      const n = service.n ? service.n + '. ' : '';
      switch (service.kind) {
        case 'vespers':
          return service.part === 'gospel' ? 'Akşam Ayini İncili' : 'Akşam Ayini';
        case 'matins':
          return (
            n +
            'Sabah Ayini' +
            (service.part === 'gospel' ? ' İncili' : service.part === 'epistle' ? ' Mektubu' : '')
          );
        case 'hour':
          return n + 'Saat' + (kind ? ', ' + kind : '');
        case 'passion':
          return n + 'Çile İncili';
        case 'waters':
          return 'Büyük Ayazma Takdisi';
        case 'cross':
          return 'Haç Alayı';
      }
    },
    noData: 'Bu yıl için henüz aziz ve okuma verisi yok.',
    epistle: 'Mektup',
    gospel: 'İncil',
    group: {
      liturgy: 'İlahi Liturji',
      vespers: 'Akşam Ayini',
      matins: 'Sabah Ayini',
      hours: 'Saat Ayinleri',
      other: 'Diğer ayinler',
    },
  },

  sources: {
    title: 'Kaynaklar ve lisanslar',
    sections: [
      { heading: 'Kutsal Kitap metinleri', body: 'İngilizce okumalar: Yeni Ahit Berean Standard Bible’dan, Eski Ahit ve deuterokanon İngilizce Septuaginta’dan (LXX2012). Rusça okumalar: Sinodal Çeviri (1876). Rusça Eski Ahit okumaları yalnızca Sinodal bölümün Septuaginta bölümüyle ayet ayet örtüştüğü yerlerde gösterilir; Sinodal metin İbranice metne dayandığı için kilisede okunandan sözcük olarak ayrılabilir. Üçü de kamu malıdır; metinler eBible.org’dan alındı, işaretlemeler kaldırıldı ve yalnızca her okumanın ayetleri tutuldu.' },
      { heading: 'Kutsal Kitap metinleri, Türkçe', body: 'Türkçe okumalar bible.com üzerinde Kutsal Kitap ve Deuterokanonik Kitaplar’da (KKDEU, Türkiye Kitab-ı Mukaddes Şirketi) açılır. Metin telifli olduğu için bu uygulamada saklanmaz. Bağlantıyı açmadıkça İngilizcesi gösterilir.' },
      { heading: 'Azizler ve okumalar', body: 'Azizlerin adları, bayram günleri ve okuma başvuruları orthocal.info’dan gelir (Amerika Ortodoks Kilisesi lectionary’si; projenin kodu MIT lisanslıdır). Yalnızca adlar ve başvurular kullanılır, azizlerin hayatları kullanılmaz.' },
      { heading: 'Dualar, İngilizce', body: 'Göklerdeki Babamız, İman İkrarı, Göksel Kral, Trisagion ve Aziz Efrem’in Duası: Orthodox Daily Prayers (St Tikhon’s Seminary Press, 1982), Project Gutenberg (#34981) yayınından. Sabah, akşam ve yemek dualarının İngilizcesi bu uygulama için Slavca ve Yunanca metinlerden hazırlanmış sadık çevirilerdir. Manaşşe’nin Duası King James Version’dandır (Apocrypha, kamu malı).' },
      { heading: 'Dualar, Rusça', body: 'Kamu malı Kilise Slavcası metinleri, azbyka.ru (Молитвослов) ile karşılaştırılmıştır.' },
      { heading: 'Dualar, Türkçe', body: 'Bu uygulama için çevrilmiştir. Karşılaştırılacak yayımlanmış bir Türkçe dua kitabı yoktur; bu yüzden kilisenizde kullanılan metinden farklı olabilir.' },
      { heading: 'Oruç kuralları', body: 'Rum ve Rus geleneklerinin yayımlanmış kurallarına dayanır. Uygulama kiliseler ve piskoposluklar arasında değişir; ruhani babanıza danışın.' },
      { heading: 'Bu uygulama hakkında', body: 'Poreia kişisel bir yardımcıdır, hiçbir kilisenin resmî yayını değildir. Simge bu uygulama için çizildi.' },
    ],
  },

  updates: {
    check: 'Güncellemeleri denetle',
    disabled: 'Bu sürümde güncellemeler kapalı.',
    checking: 'Denetleniyor…',
    upToDate: 'En güncel sürümü kullanıyorsun.',
    downloading: 'İndiriliyor…',
    failed: 'Güncelleme başarısız. Daha sonra yeniden dene.',
  },
};
