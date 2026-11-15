// English prayer texts in the traditional wording used by English-language prayer books.

import type { PrayerId, PrayerText } from '../../prayers';

export const prayerTexts: Record<PrayerId, PrayerText> = {
  lordsPrayer: {
    title: 'The Lord’s Prayer',
    sections: [
      {
        paragraphs: [
          'Our Father, who art in heaven, hallowed be Thy name. Thy kingdom come. Thy will be done, on earth as it is in heaven.',
          'Give us this day our daily bread; and forgive us our trespasses, as we forgive those who trespass against us; and lead us not into temptation, but deliver us from the evil one.',
        ],
      },
    ],
  },
  creed: {
    title: 'The Creed',
    sections: [
      {
        paragraphs: [
          'I believe in one God, the Father Almighty, Maker of heaven and earth, and of all things visible and invisible.',
          'And in one Lord Jesus Christ, the Son of God, the Only-begotten, begotten of the Father before all ages; Light of Light, true God of true God; begotten, not made; of one essence with the Father; by whom all things were made.',
          'Who for us men and for our salvation came down from heaven, and was incarnate of the Holy Spirit and the Virgin Mary, and became man.',
          'And He was crucified for us under Pontius Pilate, and suffered, and was buried.',
          'And the third day He rose again, according to the Scriptures.',
          'And ascended into heaven, and sits at the right hand of the Father.',
          'And He shall come again with glory to judge the living and the dead; whose kingdom shall have no end.',
          'And in the Holy Spirit, the Lord, the Giver of Life, who proceeds from the Father; who with the Father and the Son together is worshipped and glorified; who spoke by the prophets.',
          'In one, holy, catholic and apostolic Church.',
          'I acknowledge one baptism for the remission of sins.',
          'I look for the resurrection of the dead,',
          'and the life of the age to come. Amen.',
        ],
      },
    ],
  },
  heavenlyKing: {
    title: 'O Heavenly King',
    sections: [
      {
        paragraphs: [
          'O Heavenly King, the Comforter, the Spirit of Truth, who art everywhere present and fillest all things, Treasury of blessings and Giver of life: come and abide in us, and cleanse us from every impurity, and save our souls, O Good One.',
        ],
      },
    ],
  },
  morning: {
    title: 'Morning prayer',
    sections: [
      {
        paragraphs: [
          'In the name of the Father, and of the Son, and of the Holy Spirit. Amen.',
          'Glory to Thee, our God, glory to Thee.',
          'Having risen from sleep, I thank Thee, O Holy Trinity, that in Thy great goodness and patience Thou hast not been angered with me, slothful and sinful as I am, nor hast Thou destroyed me in my transgressions; but Thou hast shown Thy wonted love for mankind, and hast raised me as I lay in despair, that I might rise early and glorify Thy might.',
          'And now enlighten the eyes of my mind and open my mouth, that I may study Thy words and understand Thy commandments, and do Thy will, and sing to Thee with heartfelt confession, and praise Thine all-holy name, of the Father, and of the Son, and of the Holy Spirit, now and ever, and unto ages of ages. Amen.',
        ],
      },
    ],
  },
  evening: {
    title: 'Evening prayer',
    sections: [
      {
        paragraphs: [
          'O Lord our God, whatever sins I have committed this day in word, deed and thought, forgive me, for Thou art good and lovest mankind. Grant me peaceful and undisturbed sleep. Send Thy guardian angel to shelter and keep me from all evil.',
          'For Thou art the guardian of our souls and bodies, and to Thee we send up glory, to the Father, and to the Son, and to the Holy Spirit, now and ever, and unto ages of ages. Amen.',
          'Into Thy hands, O Lord Jesus Christ, my God, I commend my spirit. Bless me, have mercy on me, and grant me life eternal. Amen.',
        ],
      },
    ],
  },
  meals: {
    title: 'Before and after meals',
    sections: [
      {
        heading: 'Before meals',
        paragraphs: [
          'The eyes of all look to Thee with hope, O Lord, and Thou givest them their food in due season. Thou openest Thy generous hand and fillest every living thing with Thy favour.',
        ],
      },
      {
        heading: 'After meals',
        paragraphs: [
          'We thank Thee, O Christ our God, that Thou hast filled us with Thine earthly gifts. Deprive us not of Thy heavenly Kingdom; but as Thou camest among Thy disciples, O Saviour, and gavest them peace, come also to us and save us.',
        ],
      },
    ],
  },
};
