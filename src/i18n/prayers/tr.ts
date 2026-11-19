// Turkish prayer texts: the user's own translations and corrections (file
// ortodoks_dualar_tr_ru_en.md, 2026-11-17), set in the Allah / no-Protestant-wording register
// the user asked for ("Tanrı" -> "Allah", "esenlik" -> "barış").
// There is no published Turkish prayer book to check them against; the file's own note says the
// texts after the Lord's Prayer and the Creed were translated from the Greek/Slavonic originals.
// The Creed wording used for comparison earlier was the Turkish Divine Liturgy of St John
// Chrysostom in The Canadian Journal of Orthodox Christianity XVII/3 (2022).

import type { PrayerText, RegularPrayerId } from '../../prayers';

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
  meals: {
    title: 'Yemekten önce ve sonra',
    sections: [
      {
        heading: 'Yemekten önce',
        paragraphs: [
          'Herkesin gözü sana umut bağlar, ya Rab, ve sen onlara yiyeceklerini zamanında verirsin. Cömert elini açar, her canlının arzusunu doyurursun.',
        ],
      },
      {
        heading: 'Yemekten sonra',
        paragraphs: [
          'Sana şükrediyoruz, ey Mesih Allah’ımız, çünkü bizi yeryüzündeki nimetlerinle doyurdun. Bizi göksel Krallığından da yoksun bırakma; ama öğrencilerinin arasına gelip onlara barış verdiğin gibi, ey Kurtarıcı, aramıza gel ve bizi kurtar. Amin.',
        ],
      },
    ],
  },
};
