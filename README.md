# @shkomaghdid/react-native-prayer-times

A React Native library providing Islamic data **offline** — no API keys, no network required.

- **Prayer Times** — fixed (database) and calculated using 7 methods
- **Offline Geocoder** — search, geocode, and reverse-geocode 6700+ cities
- **99 Names of Allah** — with translations and transliterations
- **Azkars (Hisnul Muslim)** — categories, chapters, and items

All data is available in **6 languages**: English, Arabic, Kurdish (Sorani), Kurdish (Badini), Farsi, and Russian.

## Installation

```bash
npm install @shkomaghdid/react-native-prayer-times @op-engineering/op-sqlite
```

Then link the bundled database into your native projects:

```bash
npx react-native-asset
```

> `@op-engineering/op-sqlite` is the only peer dependency.

## Quick Start

```ts
import { MuslimDb, LocationRepository, PrayerTimeRepository, createPrayerAttribute } from '@shkomaghdid/react-native-prayer-times';

// 1. Open once at app startup (async — copies DB from assets on first launch)
await MuslimDb.getInstance().open();

// 2. Use any repository
const location = LocationRepository.getInstance().geocoder('GB', 'London');

const prayers = PrayerTimeRepository.getInstance().getPrayerTimes({
  location: location!,
  date: new Date(),
  attribute: createPrayerAttribute(),
});

console.log(prayers?.fajr);   // Date object
console.log(prayers?.dhuhr);  // Date object
```

## API

### `MuslimDb`

| Method | Description |
|--------|-------------|
| `getInstance()` | Singleton accessor |
| `open(): Promise<void>` | Open the database (call once at startup) |
| `close(): void` | Close the database connection |

### `LocationRepository`

| Method | Returns |
|--------|---------|
| `searchLocations(name)` | `Location[]` |
| `geocoder(countryCode, cityName)` | `Location \| null` |
| `reverseGeocoder(lat, lng)` | `Location \| null` |
| `getFixedPrayerTimesList()` | `Location[]` |

### `PrayerTimeRepository`

| Method | Returns |
|--------|---------|
| `getPrayerTimes({ location, date, attribute, useFixedPrayer? })` | `PrayerTime \| null` |

`PrayerTime` contains: `fajr`, `sunrise`, `dhuhr`, `asr`, `maghrib`, `isha` — all `Date` objects.

### `NameOfAllahRepository`

| Method | Returns |
|--------|---------|
| `getNames(language?)` | `NameOfAllah[]` — `{ id, name, translation, transliteration }` |

### `HisnulMuslimRepository`

| Method | Returns |
|--------|---------|
| `getAzkarCategories(language?)` | `AzkarCategory[]` |
| `getAzkarChapters({ language?, categoryId? })` | `AzkarChapter[]` |
| `getAzkarChaptersByIds({ language?, chapterIds })` | `AzkarChapter[]` |
| `searchAzkarChapters({ language?, query })` | `AzkarChapter[]` |
| `getAzkarItems({ language?, chapterId })` | `AzkarItem[]` |

### Calculation Methods

| Key | Description |
|-----|-------------|
| `makkah` | Umm al-Qura, Makkah |
| `mwl` | Muslim World League |
| `isna` | Islamic Society of North America |
| `karachi` | University of Islamic Sciences, Karachi |
| `egypt` | Egyptian General Authority of Survey |
| `jafari` | Ithna Ashari |
| `tehran` | Institute of Geophysics, University of Tehran |
| `custom` | Custom fajr/isha angles |

### Prayer Attribute

```ts
import { createPrayerAttribute, CalculationMethod, AsrMethod, HigherLatitudeMethod } from '@shkomaghdid/react-native-prayer-times';

const attribute = createPrayerAttribute({
  calculationMethod: CalculationMethod.mwl,      // default: makkah
  asrMethod: AsrMethod.shafii,                    // default: shafii
  higherLatitudeMethod: HigherLatitudeMethod.angleBased, // default: angleBased
  offset: [0, 0, 0, 0, 0, 0],                    // [fajr, sunrise, dhuhr, asr, maghrib, isha] in minutes
});
```

### Language

```ts
import { Language } from '@shkomaghdid/react-native-prayer-times';

Language.en           // English
Language.ar           // Arabic
Language.ckb          // Kurdish (Sorani)
Language.ckbBadini    // Kurdish (Badini)
Language.fa           // Farsi
Language.ru           // Russian
```

## How It Works

This package ships a pre-populated SQLite database (~28 MB) containing prayer times, location data, azkars, and names of Allah. On install, `npx react-native-asset` copies the database into your native project's asset directories. At runtime, `open()` moves it from native assets to the documents directory where the SQLite engine can read it.

## Requirements

- React Native >= 0.71
- `@op-engineering/op-sqlite` >= 15.0.0

## Demo App

See the [My Prayers Test App](https://github.com/OneAboveAll1964/My-Prayers-React-Native-Test) for a full working example showcasing all features.

## Credits

This package is a React Native port of [muslim-data-flutter](https://github.com/kosratdev/muslim-data-flutter) by [Kosrat D. Ahmad](https://github.com/kosratdev). The database and prayer time calculation logic originate from that project.

## License

MIT
