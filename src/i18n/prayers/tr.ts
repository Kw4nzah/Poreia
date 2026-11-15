// Turkish prayer texts.
//
// lordsPrayer and creed follow the Turkish Divine Liturgy of St John Chrysostom printed in
// The Canadian Journal of Orthodox Christianity XVII/3 (2022). The other prayers have no
// published Turkish source yet: they are our own translations and keep that liturgy's
// vocabulary (Baba, Allah, İsa Mesih, yücelik, "sonsuzluklar boyunca").

import type { PrayerId, PrayerText } from '../../prayers';

export const prayerTexts: Record<PrayerId, PrayerText> = {
  lordsPrayer: {
    title: 'Göklerdeki Babamız',
    sections: [
      {
        paragraphs: [
          'Göklerdeki Babamız, adın yüceltilsin, hükümdarlığın gelsin, gökte olduğu gibi yeryüzünde de Sen’in isteğin olsun.',
          'Günlük ekmeğimizi bugün de bize ver, bize karşı suç işleyenleri bağışladığımız gibi Sen de bağışla suçlarımızı. Bizi suç işlemekten koru ve kötülükten kurtar.',
        ],
      },
    ],
  },
  creed: {
    title: 'İman İkrarı',
    sections: [
      {
        paragraphs: [
          'İnanırım Bir Allah’a, her şeye gücü yeten Baba’ya, göğün ve yerin, tüm görünen ve görünmeyenlerin Yaradanına.',
          'Tek Rab İsa Mesih’e, Allah’ın Oğluna, Tek doğana, tüm çağlardan önce Baba’dan doğana, Işık’tan Işık, Gerçek Allah’tan Gerçek Allah’a, Doğan’a, yaratılmayana, Baba ile Bir özde olana, tüm şeylerin O’nunla yaratıldığına.',
          'Biz insanlar ve kurtuluşumuz için göklerden aşağıya inene, Kutsal Ruh ve bakire Meryem’den beden alana ve insan olana.',
          'Üstelik bizler için Pontus’lu Pilatus zamanında çarmıha gerilene, acı çekene ve gömülene,',
          'Kutsal Yazılara göre üçüncü günde dirilene.',
          'Göklere yükselene ve Baba’nın sağında oturana.',
          'Görkemle yine gelecek olana, dirileri ve ölüleri yargılamaya. O’nun ki Krallığının sonu olmayana.',
          'Kutsal Ruh’a, Rab’be, yaşam verene, Baba’dan çıkana, Baba ve Oğul ile birlikte tapılana ve onurlandırılana, peygamberler aracılığıyla konuşmuş olana.',
          'Bir, Kutsal, Evrensel ve elçisel Kilise’ye.',
          'Onaylarım günahların bağışlanması için olan tek vaftizi.',
          'Beklerim ölülerin dirilişini',
          've gelecek çağ yaşamını. Amin.',
        ],
      },
    ],
  },
  heavenlyKing: {
    title: 'Göksel Kral',
    sections: [
      {
        paragraphs: [
          'Ey Göksel Kral, Teselli Eden, Hakikat Ruhu; her yerde olan ve her şeyi dolduran, iyiliklerin Hazinesi ve yaşam Veren: gel ve içimizde yaşa, bizi her kirden arındır ve canlarımızı kurtar, ey İyi Olan.',
        ],
      },
    ],
  },
  morning: {
    title: 'Sabah duası',
    sections: [
      {
        paragraphs: [
          'Baba’nın, Oğul’un ve Kutsal Ruh’un adıyla. Amin.',
          'Yücelik Sana, Allah’ımız, yücelik Sana.',
          'Uykudan kalkmış olarak Sana şükrediyorum, ey Kutsal Üçleme; çünkü büyük iyiliğin ve sabrınla ben tembel ve günahkâr kuluna öfkelenmedin, beni günahlarımla birlikte yok etmedin; her zamanki insan sevginle, umutsuzluk içinde yatarken beni kaldırdın ki erkenden kalkıp Sen’in gücünü yücelteyim.',
          'Şimdi de aklımın gözlerini aydınlat ve ağzımı aç ki sözlerini öğreneyim, buyruklarını anlayayım, isteğini yerine getireyim, yürekten ikrarla Sana ilahi söyleyeyim ve tamamen kutsal adını, Baba’nın, Oğul’un ve Kutsal Ruh’un adını öveyim; şimdi ve her zaman ve sonsuzluklar boyunca. Amin.',
        ],
      },
    ],
  },
  evening: {
    title: 'Akşam duası',
    sections: [
      {
        paragraphs: [
          'Rab Allah’ımız, bugün sözle, işle ve düşünceyle işlediğim günahları bağışla, çünkü Sen iyisin ve insanları seversin. Bana sakin ve rahat bir uyku ver. Koruyucu meleğini gönder ki beni her kötülükten korusun.',
          'Çünkü canlarımızın ve bedenlerimizin koruyucusu Sen’sin ve Sana yücelik sunarız, Baba’ya, Oğul’a ve Kutsal Ruh’a, şimdi ve her zaman ve sonsuzluklar boyunca. Amin.',
          'Ellerine, ey Rab İsa Mesih, Allah’ım, ruhumu teslim ediyorum. Beni kutsa, bana merhamet eyle ve bana sonsuz yaşam bağışla. Amin.',
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
          'Ey Mesih Allah’ımız, kullarının yiyeceğini ve içeceğini kutsa; çünkü Sen kutsalsın, şimdi ve her zaman ve sonsuzluklar boyunca. Amin.',
        ],
      },
      {
        heading: 'Yemekten sonra',
        paragraphs: [
          'Sana şükrederiz, ey Mesih Allah’ımız, bizi yeryüzü nimetlerinle doyurdun. Bizi göksel Krallığından da yoksun bırakma; öğrencilerinin arasına gelip onlara barış verdiğin gibi, ey Kurtarıcı, bize de gel ve bizi kurtar.',
        ],
      },
    ],
  },
};
