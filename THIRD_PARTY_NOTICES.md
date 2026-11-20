# Third-party notices

This file lists the sources of the texts and data in Poreia, and the links it
opens. Software dependencies are listed in [package.json](package.json) and their
licences come with each package.

## Scripture text bundled with the app

The app bundles only the New Testament and Old Testament readings it displays,
built by `scripts/build-reading-texts.mjs`:

- **English:** Berean Standard Bible (BSB) for the New Testament, from eBible.org.
  Old Testament and deuterocanon: LXX2012 (Septuagint numbering), from eBible.org.
  Both are public domain as published by eBible.org.
- **Russian:** Synodal Translation (1876), from eBible.org, public domain. It covers
  the New Testament only; Old Testament readings are shown as references.

## Lectionary data

`scripts/build-commemorations.mjs` builds the saints, feast days and reading
references from the orthocal.info API (Orthodox Church in America lectionary).
The project's code is MIT-licensed; only the names, feast titles and scripture
references are used. The saints' lives and the English verse text from that API
are not included.

## Prayers

- **English:** Lord's Prayer, Creed, O Heavenly King, Trisagion and the Prayer of
  St. Ephraim from *Orthodox Daily Prayers* (St Tikhon's Seminary Press, 1982), as
  published by Project Gutenberg (eBook #34981). The morning, evening and meal
  prayers are translations prepared for this app. The Prayer of Manasseh is the
  King James Version (Apocrypha), public domain.
- **Russian:** Church Slavonic texts in the public domain, checked against
  azbyka.ru (Молитвослов). The prayer for the saints (`Молитвенное призывание
  святого`) is also from azbyka.ru.
- **Turkish:** translated for this app; no published reference was used.

## Links to other services

These translations are under copyright and are not stored in the app. Each reading
has a link that opens the same passage on YouVersion (bible.com), or in the
YouVersion app if it is installed:

- English: Revised Standard Version, Catholic Interconfessional (RSVCI)
- Turkish: Kutsal Kitap ve Deuterokanonik Kitaplar (KKDEU), Bible Society in Turkey
- Russian: Synodal Translation

The app also links to the project page on GitHub from the Settings screen.

## Icon

The app icon was drawn for this app.

## Fonts

The home-screen widget titles use **Noto Serif Bold**, from the Noto Project
(https://github.com/notofonts/latin-greek-cyrillic), obtained through the
`@expo-google-fonts/noto-serif` npm package. `assets/fonts/NotoSerif-Bold.ttf` is a
subset of the original (Latin, Latin Extended-A, Cyrillic and common punctuation) to keep
it small; no glyph was changed. It is licensed under the SIL Open Font License 1.1, copied
below. The app's own titles use the system serif font, which is not bundled.

```
Copyright 2022 The Noto Project Authors (https://github.com/notofonts/latin-greek-cyrillic)

This Font Software is licensed under the SIL Open Font License, Version 1.1.
This license is copied below, and is also available with a FAQ at:
https://scripts.sil.org/OFL

-----------------------------------------------------------
SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007
-----------------------------------------------------------

PREAMBLE
The goals of the Open Font License (OFL) are to stimulate worldwide
development of collaborative font projects, to support the font creation
efforts of academic and linguistic communities, and to provide a free and
open framework in which fonts may be shared and improved in partnership
with others.

The OFL allows the licensed fonts to be used, studied, modified and
redistributed freely as long as they are not sold by themselves. The
fonts, including any derivative works, can be bundled, embedded, 
redistributed and/or sold with any software provided that any reserved
names are not used by derivative works. The fonts and derivatives,
however, cannot be released under any other type of license. The
requirement for fonts to remain under this license does not apply
to any document created using the fonts or their derivatives.

DEFINITIONS
"Font Software" refers to the set of files released by the Copyright
Holder(s) under this license and clearly marked as such. This may
include source files, build scripts and documentation.

"Reserved Font Name" refers to any names specified as such after the
copyright statement(s).

"Original Version" refers to the collection of Font Software components as
distributed by the Copyright Holder(s).

"Modified Version" refers to any derivative made by adding to, deleting,
or substituting -- in part or in whole -- any of the components of the
Original Version, by changing formats or by porting the Font Software to a
new environment.

"Author" refers to any designer, engineer, programmer, technical
writer or other person who contributed to the Font Software.

PERMISSION & CONDITIONS
Permission is hereby granted, free of charge, to any person obtaining
a copy of the Font Software, to use, study, copy, merge, embed, modify,
redistribute, and sell modified and unmodified copies of the Font
Software, subject to the following conditions:

1) Neither the Font Software nor any of its individual components,
in Original or Modified Versions, may be sold by itself.

2) Original or Modified Versions of the Font Software may be bundled,
redistributed and/or sold with any software, provided that each copy
contains the above copyright notice and this license. These can be
included either as stand-alone text files, human-readable headers or
in the appropriate machine-readable metadata fields within text or
binary files as long as those fields can be easily viewed by the user.

3) No Modified Version of the Font Software may use the Reserved Font
Name(s) unless explicit written permission is granted by the corresponding
Copyright Holder. This restriction only applies to the primary font name as
presented to the users.

4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font
Software shall not be used to promote, endorse or advertise any
Modified Version, except to acknowledge the contribution(s) of the
Copyright Holder(s) and the Author(s) or with their explicit written
permission.

5) The Font Software, modified or unmodified, in part or in whole,
must be distributed entirely under this license, and must not be
distributed under any other license. The requirement for fonts to
remain under this license does not apply to any document created
using the Font Software.

TERMINATION
This license becomes null and void if any of the above conditions are
not met.

DISCLAIMER
THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT
OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE
COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL
DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM
OTHER DEALINGS IN THE FONT SOFTWARE.
```

## azbyka.ru

The Church Slavonic and Russian texts of the services in `src/liturgy/data/` (Divine
Liturgies, daily services, sacraments, canons, feasts, Lent, Pascha, Octoechos, hymns) come from
azbyka.ru (https://azbyka.ru/bogosluzhenie/, "Переводы богослужений"; Russian translation:
hieromonk Ambrose (Timrot)). They are used with the written permission of azbyka.ru and are
removed on request. The Russian prayers and feast hymns are checked against azbyka.ru with the
same permission.
