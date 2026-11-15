// English prayer texts from Orthodox Daily Prayers (St Tikhon's Seminary Press, 1982).
// Only the last evening prayer ("Into Thy hands") is not in that book; it is rendered
// from the Church Slavonic text.

import type { PrayerId, PrayerText } from '../../prayers';

export const prayerTexts: Record<PrayerId, PrayerText> = {
  lordsPrayer: {
    title: 'The Lord’s Prayer',
    sections: [
      {
        paragraphs: [
          'Our Father, Who art in heaven, hallowed be Thy Name. Thy Kingdom come. Thy will be done, on earth as it is in heaven.',
          'Give us this day our daily bread; and forgive us our trespasses, as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil.',
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
          'and the life of the world to come. Amen.',
        ],
      },
    ],
  },
  heavenlyKing: {
    title: 'O Heavenly King',
    sections: [
      {
        paragraphs: [
          'O Heavenly King, the Comforter, the Spirit of Truth, Who art everywhere and fillest all things, Treasury of Blessings and Giver of Life: come and abide in us, and cleanse us from every impurity, and save our souls, O Good One.',
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
          'Having risen from sleep, I thank Thee, the Holy Trinity. In the abundance of Thy kindness and long patience, Thou hast not been angry with me for my laziness and sinfulness, nor hast Thou destroyed me in my lawlessness. Instead, in Thy usual love for mankind, Thou hast raised me as I lay in despair, that I might rise early and glorify Thy Reign.',
          'Enlighten now the eyes of my mind and open my lips, that I might learn of Thy words, understand Thy commandments, accomplish Thy will, hymn Thee in heart-felt confession and praise Thine all-holy name, the Father and the Son, and the Holy Spirit, now and ever and unto ages of ages. Amen.',
        ],
      },
    ],
  },
  evening: {
    title: 'Evening prayer',
    sections: [
      {
        paragraphs: [
          'O Lord our God, forgive all the sins I have committed this day in word, deed and thought, for Thou art good and lovest mankind. Grant me a peaceful sleep, free of restlessness. Send Thy Guardian Angel to protect and keep me from all harm.',
          'For Thou art the Guardian of our souls and bodies, and to Thee we ascribe glory, to the Father, and to the Son, and to the Holy Spirit, now and ever and unto ages of ages. Amen.',
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
          'O Christ God, bless the food and drink of Thy servants, for Thou art holy, always, now and ever and unto ages of ages. Amen.',
        ],
      },
      {
        heading: 'After meals',
        paragraphs: [
          'We thank Thee, Christ our God, for Thou hast satisfied us with Thine earthly gifts. Deprive us not of Thy Heavenly Kingdom, but as Thou camest among Thy disciples, O Savior, giving them peace, so come to us and save us!',
        ],
      },
    ],
  },
};
