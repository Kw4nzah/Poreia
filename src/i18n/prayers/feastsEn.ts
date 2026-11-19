// English texts of the feast hymns (troparion and kontakion of each feast).
// Source: the Orthodox Church in America, "Troparia and kontakia" pages, oca.org/saints/troparia/<date>
// (OCA translation; Slavic usage, tones as printed there). Fetched 2026-11-19 and checked word for
// word against the page. Line breaks follow the " / " line breaks of the source. Rubrics such as
// "(Original Melody)" and footnotes are left out. Copyright of the OCA; see the Sources screen.

import type { FeastPrayerId, PrayerText } from '../../prayers';

export const feastPrayerTexts: Record<FeastPrayerId, PrayerText> = {
  // https://www.oca.org/saints/troparia/2025/09/08 ; The Nativity of our Most Holy Lady the Mother of God and Ever-Virgin Mary ; Troparion Tone 4, Kontakion Tone 4
  nativityOfTheotokos: {
    title: 'Nativity of the Theotokos',
    sections: [
      { heading: 'Troparion', paragraphs: ['Your Nativity, O Virgin,\nhas proclaimed joy to the whole universe!\nThe Sun of Righteousness, Christ our God,\nhas shone from you, O Theotokos!\nBy annulling the curse,\nHe bestowed a blessing.\nBy destroying death, He has granted us eternal Life.'] },
      { heading: 'Kontakion', paragraphs: ['By your Nativity, O Most Pure Virgin,\nJoachim and Anna are freed from barrenness;\nAdam and Eve, from the corruption of death.\nAnd we, your people, freed from the guilt of sin, celebrate and sing to you:\n“The barren woman gives birth to the Theotokos, the nourisher of our life.”'] },
    ],
  },
  // https://www.oca.org/saints/troparia/2025/09/14 ; The Universal Exaltation of the Precious and Life-Giving Cross ; Troparion Tone 1, Kontakion Tone 4
  exaltationOfCross: {
    title: 'Exaltation of the Holy Cross',
    sections: [
      { heading: 'Troparion', paragraphs: ['O Lord, save Your people,\nand bless Your inheritance.\nGrant victories to the Orthodox Christians\nover their adversaries.\nAnd by virtue of Your Cross,\npreserve Your habitation.'] },
      { heading: 'Kontakion', paragraphs: ['As You were voluntarily raised upon the cross for our sake,\ngrant mercy to those who are called by Your Name, O Christ God;\nmake all Orthodox Christians glad by Your power,\ngranting them victories over their adversaries,\nby bestowing on them the Invincible trophy, Your weapon of Peace.'] },
    ],
  },
  // https://www.oca.org/saints/troparia/2025/10/01 ; The Protection of our Most Holy Lady the Mother of God and Ever-Virgin Mary ; Troparion Tone 4, Kontakion Tone 3
  protectionOfTheotokos: {
    title: 'Protection of the Theotokos',
    sections: [
      { heading: 'Troparion', paragraphs: ['On this day we, the Orthodox people, joyously keep festival,\nillumined by your coming, O Mother of God;\nand, beholding your most pure image, we cry out with compunction:\n"Cover us with your Protecting Veil and deliver us from all evil,\nentreating your Son, Christ our God, to save our souls."'] },
      { heading: 'Kontakion', paragraphs: ['Today the Virgin stands in the church,\nand with hosts of Saints, and invisibly prays to God for us.\nAngels worship with Hierarchs,\nand Apostles rejoice with Prophets,\nfor the Theotokos prays to the Pre-eternal God for us.'] },
    ],
  },
  // https://www.oca.org/saints/troparia/2025/11/21 ; The Entry of the Most Holy Mother of God into the Temple ; Troparion Tone 4, Kontakion Tone 4
  entryOfTheotokos: {
    title: 'Entry of the Theotokos into the Temple',
    sections: [
      { heading: 'Troparion', paragraphs: ['Today is the prelude of the good will of God,\nof the preaching of the salvation of mankind.\nThe Virgin appears in the temple of God,\nin anticipation proclaiming Christ to all.\nLet us rejoice\nand sing to her:\n"Rejoice, O Fulfillment of the Creator\'s dispensation."'] },
      { heading: 'Kontakion', paragraphs: ['The most pure Temple of the Savior;\nthe precious Chamber and Virgin;\nthe sacred Treasure of the glory of God,\nis presented today to the house of the Lord.\nShe brings with her the grace of the Spirit,\ntherefore, the angels of God praise her:\n“Truly this woman is the abode of heaven.”'] },
    ],
  },
  // https://www.oca.org/saints/troparia/2025/12/25 ; The Nativity of our Lord God and Savior Jesus Christ ; Troparion Tone 4, Kontakion Tone 3
  nativityOfChrist: {
    title: 'Nativity of Christ',
    sections: [
      { heading: 'Troparion', paragraphs: ['Your Nativity, O Christ our God,\nhas shone to the world the Light of knowledge;\nfor by it, those who worshipped the stars\nwere taught by a star to adore You,\nthe Sun of Righteousness,\nand to know You, the Dayspring from on High.\nO Lord, glory to You!'] },
      { heading: 'Kontakion', paragraphs: ['Today the Virgin gives birth to the Transcendent One,\nand the earth offers a cave to the Unapproachable One!\nAngels with shepherds glorify Him.\nThe wise men journey with a star,\nsince for our sake the Pre-Eternal God was born as a young Child.'] },
    ],
  },
  // https://www.oca.org/saints/troparia/2025/01/01 ; The Circumcision of our Lord and Savior Jesus Christ ; Troparion Tone 1, Kontakion Tone 3
  circumcision: {
    title: 'Circumcision of the Lord',
    sections: [
      { heading: 'Troparion', paragraphs: ['Enthroned on high with the Eternal Father and Your divine Spirit,\nO Jesus, You willed to be born on earth of the unwedded handmaid, your Mother.\nTherefore You were circumcised as an eight-day old Child.\nGlory to Your most gracious counsel;\nglory to Your dispensation;\nglory to Your condescension, O only Lover of mankind.'] },
      { heading: 'Kontakion', paragraphs: ['The Lord of all accepts to be circumcised,\nthus, as He is good, excises the sins of mortal men.\nToday He grants the world salvation,\nwhile light-bearing Basil, high priest of our Creator,\nrejoices in heaven as a divine initiate of Christ.'] },
    ],
  },
  // https://www.oca.org/saints/troparia/2025/01/06 ; Feast of the Theophany of our Lord and Savior Jesus Christ ; Troparion Tone 1, Kontakion Tone 4
  theophany: {
    title: 'Holy Theophany',
    sections: [
      { heading: 'Troparion', paragraphs: ['When You, O Lord were baptized in the Jordan\nthe worship of the Trinity was made manifest\nfor the voice of the Father bore witness to You\nand called You His beloved Son.\nAnd the Spirit, in the form of a dove,\nconfirmed the truthfulness of His word.\nO Christ, our God, You have revealed Yourself\nand have enlightened the world, glory to You!'] },
      { heading: 'Kontakion', paragraphs: ['Today You have shown forth to the world, O Lord,\nand the light of Your countenance has been marked on us.\nKnowing You, we sing Your praises.\nYou have come and revealed Yourself,\nO unapproachable Light.'] },
    ],
  },
  // https://www.oca.org/saints/troparia/2025/02/02 ; The Meeting of our Lord and Savior Jesus Christ in the Temple ; Troparion Tone 1, Kontakion Tone 1
  meetingOfTheLord: {
    title: 'Meeting of the Lord',
    sections: [
      { heading: 'Troparion', paragraphs: ['Hail, Virgin Theotokos, full of grace;\nfor from you has shone forth the Sun of Righteousness, Christ our God,\ngiving light to those in darkness.\nBe glad, O righteous Elder;\nfor you received in your arms the Redeemer of our souls,\nWho bestows upon us the resurrection.'] },
      { heading: 'Kontakion', paragraphs: ['By Your birth, You sanctified a virginal womb,\nand fittingly You blessed Simeon’s hands, O Christ God;\neven now You have saved us by anticipation.\nGrant peace to Your faithful people whom You have loved, O only Lover of mankind.'] },
    ],
  },
  // https://www.oca.org/saints/troparia/2025/03/25 ; The Annunciation of our Most Holy Lady, the Theotokos and Ever-Virgin Mary ; Troparion Tone 4, Kontakion Tone 8
  annunciation: {
    title: 'Annunciation',
    sections: [
      { heading: 'Troparion', paragraphs: ['Today is the beginning of our salvation,\nthe revelation of the eternal mystery!\nThe Son of God becomes the Son of the Virgin\nas Gabriel announces the coming of Grace.\nTogether with him let us cry to the Theotokos:\nHail, O Full of Grace,\nthe Lord is with You!'] },
      { heading: 'Kontakion', paragraphs: ['O Victorious Leader of Triumphant Hosts!\nWe, your servants, delivered from evil, sing our grateful thanks to you, O Theotokos!\nAs you possess invincible might, set us free from every calamity\nso that we may sing: Hail, O unwedded Bride!'] },
    ],
  },
  // https://www.oca.org/saints/troparia/2025/06/24 ; Nativity of the Holy Glorious Prophet, Forerunner and Baptist, John ; Troparion Tone 4, Kontakion Tone 3
  nativityOfForerunner: {
    title: 'Nativity of St John the Forerunner',
    sections: [
      { heading: 'Troparion', paragraphs: ['Prophet and Forerunner of the coming of Christ,\nalthough we cannot praise you worthily,\nwe honor you in love at your nativity,\nfor by it you ended your father’s silence and your mother’s barrenness,\nproclaiming to the world the incarnation of the Son of God!'] },
      { heading: 'Kontakion', paragraphs: ['Today the formerly barren woman gives birth to Christ’s Forerunner,\nwho is the fulfillment of every prophecy;\nfor in the Jordan,\nwhen he laid his hand on the One foretold by the prophets,\nhe was revealed as Prophet, Herald, and Forerunner of God the Word.'] },
    ],
  },
  // https://www.oca.org/saints/troparia/2025/06/29 ; The Holy Glorious and All-Praised Leaders of the Apostles, Peter and Paul ; Troparion Tone 4, Kontakion Tone 2
  peterAndPaul: {
    title: 'Holy Apostles Peter and Paul',
    sections: [
      { heading: 'Troparion', paragraphs: ['O foremost of the Apostles and teachers of the inhabited earth,\nintercede with the Master of all\nto grant peace to the world and great mercy to our souls.'] },
      { heading: 'Kontakion', paragraphs: ['You received the steadfast and divinely-inspired Heralds, O Lord, the Foremost Apostles,\nfor the enjoyment of Your blessings and repose.\nFor You recognized their labors and death as greater than any burnt offering,\nfor You alone know what is in the hearts of men.'] },
    ],
  },
  // https://www.oca.org/saints/troparia/2025/08/06 ; The Holy Transfiguration of our Lord God and Savior Jesus Christ (the Second "Feast of the Savior" in August) ; Troparion Tone 7, Kontakion Tone 7
  transfiguration: {
    title: 'Transfiguration of the Lord',
    sections: [
      { heading: 'Troparion', paragraphs: ['You were transfigured on the mountain, O Christ God,\nrevealing Your glory to Your disciples as far as they could bear it.\nLet Your everlasting Light also shine upon us sinners,\nthrough the prayers of the Theotokos.\nO Giver of Light, glory to You!'] },
      { heading: 'Kontakion', paragraphs: ['On the Mountain You were Transfigured, O Christ God,\nand Your disciples beheld Your glory as far as they could see it;\nso that when they would behold You crucified,\nthey would understand that Your suffering was voluntary,\nand would proclaim to the world,\nthat You are truly the Radiance of the Father!'] },
    ],
  },
  // https://www.oca.org/saints/troparia/2025/08/15 ; The Dormition of our Most Holy Lady the Mother of God and Ever-Virgin Mary ; Troparion Tone 1, Kontakion Tone 2
  dormition: {
    title: 'Dormition of the Theotokos',
    sections: [
      { heading: 'Troparion', paragraphs: ['In giving birth, you preserved your virginity,\nand in falling asleep you did not forsake the world, O Theotokos.\nYou passed into life as the Mother of Life,\nand by your prayers, you deliver our souls from death.'] },
      { heading: 'Kontakion', paragraphs: ['Neither the tomb, nor death had power over the Theotokos,\nwho is unsleeping in her intercessions and an unchanging hope in her protection.\nFor as the Mother of Life,\nshe was translated into life by Him who dwelt in her ever-virginal womb.'] },
    ],
  },
  // https://www.oca.org/saints/troparia/2025/08/29 ; The Beheading of the Holy Glorious Prophet, Forerunner, and Baptist John ; Troparion Tone 2, Kontakion Tone 5
  beheadingOfJohn: {
    title: 'Beheading of St John the Forerunner',
    sections: [
      { heading: 'Troparion', paragraphs: ['The memory of the righteous is celebrated with hymns of praise,\nbut the Lord’s testimony is sufficient for you, O Forerunner.\nYou were shown in truth to be the most honorable of the prophets,\nfor you were deemed worthy to baptize in the streams of the Jordan Him whom they foretold.\nTherefore, having suffered for the truth with joy,\nyou proclaimed to those in hell God who appeared in the flesh,\nwho takes away the sin of the world,\nand grants us great mercy.'] },
      { heading: 'Kontakion', paragraphs: ['The glorious beheading of the Forerunner,\nbecame an act of divine dispensation,\nfor he preached to those in hell the coming of the Savior.\nLet Herodias lament, for she entreated lawless murder,\nloving not the law of God, nor eternal life,\nbut that which is false and temporal.'] },
    ],
  },
  // https://www.oca.org/saints/troparia/2025/04/20 ; HOLY PASCHA: The Resurrection of Our Lord ; Troparion Tone 4, Kontakion Tone 8
  pascha: {
    title: 'Holy Pascha',
    sections: [
      { heading: 'Troparion', paragraphs: ['Christ is risen from the dead,\ntrampling down death by death,\nand upon those in the tombs bestowing life!'] },
      { heading: 'Kontakion', paragraphs: ['You descended into the tomb, O Immortal,\nYou destroyed the power of death.\nIn victory You arose, O Christ God,\nproclaiming: “Rejoice!” to the Myrrhbearing Women,\ngranting peace to Your Apostles, and bestowing Resurrection on the fallen.'] },
    ],
  },
  // https://www.oca.org/saints/troparia/2025/04/13 ; Entry of Our Lord into Jerusalem (Palm Sunday) ; Troparion Tone 1, Kontakion Tone 6
  palmSunday: {
    title: 'Palm Sunday',
    sections: [
      { heading: 'Troparion', paragraphs: ['By raising Lazarus from the dead before Your passion,\nYou did confirm the universal Resurrection, O Christ God!\nLike the children with the palms of victory,\nwe cry out to You, O Vanquisher of death:\nHosanna in the Highest!\nBlessed is He that comes in the Name of the Lord!'] },
      { heading: 'Kontakion', paragraphs: ['Sitting on Your throne in heaven,\ncarried on a foal on earth, O Christ God!\nAccept the praise of angels and the songs of children who sing:\nBlessed is He that comes to recall Adam!'] },
    ],
  },
  // https://www.oca.org/saints/troparia/2025/04/12 ; The Raising of Lazarus (Lazarus Saturday) ; Troparion Tone 1, Kontakion Tone 2
  lazarusSaturday: {
    title: 'Lazarus Saturday',
    sections: [
      { heading: 'Troparion', paragraphs: ['By raising Lazarus from the dead before Your passion,\nYou did confirm the universal Resurrection, O Christ God!\nLike the children with the palms of victory,\nwe cry out to You, O Vanquisher of death:\nHosanna in the Highest!\nBlessed is He that comes in the Name of the Lord!'] },
      { heading: 'Kontakion', paragraphs: ['Christ the Joy, the Truth and the Light of all,\nthe Life of the World and the Resurrection\nhas appeared in His goodness, to those on earth.\nHe has become the Image of our Resurrection,\ngranting divine forgiveness to all!'] },
    ],
  },
  // https://www.oca.org/saints/troparia/2025/05/29 ; The Ascension of our Lord ; Troparion Tone 4, Kontakion Tone 6
  ascension: {
    title: 'Ascension of the Lord',
    sections: [
      { heading: 'Troparion', paragraphs: ['O Christ God, You have ascended in Glory,\ngranting joy to Your disciples by the promise of the Holy Spirit.\nThrough the blessing they were assured\nthat You are the Son of God,\nthe Redeemer of the world!'] },
      { heading: 'Kontakion', paragraphs: ['When You had fulfilled the dispensation for our sake,\nand united earth to heaven:\nYou ascended in glory, O Christ our God,\nnot being parted from those who love You,\nbut remaining with them and crying:\n“I am with you and no one will be against you!”'] },
    ],
  },
  // https://www.oca.org/saints/troparia/2025/06/08 ; Holy Pentecost ; Troparion Tone 8, Kontakion Tone 8
  pentecost: {
    title: 'Pentecost',
    sections: [
      { heading: 'Troparion', paragraphs: ['Blessed are You O Christ Our God\nYou have revealed the fishermen as most wise\nby sending down upon them the Holy Spirit\nthrough them You drew the world into Your net\nO Lover of Man, Glory to You!'] },
      { heading: 'Kontakion', paragraphs: ['When the most High came down and confused the tongues,\nHe divided the nations;\nbut when he distributed the tongues of fire\nHe called all to unity.\nTherefore, with one voice, we glorify the All-holy Spirit!'] },
    ],
  },
};
