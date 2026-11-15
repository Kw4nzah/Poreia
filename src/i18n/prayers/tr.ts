// Turkish prayer texts. Orthodox liturgical vocabulary (Peder, İisus Hristos,
// hükümranlık), not the wording of the Protestant Bible translations.

import type { PrayerId, PrayerText } from '../../prayers';

export const prayerTexts: Record<PrayerId, PrayerText> = {
  lordsPrayer: {
    title: 'Göklerdeki Pederimiz',
    sections: [
      {
        paragraphs: [
          'Göklerdeki Pederimiz, adın aziz olsun, hükümranlığın gelsin; gökte olduğu gibi yeryüzünde de senin isteğin olsun.',
          'Gündelik ekmeğimizi bize bugün ver; bize borçlu olanları bağışladığımız gibi sen de bizim borçlarımızı bağışla; bizi ayartılmaya bırakma, bizi kötü olandan kurtar.',
        ],
      },
    ],
  },
  creed: {
    title: 'İman İkrarı',
    sections: [
      {
        paragraphs: [
          'Bir tek Tanrı’ya inanıyorum: her şeye gücü yeten Peder’e, göğün ve yerin, görünen ve görünmeyen her şeyin Yaratıcısı’na.',
          'Ve bir tek Rab’be, İisus Hristos’a, Tanrı’nın biricik Oğlu’na, bütün çağlardan önce Peder’den doğmuş olana; Işık’tan Işık, gerçek Tanrı’dan gerçek Tanrı; doğmuş, yaratılmamış, Peder’le aynı özden olan ve her şeyin kendisi aracılığıyla var olduğu Rab’be.',
          'O, biz insanlar için ve bizim kurtuluşumuz için göklerden indi, Kutsal Ruh’tan ve Bakire Meryem’den beden aldı ve insan oldu.',
          'Pontius Pilatus zamanında bizim için çarmıha gerildi, acı çekti ve gömüldü.',
          'Kutsal Yazılar uyarınca üçüncü gün dirildi.',
          'Göklere yükseldi ve Peder’in sağında oturdu.',
          'Dirileri ve ölüleri yargılamak üzere şanla yeniden gelecektir; O’nun hükümranlığının sonu olmayacaktır.',
          'Ve Kutsal Ruh’a inanıyorum: Rab olan, hayat veren, Peder’den çıkan, Peder ve Oğul’la birlikte tapınılan ve yüceltilen, peygamberler aracılığıyla konuşmuş olana.',
          'Bir tek, kutsal, katholik ve havarisel Kilise’ye inanıyorum.',
          'Günahların bağışlanması için bir tek vaftizi ikrar ediyorum.',
          'Ölülerin dirilişini',
          've gelecek çağın hayatını bekliyorum. Amin.',
        ],
      },
    ],
  },
  heavenlyKing: {
    title: 'Göksel Kral',
    sections: [
      {
        paragraphs: [
          'Ey Göksel Kral, Teselli Eden, Hakikat Ruhu; her yerde hazır olan ve her şeyi dolduran, iyiliklerin Hazinesi ve hayatın Bağışlayıcısı: gel ve içimizde mesken tut, bizi her kirden arındır ve canlarımızı kurtar, ey İyi Olan.',
        ],
      },
    ],
  },
  morning: {
    title: 'Sabah duası',
    sections: [
      {
        paragraphs: [
          'Peder’in, Oğul’un ve Kutsal Ruh’un adıyla. Amin.',
          'Şan sana, Tanrımız, şan sana.',
          'Uykudan kalkmış olarak sana şükrediyorum, ey Kutsal Teslis; çünkü büyük iyiliğin ve sabrınla ben tembel ve günahkâr kuluna öfkelenmedin, beni günahlarımla birlikte yok etmedin; her zamanki insanseverliğini gösterdin ve umutsuzluk içinde yatarken beni kaldırdın ki erkenden kalkıp kudretini yücelteyim.',
          'Şimdi de aklımın gözlerini aydınlat ve ağzımı aç ki sözlerini öğreneyim, buyruklarını anlayayım, isteğini yerine getireyim, yürekten ikrarla sana ilahi söyleyeyim ve en kutsal adını, Peder’in, Oğul’un ve Kutsal Ruh’un adını öveyim; şimdi, her zaman ve çağlar çağınca. Amin.',
        ],
      },
    ],
  },
  evening: {
    title: 'Akşam duası',
    sections: [
      {
        paragraphs: [
          'Rab Tanrımız, bugün sözle, işle ve düşünceyle işlediğim günahları, iyi ve insansever olduğun için bağışla. Bana sakin ve rahat bir uyku ver. Koruyucu meleğini gönder ki beni her kötülükten sakınsın ve korusun.',
          'Çünkü canlarımızın ve bedenlerimizin koruyucusu sensin ve sana şan sunarız: Peder’e, Oğul’a ve Kutsal Ruh’a; şimdi, her zaman ve çağlar çağınca. Amin.',
          'Ellerine, ey Rab İisus Hristos, Tanrım, ruhumu teslim ediyorum. Beni kutsa, bana merhamet eyle ve bana sonsuz hayat bağışla. Amin.',
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
          'Herkesin gözü umutla sana bakar, ya Rab; sen de onlara yiyeceklerini vaktinde verirsin. Cömert elini açar, her canlıyı lütfunla doyurursun.',
        ],
      },
      {
        heading: 'Yemekten sonra',
        paragraphs: [
          'Sana şükrederiz, ey Hristos Tanrımız, bizi yeryüzü nimetlerinle doyurdun. Bizi göksel hükümranlığından da yoksun bırakma; öğrencilerinin arasına gelip onlara barış verdiğin gibi, ey Kurtarıcı, bize de gel ve bizi kurtar.',
        ],
      },
    ],
  },
};
