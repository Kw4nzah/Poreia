// Turkish prayer texts: the user's own translations and corrections (file
// ortodoks_dualar_tr_ru_en.md, 2026-11-17), set in the Allah / no-Protestant-wording register
// the user asked for ("Tanrı" -> "Allah", "esenlik" -> "barış").
// There is no published Turkish prayer book to check them against; the file's own note says the
// texts after the Lord's Prayer and the Creed were translated from the Greek/Slavonic originals.
// The Creed wording used for comparison earlier was the Turkish Divine Liturgy of St John
// Chrysostom in The Canadian Journal of Orthodox Christianity XVII/3 (2022).

import type { PrayerText, RegularPrayerId } from '../../prayers';

// Table prayers (mealsBreakfast, mealsLunch, mealsDinner): İbâdetnâme, Ortodokslar Topluluğu
// (Antakya), "Öğlen ve akşam yemeklerinde vâcip olan duâlar" and the Axion Estin of the morning
// order: www.ortodokslartoplulugu.com/ayinler-dualar/ibadetname/. That book gives lunch and supper
// only; the breakfast order is assembled from the same book's pieces (see the note below). The
// wording is the book's own (Peder, hamdolsun, duâ), which differs from the user's translations
// above; it is kept as printed so the text can be compared with the source.
const TABLE_GLORY = 'Hamdolsun Peder’e ve Oğul’a ve Aziz Ruh’a. Şimdi ve dâima ve ebetler ebedince. Âmin.';
const TABLE_KYRIE = 'Ya Rab merhamet eyle. (3 defa)';
const TABLE_PANAGIA =
  'Ey tamâmen Aziz Üçleme, bize merhamet eyle. Ya Rab, günahlarımızı bağışla. Ey Efendi, suçlarımızı affeyle. Ey Aziz, nazar edip zayıflıklarımıza şifâ ver, senin ismin hürmetine.';
const TABLE_BLESSING_CLERGY =
  'Rûhânî varsa: Ey Mesih Allah, kullarının yiyeceğini ve içeceğini mübârek kıl, çünkü sen her zaman azizsin, şimdi ve dâima ve ebetler ebedince. Âmin.';
const TABLE_LAY_ENDING =
  'Rûhânî yoksa: Aziz Pederlerimizin duâlarıyla, ya Rab İsa Mesih Allah, bize merhamet eyle. Âmin.';
const TABLE_BREAKFAST_NOTE =
  'Kaynakta kahvaltı için ayrı duâ yoktur. Bu sıra, aynı kaynaktaki duâlardan Slav geleneğindeki kahvaltı düzenine göre derlenmiştir ve henüz gözden geçirilmemiştir.';

export const prayerTexts: Record<RegularPrayerId, PrayerText> = {
  lordsPrayer: {
    title: 'Göklerdeki Babamız',
    sections: [
      {
        paragraphs: [
          'Göklerdeki Babamız, adın kutsal kılınsın. Hükümranlığın gelsin. Gökte olduğu gibi, yeryüzünde de Senin istediğin olsun.',
          'Bugün bize gündelik ekmeğimizi ver. Bize karşı suç işleyenleri bağışladığımız gibi, sen de bizim suçlarımızı bağışla. Ayartılmamıza izin verme. Kötü olandan bizi kurtar. Çünkü hükümranlık, güç ve yücelik Senindir, Baba’nın ve Oğul’un ve Aziz Ruh’un, şimdi ve daima ve ebetler ebedince. Âmin.',
        ],
      },
    ],
  },
  creed: {
    title: 'İman İkrarı',
    sections: [
      {
        paragraphs: [
          'İman ederim bir Allah’a, her şeye kadir olan Baba’ya, göğün ve yerin, bütün görünen ve görünmeyenlerin Yaradan’ına.',
          'Ve bir Rab İsa Mesih’e, Allah’ın biricik Oğlu’na, bütün çağlardan önce Baba’dan doğmuş olana. Nur’dan nur, gerçek Allah’tan gerçek Allah’a, doğmuş olup yaratılmış olmayana, Baba’yla bir özde olana, her şeyin O’nun vasıtasıyla var edilmiş olduğuna.',
          'Biz insanlar ve kurtuluşumuz için göklerden inmiş olana ve Kutsal Ruh’tan ve Bâkire Meryem’den beden almış ve insan olmuş olana.',
          'Bizler için Pontius Pilatos zamanında Haç’a gerilmiş, cefâ çekmiş ve defnedilmiş olana.',
          'Ve Kutsal Yazılar’a göre üçüncü gün dirilmiş olana.',
          'Ve göklere yükselmiş olana ve Baba’nın sağında oturana.',
          'Ve dirileri ve ölüleri yargılamak için izzetle tekrar gelecek olana. O’nun ki, krallığın sonu olmayana.',
          'Ve Kutsal Ruh’a, Rab’be, hayat verene, Baba’dan çıkana, Baba ve Oğul’la birlikte tapılana ve yüceltilene, Peygamberler vasıtasıyla konuşmuş olana.',
          'Bir, Kutsal, Katolik ve Resûli Kilise’ye.',
          'Günahların bağışlanması için bir vaftizi ikrar ederim.',
          'Ölülerin dirilişini,',
          've gelecek çağın hayatını beklerim. Âmin.',
        ],
      },
    ],
  },
  heavenlyKing: {
    title: 'Göksel Kral',
    sections: [
      {
        paragraphs: [
          'Ey Göksel Kral, Teselli Edici, Gerçeğin Ruhu! Her yerde bulunan ve her şeyi dolduran, iyiliklerin hazinesi ve yaşamın bağışlayıcısı: gel ve içimizde yaşa, bizi her türlü kirden arındır ve ey İyi Olan, canlarımızı kurtar.',
        ],
      },
    ],
  },
  // Turkish: the user's translation (ortodoks_dualar_tr_ru_en.md, 2026-11-17); no published Turkish source.
  trisagion: {
    title: 'Trisagion (Üç Kez Kutsal)',
    sections: [
      {
        paragraphs: [
          'Kutsal Allah, Kutsal Güçlü, Kutsal Ölümsüz, bize merhamet et. (3 kez)',
          'Baba’ya, Oğul’a ve Kutsal Ruh’a yücelik olsun; şimdi ve her zaman ve çağlar boyunca. Amin.',
          'En Kutsal Teslis, bize merhamet et. Ya Rab, günahlarımızı temizle. Efendimiz, suçlarımızı bağışla. Ey Kutsal Olan, adın uğruna yanımıza gel ve zayıflıklarımızı iyileştir.',
          'Rab, merhamet et. (3 kez)',
          'Baba’ya, Oğul’a ve Kutsal Ruh’a yücelik olsun; şimdi ve her zaman ve çağlar boyunca. Amin.',
          'Ardından Göklerdeki Babamız okunur.',
        ],
      },
    ],
  },
  // Turkish: the user's translation (ortodoks_dualar_tr_ru_en.md, 2026-11-17); no published Turkish source.
  ephrem: {
    title: 'Aziz Efrem’in Duası',
    sections: [
      {
        heading: 'Büyük Perhiz’in hafta içi günlerinde okunur',
        paragraphs: [
          'Ya Rab ve yaşamımın Efendisi, tembellik, umutsuzluk, iktidar hırsı ve boş söz ruhunu bana verme.',
          'Bunun yerine iffet, alçakgönüllülük, sabır ve sevgi ruhunu kuluna bağışla.',
          'Evet, ya Rab ve Kral, kendi günahlarımı görmemi ve kardeşimi yargılamamamı bana bağışla; çünkü sen çağlar boyunca kutsanmışsın. Amin.',
        ],
      },
    ],
  },
  manasseh: {
    title: 'Manaşşe’nin Duası',
    sections: [
      {
        heading: 'Büyük Povecheriye’de okunur',
        paragraphs: [
          'Ey Rab, her şeye egemen olan, atalarımız İbrahim’in, İshak’ın, Yakup’un ve onların doğru soyunun Allahsı! Göğü ve yeri bütün süsleriyle yaratan, denizi buyruğunun sözüyle sınırlayan, derinliği kapatıp korkunç ve yüce adınla mühürleyen sensin. Herkes senden korkar ve gücünün önünde titrer; çünkü yüceliğinin görkemine dayanılamaz ve günahkârlara yönelik öfkenin tehdidi karşısında durulamaz. Ama vaat ettiğin merhamet ölçüsüz ve kavranamazdır; çünkü sen yüce Rab’sin, çok merhametli, sabırlı, lütfu bol olansın ve insanların kötülükleri yüzünden acı çekensin.',
          'Sen, ya Rab, iyiliğinin büyüklüğüne göre sana karşı günah işleyenlere tövbe ve bağışlanma vaat ettin; sonsuz merhametinle günahkârlar kurtulsun diye onlara tövbeyi belirledin. Bu nedenle sen, ya Rab, doğruların Allahsı, sana karşı günah işlemeyen doğrulara — İbrahim’e, İshak’a ve Yakup’a — tövbeyi belirlemedin; ama günahkâr olan bana tövbeyi belirledin. Çünkü denizdeki kum tanelerinden daha çok günah işledim.',
          'Suçlarım çoğaldı, ya Rab, suçlarım çoğaldı; haksızlıklarımın çokluğundan göklerin yüksekliğine bakmaya layık değilim. Birçok demir bağla eğilmişim, başımı kaldıramıyorum, hiç rahatlığım yok; çünkü öfkeni alevlendirdim, senin önünde kötülük yaptım; isteğini yerine getirmedim, buyruklarını tutmadım.',
          'Şimdi yüreğimin dizlerini büküyor, senden lütuf diliyorum. Günah işledim, ya Rab, günah işledim; suçlarımı biliyorum. Ama sana yalvarıyorum: beni bağışla, ya Rab, beni bağışla; suçlarımla birlikte beni yok etme. Bana sonsuza dek öfkelenip kötülüklerimi saklama, beni yerin derinliklerine mahkûm etme. Çünkü sen Allah’sın, tövbe edenlerin Allahsısın; bende bütün iyiliğini göstereceksin: layık olmadığım hâlde büyük merhametinle beni kurtaracaksın. Ben de yaşamım boyunca her gün seni öveceğim. Çünkü göklerin bütün güçleri sana ilahi söyler ve yücelik sonsuza dek senindir. Amin.',
        ],
      },
    ],
  },
  morning: {
    title: 'Sabah duaları',
    sections: [
      {
        heading: 'Açılış',
        paragraphs: [
          'Baba’nın, Oğul’un ve Kutsal Ruh’un adıyla. Amin.',
          'Allah’ımız, sana yücelik olsun, sana yücelik olsun!',
        ],
      },
      {
        heading: 'Teslis tropaerleri',
        paragraphs: [
          'Uykudan kalkarak önünde yere kapanıyoruz, ey İyi Olan, ve sana, ey Güçlü Olan, meleklerin ilahisini sesleniyoruz: Kutsal, Kutsal, Kutsalsın, ey Allah; Allahdoğuran’ın (Theotokos) şefaatiyle bize merhamet et.',
          'Baba’ya, Oğul’a ve Kutsal Ruh’a yücelik olsun:',
          'Beni yataktan ve uykudan kaldırdın, ya Rab; aklımı ve yüreğimi aydınlat, dudaklarımı aç ki sana ilahi söyleyeyim, ey Kutsal Teslis: Kutsal, Kutsal, Kutsalsın, ey Allah; Allahdoğuran’ın şefaatiyle bize merhamet et.',
          'Şimdi ve her zaman ve çağlar boyunca. Amin:',
          'Yargıç ansızın gelecek ve herkesin yaptıkları açığa çıkacak; ama gece yarısı korkuyla haykıralım: Kutsal, Kutsal, Kutsalsın, ey Allah; Allahdoğuran’ın şefaatiyle bize merhamet et.',
        ],
      },
      {
        heading: 'Kutsal Teslis’e dua',
        paragraphs: [
          'Uykudan kalkarak sana şükrediyorum, ey Kutsal Teslis; çünkü büyük iyiliğin ve sabrın sayesinde tembel ve günahkâr olan bana öfkelenmedin, günahlarımla birlikte beni yok etmedin; her zamanki insan sevginle davrandın ve umutsuzluk içinde yatan beni, sabah erkenden kalkıp egemenliğini yüceltmem için kaldırdın. Şimdi de zihnimin gözlerini aydınlat, ağzımı aç ki sözlerini öğreneyim, buyruklarını anlayayım, isteğini yerine getireyim, yürekten ikrar ederek seni övüp en kutsal adını, Baba’yı, Oğul’u ve Kutsal Ruh’u yücelteyim; şimdi ve her zaman ve çağlar boyunca. Amin.',
        ],
      },
      {
        heading: 'Aziz Büyük Makarios’un duası',
        paragraphs: [
          'Allah’ım, ben günahkârı arındır; çünkü senin önünde hiçbir zaman iyi bir şey yapmadım. Ama beni kötü olandan kurtar ve senin isteğin bende gerçekleşsin ki, layık olmayan ağzımı mahkûm olmadan açayım ve kutsal adını, Baba’yı, Oğul’u ve Kutsal Ruh’u öveyim; şimdi ve her zaman ve çağlar boyunca. Amin.',
        ],
      },
    ],
  },
  evening: {
    title: 'Akşam duaları',
    sections: [
      {
        heading: 'Tövbe tropaerleri',
        paragraphs: [
          'Bize merhamet et, ya Rab, bize merhamet et! Her türlü savunmadan yoksun olan biz günahkârlar, Efendimiz olarak sana bu duayı sunuyoruz: Bize merhamet et.',
          'Baba’ya, Oğul’a ve Kutsal Ruh’a yücelik olsun:',
          'Ya Rab, bize merhamet et, çünkü sana umut bağladık. Bize çok öfkelenme, suçlarımızı anma; şimdi de merhametli olduğun için bize bak ve bizi düşmanlarımızdan kurtar. Çünkü sen bizim Allah’ımızsın, biz de senin halkınız; hepimiz senin ellerinin eseriyiz ve senin adını çağırıyoruz.',
          'Şimdi ve her zaman ve çağlar boyunca. Amin:',
          'Ey kutsanmış Allahdoğuran, merhamet kapılarını bize aç; sana umut bağlayan bizler yok olmayalım, senin aracılığınla belalardan kurtulalım; çünkü sen Hristiyan soyunun kurtuluşusun.',
        ],
      },
      {
        heading: 'Aziz Büyük Makarios’un duası',
        paragraphs: [
          'Ey sonsuz Allah ve bütün yaratılışın Kralı, beni bu saate ulaşmaya layık kıldın; bugün işle, sözle ve düşünceyle işlediğim günahları bağışla ve ya Rab, alçak canımı bedenin ve ruhun her türlü kirinden arındır. Ya Rab, bu gece uykumu barış içinde geçirmemi bağışla ki, alçak yatağımdan kalkarak yaşamımın bütün günlerinde en kutsal adını hoşnut edeyim ve bana karşı savaşan bedenli ve bedensiz düşmanları ayaklar altına alayım. Ve ya Rab, beni kirleten boş düşüncelerden ve kötü arzulardan kurtar. Çünkü Krallık, güç ve yücelik, Baba’nın, Oğul’un ve Kutsal Ruh’undur; şimdi ve her zaman ve çağlar boyunca. Amin.',
        ],
      },
      {
        heading: 'Aziz Antiyohos’un duası',
        paragraphs: [
          'Ey her şeye egemen olan, Baba’nın Sözü, kendisi yetkin olan İsa Mesih! Büyük merhametin uğruna beni, kulunu hiçbir zaman bırakma, her zaman bende dinlen. Ey İsa, koyunlarının iyi Çobanı, beni yılanın isyanına teslim etme, Şeytan’ın arzusuna terk etme; çünkü bende çürümenin tohumu var.',
          'Sen, ey tapınılan Rab Allah, Kutsal Kral İsa Mesih, öğrencilerini kutsadığın Kutsal Ruh’unla, sönmeyen Işıkla uyurken beni koru. Ya Rab, değersiz kulun olan bana da yatağımda kurtuluşunu bağışla: aklımı Kutsal İncil’inin bilgisinin ışığıyla, canımı Haçının sevgisiyle, yüreğimi sözünün temizliğiyle, bedenimi tutkusuz tutkunla aydınlat; düşüncemi alçakgönüllülüğünle koru ve uygun zamanda seni yüceltmem için beni kaldır. Çünkü sen başlangıcı olmayan Baban ve En Kutsal Ruh ile birlikte çağlar boyunca yüceltilmişsin. Amin.',
        ],
      },
      {
        heading: 'Kapanış duası',
        paragraphs: [
          'Ellerine, ya Rab İsa Mesih, Allah’ım, ruhumu teslim ediyorum. Sen beni kutsa, sen bana merhamet et ve bana sonsuz yaşamı bağışla. Amin.',
        ],
      },
    ],
  },
  mealsBreakfast: {
    title: 'Kahvaltı duâları',
    note: TABLE_BREAKFAST_NOTE,
    sections: [
      {
        heading: 'Kahvaltıdan önce',
        paragraphs: [TABLE_PANAGIA, TABLE_KYRIE, TABLE_GLORY, TABLE_BLESSING_CLERGY, TABLE_LAY_ENDING],
      },
      {
        heading: 'Kahvaltıdan sonra',
        paragraphs: [
          'Heruvimlerden daha îtibarlı ve Serafimlerden kıyaslanamaz ölçüde yüce olan, (bâkireliği) bozulmadan Allah’ın Kelâmı’nı doğurmuş olan, sen gerçek Vâlidetullah’ı yüceltiriz.',
          TABLE_GLORY,
          TABLE_KYRIE,
          TABLE_LAY_ENDING,
        ],
      },
    ],
  },
  mealsLunch: {
    title: 'Öğle yemeği duâları',
    sections: [
      {
        heading: 'Öğle yemeğinden önce',
        paragraphs: [
          'Aziz Allah, Aziz Kudretli, Aziz Ölümsüz, bize merhamet eyle. (3 defa)',
          TABLE_GLORY,
          TABLE_PANAGIA,
          TABLE_KYRIE,
          TABLE_GLORY,
          'Ey göklerde olan Pederimiz, ismin mukaddes olsun. Melekûtun gelsin. Gökte olduğu gibi yerde de senin irâden olsun. Gündelik ekmeğimizi bize bugün ver. Ve bize borçlu olanlara bağışladığımız gibi, bizim borçlarımızı bize bağışla. Ve bizi iğvâya götürme. Fakat bizi şerirden kurtar. Çünkü melekût ve kudret ve izzet senindir, Peder’in ve Oğul’un ve Aziz Ruh’un, şimdi ve dâima ve ebetler ebedince. Âmin.',
          TABLE_GLORY,
          TABLE_KYRIE,
          TABLE_BLESSING_CLERGY,
          TABLE_LAY_ENDING,
        ],
      },
      {
        heading: 'Öğle yemeğinden sonra',
        paragraphs: [
          'Gençliğimizden beri bizlere merhamet eden ve bizleri besleyen Allah mübârektir. Her bedene (canlı varlığa) gıdâsını bahşeden, kalplerimizi sevinç ve ferahlıkla doldur ki, dâima, her şeye kâfi ölçüde sâhip olarak Rab’bimiz İsa Mesih’in inâyetiyle her iyi işi tatbik etmekte gelişelim. O’nunla ve Aziz Ruh’la birlikte sana ebediyen izzet, kudret, hürmet ve secde vâciptir. Âmin.',
          'Ferahlamamız için bizlere yiyecekler bahşettiğin için hamdolsun sana ya Rab, hamdolsun sana ey Aziz, hamdolsun sana ey Kral. Huzûrunda herkese amellerine göre karşılık vereceğin zaman sana hoş görünüp utanmamamız için bizi Aziz Ruh’la doldur. Tamâmen lekesiz Vâliden ve bütün Azizlerinin şefâatleriyle Rab İsa Mesih Allah’ımız, bize merhamet eyle. Âmin.',
          'Aziz Pederlerimizin duâlarıyla, ya Rab İsa Mesih Allah, bize merhamet eyle. Âmin.',
        ],
      },
    ],
  },
  mealsDinner: {
    title: 'Akşam yemeği duâları',
    sections: [
      {
        heading: 'Akşam yemeğinden önce',
        paragraphs: [
          'Fakirler yiyecek ve doyacak, Rab’bi arayanlar O’na övgüler sunacak ve yürekleri ebetler ebedince yaşayacak.',
          TABLE_GLORY,
          TABLE_KYRIE,
          TABLE_BLESSING_CLERGY,
          TABLE_LAY_ENDING,
        ],
      },
      {
        heading: 'Akşam yemeğinden sonra',
        paragraphs: [
          'Ya Rab, mahlûkatınla bizleri ferahlattın ve ellerinin eserleriyle sevindirdin.',
          'Ya Rab, yüzünün nuru üzerimizde belirdi, kalbimize ferahlık verdin. Buğday, şarap ve zeytinyağı mahsulleri senin bereketinle artıp çoğaldılar. (Bunun için) Selâmetle yatıp uyuyacağız, çünkü yalnız sen ya Rab, bizleri ümitle ikamet ettirdin.',
          TABLE_GLORY,
          TABLE_KYRIE,
          'Rûhânî varsa: Ey Mesih Allah, bu sofra artıklarını mübârek kıl, onları bu evde ve bütün cihânda çoğalt, çünkü sen her zaman mübâreksin, şimdi ve dâima ve ebetler ebedince. Âmin.',
          TABLE_LAY_ENDING,
        ],
      },
    ],
  },
};
