// English texts of the feast hymns (troparion and kontakion of each feast).
//
// Source: Isabel Florence Hapgood (translator and compiler), Service Book of the Holy
// Orthodox-Catholic Apostolic (Greco-Russian) Church, Houghton, Mifflin and Company, Boston and
// New York, 1906 (first edition), from the Special Services of the Great Feasts. Public domain:
// first published in the United States in 1906, and Hapgood died in 1928. Her "Hymn for the Day"
// is the troparion and her "Collect-Hymn" the kontakion. The text was extracted by script from
// the Internet Archive scan of the 1906 edition (archive.org/details/cu31924029363128) and
// checked against a second scan of the same edition (archive.org/details/servicebookofhol00orth_1).
// Only OCR line-break hyphens, stray marks, spacing before : ; ! ? and the rubric "(Thrice.)" were
// cleaned. The spelling and wording are Hapgood's (thee/thy), unchanged. The 1922 edition words
// four of these hymns slightly differently; the 1906 wording is used throughout.
//
// Feasts for which that book has no usable hymn in English have no English text here. Those are
// listed in englishFeastFallback and show the Russian text (see feastsRu.ts) with a short note:
// the troparion or kontakion is missing from Hapgood's book (Dormition kontakion, Lazarus
// Saturday, Circumcision, Protection, the Forerunner and Apostle feasts), or it is worded for the
// Russian Empire, with a ruler's name to be inserted and a war to be won (Exaltation of the
// Cross, Meeting of the Lord kontakion), which this app does not alter. Nothing is invented and
// no copyrighted translation (OCA, GOARCH, HTM, Antiochian, St Tikhon's) is used.

import type { FeastPrayerId, PrayerText } from "../../prayers";
import { feastPrayerTexts as russianFeastTexts } from "./feastsRu";

/** Feasts without a public-domain English hymn. They show the Russian text with a note. */
export const englishFeastFallback = [
  "exaltationOfCross",
  "protectionOfTheotokos",
  "circumcision",
  "meetingOfTheLord",
  "nativityOfForerunner",
  "peterAndPaul",
  "dormition",
  "beheadingOfJohn",
  "lazarusSaturday",
] as const satisfies readonly FeastPrayerId[];

export type EnglishFallbackId = (typeof englishFeastFallback)[number];

export const ENGLISH_FALLBACK_NOTE =
  "English text is not yet available; Russian shown.";

function russianFallback(id: EnglishFallbackId, title: string): PrayerText {
  return {
    title,
    note: ENGLISH_FALLBACK_NOTE,
    sections: russianFeastTexts[id].sections,
  };
}

export const feastPrayerTexts: Record<FeastPrayerId, PrayerText> = {
  // Hapgood 1906, Nativity of the Birth-giver of God (Sept. 8), Hymn for the Day / Collect-Hymn at the Liturgy
  nativityOfTheotokos: {
    title: "Nativity of the Theotokos",
    sections: [
      {
        heading: "Troparion",
        paragraphs: [
          "Thy holy Nativity, O virgin Birth-giver of God, hath proclaimed joy unto all the universe; for from thee is risen the Sun of Righteousness, even Christ our God. And having destroyed the curse, he hath bestowed a blessing; and having brought Death to naught, he hath given unto us life eternal.",
        ],
      },
      {
        heading: "Kontakion",
        paragraphs: [
          "Joachim and Anna were delivered from the reproach of childlessness, and Adam and Eve from the corruption of death, at thy holy Nativity, O All-pure One. This do thy people celebrate, being redeemed from the guilt of transgressions, when they cry unto thee: The barren giveth birth to the Birth-giver of God and the Nourisher of our Life.",
        ],
      },
    ],
  },
  exaltationOfCross: russianFallback(
    "exaltationOfCross",
    "Exaltation of the Holy Cross",
  ),
  protectionOfTheotokos: russianFallback(
    "protectionOfTheotokos",
    "Protection of the Theotokos",
  ),
  // Hapgood 1906, Entrance into the Temple of the Birth-giver of God (Nov. 21), Hymn for the Day / Collect-Hymn
  entryOfTheotokos: {
    title: "Entry of the Theotokos into the Temple",
    sections: [
      {
        heading: "Troparion",
        paragraphs: [
          "To-day is the foreshadowing of the beneficence of God which is to come, and the heralding of man's salvation. The Virgin is clearly manifested in the temple of God, and in anticipation announceth Christ unto all men. Unto her let us, also, cry, aloud: Hail, thou who art the fulfilment of the Creator's providence!",
        ],
      },
      {
        heading: "Kontakion",
        paragraphs: [
          "The all-pure Temple of the Saviour, the most precious Bridal-chamber and Virgin, the Treasure-house of the glory of God, to-day is led into the temple of the Lord, bringing with her the grace which is in the Divine Spirit; whom also the Angels of God do celebrate in song: This is the Abode of Heaven.",
        ],
      },
    ],
  },
  // Hapgood 1906, Nativity of Christ, Hymn at the Blessing of the Loaves / Collect-Hymn after Canticle VI
  nativityOfChrist: {
    title: "Nativity of Christ",
    sections: [
      {
        heading: "Troparion",
        paragraphs: [
          "Thy Nativity, O Christ our God, hath arisen upon the world as the light of wisdom. For at it, they who worshipped the stars were, by a Star, taught to adore thee, the Sun of Righteousness, and to know thee, the Orient from on high. O Lord, glory to thee.",
        ],
      },
      {
        heading: "Kontakion",
        paragraphs: [
          "To-day a Virgin bringeth forth the Supersubstantial, and earth offereth a cavern to the Unapproachable; Angels together with the Shepherds sing praises; the Wise Men journey on with the Star. For, for our sakes, God, who is before all the ages, is born a little Child.",
        ],
      },
    ],
  },
  circumcision: russianFallback("circumcision", "Circumcision of the Lord"),
  // Hapgood 1906, The Epiphany, Hymn for the Day / Collect-Hymn at the Liturgy
  theophany: {
    title: "Holy Theophany",
    sections: [
      {
        heading: "Troparion",
        paragraphs: [
          "When in Jordan thou wast baptized, O Lord, the worship of the Trinity was made manifest. For the voice of the Father bare witness unto thee, calling thee his beloved Son, and the Spirit, in the form of a dove, confirmed the steadfastness of that word. O Christ our God, who didst manifest thyself, and dost enlighten the world, glory to thee.",
        ],
      },
      {
        heading: "Kontakion",
        paragraphs: [
          "To-day hast thou revealed thyself unto the universe, and thy Light, O Lord, hath showed a sign unto us, who with understanding sing unto thee: Thou art come, and hast revealed thyself, O Light Unapproachable.",
        ],
      },
    ],
  },
  meetingOfTheLord: russianFallback("meetingOfTheLord", "Meeting of the Lord"),
  // Hapgood 1906, Annunciation, Hymn for the Day / Hymn to the Birth-giver of God (First Hour, p. 42)
  annunciation: {
    title: "Annunciation",
    sections: [
      {
        heading: "Troparion",
        paragraphs: [
          "To-day is the crown of our salvation, and the manifestation of that mystery which is from everlasting: The Son of God becometh the son of a Virgin, and Gabriel announceth the glad tidings of grace. Wherefore let us also cry aloud with him unto the Birth-giver of God: Hail, thou that art full of grace, the Lord is with thee!",
        ],
      },
      {
        heading: "Kontakion",
        paragraphs: [
          "We, thy servants, in that we have been delivered from calamities, do offer unto thee, O Birth-giver of God, who as victorious Chieftain warrest for us, songs of triumph and thanksgiving: Do thou also, in that thou hast might invincible, free us from all assaults, that we may cry unto thee: Hail, O Bride unwedded!",
        ],
      },
    ],
  },
  nativityOfForerunner: russianFallback(
    "nativityOfForerunner",
    "Nativity of St John the Forerunner",
  ),
  peterAndPaul: russianFallback("peterAndPaul", "Holy Apostles Peter and Paul"),
  // Hapgood 1906, Transfiguration, Hymn / Collect-Hymn of the Special Service
  transfiguration: {
    title: "Transfiguration of the Lord",
    sections: [
      {
        heading: "Troparion",
        paragraphs: [
          "Thou wast transfigured upon the Mount, O Christ-God, revealing unto thy disciples thy glory in so far as they were able to bear it. Let thy light everlasting illumine us sinners also; through the prayers of the Birth-giver of God. O Light-giver, glory to thee!",
        ],
      },
      {
        heading: "Kontakion",
        paragraphs: [
          "Upon the Mount wast thou transfigured, and thy disciples, in so far as they were qualified, beheld thy glory, O Christ-God; that when they should see thee crucified they might comprehend that thy suffering was voluntary, and proclaim it unto the world: For thou art, of a truth, the effulgence of the Father.",
        ],
      },
    ],
  },
  dormition: russianFallback("dormition", "Dormition of the Theotokos"),
  beheadingOfJohn: russianFallback(
    "beheadingOfJohn",
    "Beheading of St John the Forerunner",
  ),
  // Hapgood 1906, Easter, Hymn at the Paschal Matins / Collect-Hymn of the Canon
  pascha: {
    title: "Holy Pascha",
    sections: [
      {
        heading: "Troparion",
        paragraphs: [
          "Christ is risen from the dead, trampling down Death by death, and upon those in the tomb bestowing life.",
        ],
      },
      {
        heading: "Kontakion",
        paragraphs: [
          "Though thou didst descend into the grave, O Deathless One, yet didst thou annihilate the power of Hell, and didst rise again as conqueror, O Christ our God, announcing unto the Myrrh-bearing Women: Rejoice! and giving peace unto thine Apostles, and bestowing Resurrection upon the fallen.",
        ],
      },
    ],
  },
  // Hapgood 1906, Entrance of the Lord into Jerusalem, Hymn for the Day / Collect-Hymn
  palmSunday: {
    title: "Palm Sunday",
    sections: [
      {
        heading: "Troparion",
        paragraphs: [
          "Thou didst raise Lazarus from the dead, O Christ our God, making certain the universal resurrection, before thy Passion. For which cause we also, like unto the children, bearing the emblems of victory, cry aloud unto thee, the Conqueror of Death: Hosanna in the highest! Blessed is he that cometh in the Name of the Lord.",
        ],
      },
      {
        heading: "Kontakion",
        paragraphs: [
          "O Christ-God, who in heaven art borne upon the throne, and on earth upon the foal of an ass, thou didst accept the praises of the Angels, and the hymns of the children that cried unto thee: Blessed art thou who art come to recall Adam from the dead!",
        ],
      },
    ],
  },
  lazarusSaturday: russianFallback("lazarusSaturday", "Lazarus Saturday"),
  // Hapgood 1906, Ascension, Hymn for the Day / Collect-Hymn
  ascension: {
    title: "Ascension of the Lord",
    sections: [
      {
        heading: "Troparion",
        paragraphs: [
          "Thou art ascended up into glory, O Christ our God, having made joyful thy disciples by the promise of thy Holy Spirit, the blessing which was announced unto them. For thou art the Son of God, the Redeemer of the world.",
        ],
      },
      {
        heading: "Kontakion",
        paragraphs: [
          "When thou hadst accomplished thy dispensation to usward, and hadst united things earthly with things heavenly, thou didst ascend into glory, O Christ our God, yet in no wise departing but abiding uninterruptedly with us, and crying unto those who love thee: I am with you, and none shall prevail against you.",
        ],
      },
    ],
  },
  // Hapgood 1906, Pentecost, Hymn for the Day / Collect-Hymn
  pentecost: {
    title: "Pentecost",
    sections: [
      {
        heading: "Troparion",
        paragraphs: [
          "Blessed art thou, O Christ our God, who hast revealed fishers most wise, sending down upon them the Holy Spirit, and thereby catching the universe as in a net. O Christ our God, who lovest mankind, glory to thee.",
        ],
      },
      {
        heading: "Kontakion",
        paragraphs: [
          "When the Most High confounded the tongues, he dispersed the nations: but when he distributed the tongues of fire, he called all men unto unity. Wherefore, with one accord, we glorify the All-holy Spirit.",
        ],
      },
    ],
  },
};
