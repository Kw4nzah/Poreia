// English prayer texts.
// lordsPrayer, creed, heavenlyKing, trisagion and ephrem: Orthodox Daily Prayers (St Tikhon's
// Seminary Press, 1982; Project Gutenberg #34981).
// manasseh: King James Version Apocrypha (eBible eng-kjv, public domain), two wording fixes to match it.
// morning, evening and meals: ortodoks_dualar_tr_ru_en.md supplied by the user (2026-11-17). Its
// note says the short common prayers use the traditional wording of English-speaking Orthodox
// churches, while the longer ones (troparia, Macarius, Antiochus) are faithful translations of the
// Slavonic/Greek made for that file, not a printed prayer book.

import type { PrayerText, RegularPrayerId } from '../../prayers';

export const prayerTexts: Record<RegularPrayerId, PrayerText> = {
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
  trisagion: {
    title: 'Trisagion',
    sections: [
      {
        paragraphs: [
          'Holy God! Holy Mighty! Holy Immortal! Have mercy on us. (3 times)',
          'Glory to the Father, and to the Son, and to the Holy Spirit, now and ever and unto ages of ages. Amen.',
          'O Most Holy Trinity! Have mercy on us! Lord, cleanse us from our sins! Master, pardon our transgressions! Holy One, visit and heal our infirmities for Thy name’s sake.',
          'Lord, have mercy! (3 times)',
          'Glory to the Father, and to the Son, and to the Holy Spirit, now and ever and unto ages of ages. Amen.',
          'Then the Lord’s Prayer.',
        ],
      },
    ],
  },
  ephrem: {
    title: 'Prayer of St. Ephraim',
    sections: [
      {
        heading: 'Said at most services on weekdays of Great Lent',
        paragraphs: [
          'O Lord and Master of my life! Take from me the spirit of sloth, despair, lust of power and idle talk.',
          'But give rather the spirit of chastity, humility, patience, and love to Thy servant.',
          'Yea, O Lord and King! Grant me to see my own transgressions and not to judge my brother, for blessed art Thou, unto ages of ages.',
        ],
      },
    ],
  },
  manasseh: {
    title: 'Prayer of Manasseh',
    sections: [
      {
        heading: 'Read at Great Compline',
        paragraphs: [
          'O Lord, Almighty God of our fathers, Abraham, Isaac, and Jacob, and of their righteous seed; who hast made heaven and earth, with all the ornament thereof; who hast bound the sea by the word of thy commandment; who hast shut up the deep, and sealed it by thy terrible and glorious name; whom all men fear, and tremble before thy power; for the majesty of thy glory cannot be borne, and thine angry threatening toward sinners is importable: but thy merciful promise is unmeasurable and unsearchable; for thou art the most high Lord, of great compassion, longsuffering, very merciful, and repentest of the evils of men.',
          'Thou, O Lord, according to thy great goodness hast promised repentance and forgiveness to them that have sinned against thee: and of thine infinite mercies hast appointed repentance unto sinners, that they may be saved. Thou therefore, O Lord, that art the God of the just, hast not appointed repentance to the just, as to Abraham, and Isaac, and Jacob, which have not sinned against thee; but thou hast appointed repentance unto me that am a sinner: for I have sinned above the number of the sands of the sea.',
          'My transgressions, O Lord, are multiplied: my transgressions are multiplied, and I am not worthy to behold and see the height of heaven for the multitude of mine iniquities. I am bowed down with many iron bands, that I cannot lift up mine head, neither have any release: for I have provoked thy wrath, and done evil before thee: I did not thy will, neither kept I thy commandments: I have set up abominations, and have multiplied offences.',
          'Now therefore I bow the knee of mine heart, beseeching thee of grace. I have sinned, O Lord, I have sinned, and I acknowledge mine iniquities: wherefore, I humbly beseech thee, forgive me, O Lord, forgive me, and destroy me not with mine iniquities. Be not angry with me for ever, by reserving evil for me; neither condemn me to the lower parts of the earth. For thou art the God, even the God of them that repent; and in me thou wilt shew all thy goodness: for thou wilt save me, that am unworthy, according to thy great mercy. Therefore I will praise thee for ever all the days of my life: for all the powers of the heavens do praise thee, and thine is the glory for ever and ever. Amen.',
        ],
      },
    ],
  },
  morning: {
    title: 'Morning prayers',
    sections: [
      {
        heading: 'Opening',
        paragraphs: [
          'In the name of the Father, and of the Son, and of the Holy Spirit. Amen.',
          'Glory to Thee, our God, glory to Thee.',
        ],
      },
      {
        heading: 'Troparia of the Trinity',
        paragraphs: [
          'Having arisen from sleep, we fall down before Thee, O Good One, and we cry to Thee, O Mighty One, the hymn of the angels: Holy, Holy, Holy art Thou, O God; through the Theotokos have mercy on us.',
          'Glory to the Father, and to the Son, and to the Holy Spirit:',
          'From bed and sleep Thou hast raised me up, O Lord; enlighten my mind and my heart, and open my lips, that I may praise Thee, O Holy Trinity: Holy, Holy, Holy art Thou, O God; through the Theotokos have mercy on us.',
          'Both now and ever, and unto ages of ages. Amen:',
          'Suddenly the Judge shall come, and the deeds of each shall be laid bare; but with fear let us cry out at midnight: Holy, Holy, Holy art Thou, O God; through the Theotokos have mercy on us.',
        ],
      },
      {
        heading: 'Prayer to the Holy Trinity',
        paragraphs: [
          'Having risen from sleep, I thank Thee, O Holy Trinity, that because of Thy great goodness and long-suffering Thou wast not angry with me, slothful and sinful as I am, nor didst Thou destroy me in my transgressions; but Thou hast shown Thy usual love for mankind, and hast raised me up, who lay in despair, to rise early and glorify Thy dominion. And now enlighten the eyes of my mind, open my mouth to learn Thy words and to understand Thy commandments, to do Thy will and to sing to Thee in heartfelt confession, and to praise Thine all-holy name, of the Father, and of the Son, and of the Holy Spirit, now and ever, and unto ages of ages. Amen.',
        ],
      },
      {
        heading: 'Prayer of St. Macarius the Great',
        paragraphs: [
          'O God, cleanse me a sinner, for I have never done anything good before Thee; but deliver me from the evil one, and let Thy will be done in me, that I may open my unworthy mouth without condemnation and praise Thy holy name, of the Father, and of the Son, and of the Holy Spirit, now and ever, and unto ages of ages. Amen.',
        ],
      },
    ],
  },
  evening: {
    title: 'Evening prayers',
    sections: [
      {
        heading: 'Penitential troparia',
        paragraphs: [
          'Have mercy on us, O Lord, have mercy on us; for, lacking all defence, we sinners offer to Thee, as our Master, this supplication: have mercy on us.',
          'Glory to the Father, and to the Son, and to the Holy Spirit:',
          'O Lord, have mercy on us, for we have put our trust in Thee. Be not exceedingly angry with us, neither remember our iniquities; but look down on us now as Thou art compassionate, and deliver us from our enemies. For Thou art our God, and we are Thy people; we are all the work of Thy hands, and we call upon Thy name.',
          'Both now and ever, and unto ages of ages. Amen:',
          'Open unto us the doors of compassion, O blessed Theotokos; hoping in thee, may we not perish, but through thee may we be delivered from adversities, for thou art the salvation of the Christian people.',
        ],
      },
      {
        heading: 'Prayer of St. Macarius the Great',
        paragraphs: [
          'O eternal God and King of all creation, who hast vouchsafed me to arrive at this hour: forgive me the sins that I have committed this day in deed, word, and thought; and cleanse, O Lord, my humble soul from every defilement of flesh and spirit. And grant me, O Lord, to pass through the sleep of this night in peace, that, rising from my lowly bed, I may please Thy most holy name all the days of my life, and trample upon the enemies, both bodily and bodiless, that war against me. And deliver me, O Lord, from vain thoughts that defile me, and from evil desires. For Thine is the kingdom, and the power, and the glory, of the Father, and of the Son, and of the Holy Spirit, now and ever, and unto ages of ages. Amen.',
        ],
      },
      {
        heading: 'Prayer of St. Antiochus',
        paragraphs: [
          'O Almighty One, Word of the Father, Jesus Christ, who art Thyself perfect: for the sake of Thy great mercy never depart from me, Thy servant, but ever abide in me. O Jesus, Good Shepherd of Thy sheep, deliver me not over to the sedition of the serpent, and leave me not to the will of Satan, for the seed of corruption is in me.',
          'Do Thou, therefore, O Lord God, worshipped King, holy Jesus Christ, guard me as I sleep by the Unwaning Light, by Thy Holy Spirit, with whom Thou didst sanctify Thy disciples. Grant, O Lord, to me also, Thine unworthy servant, Thy salvation upon my bed: enlighten my mind with the light of understanding of Thy Holy Gospel; my soul with the love of Thy Cross; my heart with the purity of Thy word; my body with Thy passionless Passion; keep my thoughts in Thy humility, and raise me up at the proper time to glorify Thee. For most glorified art Thou, together with Thine unoriginate Father and the Most Holy Spirit, unto the ages. Amen.',
        ],
      },
      {
        heading: 'Closing prayer',
        paragraphs: [
          'Into Thy hands, O Lord Jesus Christ, my God, I commend my spirit. Do Thou bless me, have mercy on me, and grant me life eternal. Amen.',
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
          'The eyes of all look to Thee with hope, O Lord, and Thou givest them their food in due season; Thou openest Thy bountiful hand and fillest every living thing with good will.',
        ],
      },
      {
        heading: 'After meals',
        paragraphs: [
          'We thank Thee, O Christ our God, that Thou hast satisfied us with Thine earthly gifts; deprive us not also of Thy heavenly Kingdom; but as Thou camest into the midst of Thy disciples, O Saviour, and gavest them peace, come to us and save us. Amen.',
        ],
      },
    ],
  },
};
