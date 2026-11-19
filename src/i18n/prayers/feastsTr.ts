// Turkish texts of the feast hymns (troparion and kontakion of each feast). There is no published
// Orthodox Turkish source for these, so each is a translation made for this app FROM THE ENGLISH
// OCA text (see feastsEn.ts), in the register of the Turkish liturgy in CJOC XVII/3 (Allah, Baba,
// Oğul, Kutsal Ruh, Allahdoğuran, yücelik). NOT reviewed by a Turkish-speaking Orthodox: every
// text carries a note saying so, and the drafts are listed in feast-prayers-tr-review.md.

import type { FeastPrayerId, PrayerText } from '../../prayers';

const NOTE = 'Türkçe metin çeviridir ve gözden geçirilmektedir.';

export const feastPrayerTexts: Record<FeastPrayerId, PrayerText> = {
  nativityOfTheotokos: {
    title: 'Meryem Ana’nın Doğuşu',
    note: NOTE,
    sections: [
      { heading: 'Troparion', paragraphs: ['Doğuşun, ey Bakire, bütün evrene sevinç müjdeledi!\nDoğruluk Güneşi, Allahımız Mesih,\nsenden doğdu, ey Allahdoğuran!\nLaneti kaldırarak\nkutsama bağışladı.\nÖlümü yok ederek bize sonsuz Yaşam armağan etti.'] },
      { heading: 'Kontakion', paragraphs: ['Doğuşunla, ey En Arı Bakire,\nYoakim ve Anna kısırlıktan,\nAdem ve Havva ölümün çürümesinden kurtuldu.\nBiz de, senin halkın, günah suçundan kurtulmuş olarak bayram eder ve sana ezgi söyleriz:\n“Kısır kadın, yaşamımızı besleyen Allahdoğuran’ı doğurur.”'] },
    ],
  },
  exaltationOfCross: {
    title: 'Kutsal Haç’ın Yüceltilmesi',
    note: NOTE,
    sections: [
      { heading: 'Troparion', paragraphs: ['Ya Rab, halkını kurtar\nve mirasını kutsa.\nOrtodoks Hıristiyanlara\ndüşmanları üzerinde zaferler bağışla.\nVe Haç’ının gücüyle\nbarınağını koru.'] },
      { heading: 'Kontakion', paragraphs: ['Bizim uğrumuzda isteyerek Haç’a yükseltildiğin gibi,\nAdınla anılanlara merhamet göster, ey Allah olan Mesih;\ntüm Ortodoks Hıristiyanları gücünle sevindir,\nonlara düşmanları üzerinde zaferler bağışla,\nonlara yenilmez zafer simgesini, Barış silahını armağan ederek.'] },
    ],
  },
  protectionOfTheotokos: {
    title: 'Meryem Ana’nın Koruyuculuğu',
    note: NOTE,
    sections: [
      { heading: 'Troparion', paragraphs: ['Bugün biz, Ortodoks halk, sevinçle bayram ediyoruz,\nsenin gelişinle aydınlanarak, ey Allahdoğuran;\nve en arı suretine bakarak yürek sızısıyla haykırıyoruz:\n“Koruyucu Örtünle bizi ört ve bizi her kötülükten kurtar,\nOğlun, Allahımız Mesih’e, canlarımızı kurtarması için yalvararak.”'] },
      { heading: 'Kontakion', paragraphs: ['Bugün Bakire kilisede duruyor,\nve azizler topluluklarıyla birlikte görünmez biçimde bizim için Allah’a dua ediyor.\nMelekler piskoposlarla birlikte tapınıyor,\nve Havariler Peygamberlerle birlikte seviniyor,\nçünkü Allahdoğuran bizim için Öncesiz Allah’a dua ediyor.'] },
    ],
  },
  entryOfTheotokos: {
    title: 'Meryem Ana’nın Tapınağa Girişi',
    note: NOTE,
    sections: [
      { heading: 'Troparion', paragraphs: ['Bugün Allah’ın iyi isteğinin ön belirtisi,\ninsanlığın kurtuluşunun müjdesidir.\nBakire Allah’ın tapınağında görünür,\nMesih’i herkese önceden duyurarak.\nSevinelim\nve ona ezgi söyleyelim:\n“Sevin, ey Yaratıcı’nın tasarısının gerçekleşmesi.”'] },
      { heading: 'Kontakion', paragraphs: ['Kurtarıcı’nın en arı Tapınağı,\ndeğerli Oda ve Bakire,\nAllah’ın yüceliğinin kutsal Hazinesi,\nbugün Rab’bin evine sunulur.\nYanında Ruh’un lütfunu getirir,\nbu yüzden Allah’ın melekleri onu över:\n“Bu kadın gerçekten göğün konutudur.”'] },
    ],
  },
  nativityOfChrist: {
    title: 'Mesih’in Doğuşu',
    note: NOTE,
    sections: [
      { heading: 'Troparion', paragraphs: ['Doğuşun, ey Allahımız Mesih,\ndünyaya bilgi Işığını parlattı;\nçünkü onunla yıldızlara tapanlar\nbir yıldız aracılığıyla Sana tapmayı öğrendi,\nDoğruluk Güneşi olan Seni\nve Yücelerden Doğan Şafak olan Seni tanımayı.\nYa Rab, Sana yücelik!'] },
      { heading: 'Kontakion', paragraphs: ['Bugün Bakire Aşkın Olan’ı doğuruyor,\nve yeryüzü Erişilmez Olan’a bir mağara sunuyor!\nMeleklerle çobanlar O’nu yüceltiyor.\nBilge adamlar bir yıldızla yol alıyor,\nçünkü bizim uğrumuzda Öncesiz Allah genç bir Çocuk olarak doğdu.'] },
    ],
  },
  circumcision: {
    title: 'Rab’bin Sünneti',
    note: NOTE,
    sections: [
      { heading: 'Troparion', paragraphs: ['Sonsuz Baba ve ilahi Ruhunla yücelerde tahtta oturan,\nEy İsa, evlenmemiş kulun, Annenden yeryüzünde doğmak istedin.\nBu yüzden sekiz günlük Çocuk olarak sünnet edildin.\nEn lütufkâr tasarına yücelik;\nkurtarış düzenine yücelik;\nalçalmana yücelik, ey tek İnsanseven.'] },
      { heading: 'Kontakion', paragraphs: ['Her şeyin Rabbi sünnet edilmeyi kabul eder,\nböylece, iyi olduğu için, ölümlü insanların günahlarını keser.\nBugün dünyaya kurtuluş bağışlar,\nYaratıcımızın baş kâhini, ışık taşıyan Vasil\ngökte Mesih’in ilahi sırlarına erdirilmiş biri olarak sevinir.'] },
    ],
  },
  theophany: {
    title: 'Kutsal Teofani',
    note: NOTE,
    sections: [
      { heading: 'Troparion', paragraphs: ['Sen, ey Rab, Ürdün’de vaftiz edildiğinde\nKutsal Üçleme’ye tapınma açığa çıktı;\nçünkü Baba’nın sesi Sana tanıklık etti\nve Seni sevgili Oğlu diye çağırdı.\nVe Ruh, güvercin biçiminde,\nsözünün doğruluğunu doğruladı.\nEy Mesih, Allahımız, Kendini açığa vurdun\nve dünyayı aydınlattın, Sana yücelik!'] },
      { heading: 'Kontakion', paragraphs: ['Bugün dünyaya göründün, ey Rab,\nve yüzünün ışığı üzerimizde işaretlendi.\nSeni tanıyarak Sana ezgiler söyleriz.\nGeldin ve Kendini açığa vurdun,\nEy erişilmez Işık.'] },
    ],
  },
  meetingOfTheLord: {
    title: 'Rab’bin Tapınağa Sunuluşu',
    note: NOTE,
    sections: [
      { heading: 'Troparion', paragraphs: ['Sevin, ey lütuf dolu Bakire Allahdoğuran;\nçünkü senden Doğruluk Güneşi, Allahımız Mesih doğdu,\nkaranlıkta olanlara ışık vererek.\nSevin, ey doğru Yaşlı;\nçünkü sen canlarımızın Kurtarıcısını kollarına aldın,\nBize dirilişi bağışlayanı.'] },
      { heading: 'Kontakion', paragraphs: ['Doğuşunla bakire rahmi kutsadın,\nve Simeon’un ellerini layıkıyla kutsadın, ey Allah olan Mesih;\nşimdi bile bizi önceden kurtardın.\nSevdiğin sadık halkına barış ver, ey tek İnsanseven.'] },
    ],
  },
  annunciation: {
    title: 'Müjde Bayramı',
    note: NOTE,
    sections: [
      { heading: 'Troparion', paragraphs: ['Bugün kurtuluşumuzun başlangıcı,\nöncesiz sırrın açığa çıkışıdır!\nAllah’ın Oğlu Bakire’nin Oğlu olur,\nCebrail Lütuf’un gelişini müjdelerken.\nOnunla birlikte Allahdoğuran’a haykıralım:\nSevin, ey lütuf dolu,\nRab seninledir!'] },
      { heading: 'Kontakion', paragraphs: ['Ey Zafer Kazanmış Orduların Zaferli Önderi!\nBiz kulların, kötülükten kurtularak, sana şükran ezgisi söyleriz, ey Allahdoğuran!\nYenilmez güce sahip olduğun için bizi her felaketten kurtar,\nböylece söyleyelim: Sevin, ey evlenmemiş Gelin!'] },
    ],
  },
  nativityOfForerunner: {
    title: 'Vaftizci Yahya’nın Doğuşu',
    note: NOTE,
    sections: [
      { heading: 'Troparion', paragraphs: ['Mesih’in gelişinin Peygamberi ve Öncüsü,\nSeni layıkıyla överemesek de,\ndoğuşunda seni sevgiyle onurlandırırız;\nçünkü onunla babanın suskunluğuna ve annenin kısırlığına son verdin,\nAllah’ın Oğlu’nun beden alışını dünyaya ilan ederek!'] },
      { heading: 'Kontakion', paragraphs: ['Bugün önceden kısır olan kadın Mesih’in Öncüsü’nü doğuruyor,\nO, her peygamberliğin gerçekleşmesidir;\nçünkü Ürdün’de,\npeygamberlerin önceden bildirdiği Olan’ın üzerine elini koyduğunda,\nAllah Sözü’nün Peygamberi, Müjdecisi ve Öncüsü olarak ortaya çıktı.'] },
    ],
  },
  peterAndPaul: {
    title: 'Kutsal Havariler Petrus ve Pavlus',
    note: NOTE,
    sections: [
      { heading: 'Troparion', paragraphs: ['Ey Havarilerin en önde gelenleri ve yerleşik dünyanın öğretmenleri,\nher şeyin Efendisi’ne aracılık edin,\ndünyaya barış ve canlarımıza büyük merhamet bağışlasın.'] },
      { heading: 'Kontakion', paragraphs: ['Ey Rab, sağlam ve ilahi esinli Müjdecileri, Havarilerin Önderlerini,\nSenin iyiliklerinin tadına varmaları ve dinlenmeleri için kabul ettin.\nÇünkü onların emeklerini ve ölümlerini her yakmalık sunudan daha büyük olarak tanıdın,\nçünkü yalnız Sen insanların yüreklerindekini bilirsin.'] },
    ],
  },
  transfiguration: {
    title: 'Rab’bin Görünüm Değiştirmesi',
    note: NOTE,
    sections: [
      { heading: 'Troparion', paragraphs: ['Dağda görünüşünü değiştirdin, ey Allah olan Mesih,\nöğrencilerine yüceliğini taşıyabildikleri ölçüde göstererek.\nSonsuz Işığın günahkârlar olan bizim üzerimize de parlasın,\nAllahdoğuran’ın dualarıyla.\nEy Işık Veren, Sana yücelik!'] },
      { heading: 'Kontakion', paragraphs: ['Dağda görünüşünü değiştirdin, ey Allah olan Mesih,\nve öğrencilerin yüceliğini görebildikleri kadar gördüler;\nböylece Seni Haç’a gerilmiş gördüklerinde,\nçektiğin acının isteyerek olduğunu anlasınlar\nve dünyaya ilan etsinler\nki Sen gerçekten Baba’nın Parlaklığısın!'] },
    ],
  },
  dormition: {
    title: 'Meryem Ana’nın Uykuya Dalışı',
    note: NOTE,
    sections: [
      { heading: 'Troparion', paragraphs: ['Doğururken bekâretini korudun,\nve uykuya dalarken dünyayı terk etmedin, ey Allahdoğuran.\nYaşamın Anası olarak yaşama geçtin,\nve dualarınla canlarımızı ölümden kurtarırsın.'] },
      { heading: 'Kontakion', paragraphs: ['Ne mezar ne ölüm Allahdoğuran üzerinde güç buldu;\no, dualarında uyumayan ve korumasında değişmez umuttur.\nÇünkü Yaşamın Anası olarak,\nbakire rahminde yaşayan O tarafından yaşama nakledildi.'] },
    ],
  },
  beheadingOfJohn: {
    title: 'Vaftizci Yahya’nın Başının Kesilmesi',
    note: NOTE,
    sections: [
      { heading: 'Troparion', paragraphs: ['Doğruların anısı övgü ezgileriyle kutlanır,\nama sana, ey Öncü, Rab’bin tanıklığı yeter.\nPeygamberlerin en onurlusu olduğun gerçekten ortaya çıktı,\nçünkü peygamberlerin önceden bildirdiği Olan’ı Ürdün sularında vaftiz etmeye layık görüldün.\nBu yüzden, gerçek uğruna sevinçle acı çekerek,\nbedende görünen Allah’ı ölüler diyarındakilere müjdeledin;\nO, dünyanın günahını kaldıran\nve bize büyük merhamet bağışlayandır.'] },
      { heading: 'Kontakion', paragraphs: ['Öncü’nün görkemli başının kesilmesi\nAllah’ın bir tasarısının işi oldu,\nçünkü o, ölüler diyarındakilere Kurtarıcı’nın gelişini vaaz etti.\nHerodiya ağlasın, çünkü yasasız cinayeti dilemişti,\nAllah’ın yasasını sevmeden, sonsuz yaşamı da sevmeden,\nama yalan ve geçici olanı sevdi.'] },
    ],
  },
  pascha: {
    title: 'Kutsal Paskalya',
    note: NOTE,
    sections: [
      { heading: 'Troparion', paragraphs: ['Mesih ölülerden dirildi,\nölümü ölümle çiğneyerek,\nve mezardakilere yaşam bağışlayarak!'] },
      { heading: 'Kontakion', paragraphs: ['Ey Ölümsüz, mezara indin,\nölümün gücünü yıktın.\nZaferle dirildin, ey Allah olan Mesih,\nMür Taşıyan Kadınlar’a “Sevinin!” diye müjdeleyerek,\nHavarilerine barış bağışlayarak ve düşmüşlere diriliş armağan ederek.'] },
    ],
  },
  palmSunday: {
    title: 'Palmiye Pazarı',
    note: NOTE,
    sections: [
      { heading: 'Troparion', paragraphs: ['Acı çekmenden önce Lazar’ı ölülerden diriltmekle\ngenel dirilişi doğruladın, ey Allah olan Mesih!\nZafer palmiyelerini taşıyan çocuklar gibi\nSana haykırıyoruz, ey ölümü Yenen:\nEn Yücelerde Hosana!\nRab’bin Adıyla Gelen Kutsanmıştır!'] },
      { heading: 'Kontakion', paragraphs: ['Gökte tahtında oturan,\nyeryüzünde bir tayın üzerinde taşınan, ey Allah olan Mesih!\nMeleklerin övgüsünü ve “Adem’i geri çağırmak için Gelen Kutsanmıştır!” diye ezgi söyleyen çocukların ezgilerini kabul et.'] },
    ],
  },
  lazarusSaturday: {
    title: 'Lazar Cumartesisi',
    note: NOTE,
    sections: [
      { heading: 'Troparion', paragraphs: ['Acı çekmenden önce Lazar’ı ölülerden diriltmekle\ngenel dirilişi doğruladın, ey Allah olan Mesih!\nZafer palmiyelerini taşıyan çocuklar gibi\nSana haykırıyoruz, ey ölümü Yenen:\nEn Yücelerde Hosana!\nRab’bin Adıyla Gelen Kutsanmıştır!'] },
      { heading: 'Kontakion', paragraphs: ['Mesih, herkesin Sevinci, Gerçeği ve Işığı,\nDünyanın Yaşamı ve Dirilişi\niyiliğiyle yeryüzündekilere göründü.\nDirilişimizin Sureti oldu,\nherkese ilahi bağışlanma armağan ederek!'] },
    ],
  },
  ascension: {
    title: 'Rab’bin Göğe Yükselişi',
    note: NOTE,
    sections: [
      { heading: 'Troparion', paragraphs: ['Ey Allah olan Mesih, yücelikle yükseldin,\nKutsal Ruh vaadiyle öğrencilerine sevinç bağışlayarak.\nBu kutsama aracılığıyla onlara güvence verildi\nki Sen Allah’ın Oğlu’sun,\ndünyanın Kurtarıcısı’sın!'] },
      { heading: 'Kontakion', paragraphs: ['Bizim uğrumuzda kurtarış tasarını tamamlayıp\nyeryüzünü göğe birleştirdikten sonra:\nyücelikle yükseldin, ey Allahımız Mesih,\nSeni sevenlerden ayrılmayarak,\nonlarla kalıp haykırarak:\n“Ben sizinle birlikteyim ve kimse size karşı olmayacak!”'] },
    ],
  },
  pentecost: {
    title: 'Pentikost',
    note: NOTE,
    sections: [
      { heading: 'Troparion', paragraphs: ['Kutsalsın, ey Allahımız Mesih,\nbalıkçıları en bilge olarak gösterdin,\nonların üzerine Kutsal Ruh’u göndererek;\nonlar aracılığıyla dünyayı ağına çektin,\nEy İnsanseven, Sana yücelik!'] },
      { heading: 'Kontakion', paragraphs: ['En Yüce olan inip dilleri karıştırdığında,\nulusları böldü;\nama ateş dillerini dağıttığında\nherkesi birliğe çağırdı.\nBu yüzden, tek ağızdan, Çok Kutsal Ruh’u yüceltiriz!'] },
    ],
  },
};
