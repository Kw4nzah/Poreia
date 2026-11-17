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
