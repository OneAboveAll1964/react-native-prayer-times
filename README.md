# React Native Muslim Data

A React Native library providing Islamic data including:

- **Prayer Times** — Fixed (from database) or Calculated (astronomical formulas)
- **Offline Geocoding** — Search locations, geocode, reverse geocode
- **Azkars (Hisnul Muslim)** — Categories, chapters, and items with translations
- **99 Names of Allah** — With translations in multiple languages

Ported from [muslim-data-flutter](https://github.com/my-prayers/muslim-data-flutter).

## Supported Languages

`en`, `ar`, `ckb`, `ckb_Badini`, `fa`, `ru`

## Installation

```bash
npm install react-native-muslim-data @op-engineering/op-sqlite
```

`@op-engineering/op-sqlite` is the only peer dependency (for SQLite access).

### Database Setup

This package includes a pre-populated SQLite database (`muslim_db_v3.0.0.db`).
You must bundle it with your app:

**Android:**
Copy `muslim_db_v3.0.0.db` into `android/app/src/main/assets/`.

**iOS:**
Add `muslim_db_v3.0.0.db` to your Xcode project (drag into the project navigator and ensure it's included in the app target's "Copy Bundle Resources" build phase).

## Usage

### Initialize

Call `open()` once at app startup before using any repository:

```ts
import { MuslimDb } from 'react-native-muslim-data';

MuslimDb.getInstance().open();
```

### Location Services

```ts
import { LocationRepository } from 'react-native-muslim-data';

const locationRepo = LocationRepository.getInstance();

// Search for locations
const locations = locationRepo.searchLocations('makka');

// Geocode by country code + city name
const location = locationRepo.geocoder('GB', 'London');

// Reverse geocode by coordinates
const nearest = locationRepo.reverseGeocoder(51.5074, -0.1278);
```

### Prayer Times

```ts
import {
  PrayerTimeRepository,
  createPrayerAttribute,
  CalculationMethod,
  AsrMethod,
  HigherLatitudeMethod,
} from 'react-native-muslim-data';

const prayerRepo = PrayerTimeRepository.getInstance();

const attribute = createPrayerAttribute({
  calculationMethod: CalculationMethod.makkah,
  asrMethod: AsrMethod.shafii,
  higherLatitudeMethod: HigherLatitudeMethod.angleBased,
  offset: [0, 0, 0, 0, 0, 0],
});

// `location` obtained from LocationRepository
const prayerTime = prayerRepo.getPrayerTimes({
  location,
  date: new Date(),
  attribute,
});

if (prayerTime) {
  console.log('Fajr:', prayerTime.fajr);
  console.log('Sunrise:', prayerTime.sunrise);
  console.log('Dhuhr:', prayerTime.dhuhr);
  console.log('Asr:', prayerTime.asr);
  console.log('Maghrib:', prayerTime.maghrib);
  console.log('Isha:', prayerTime.isha);
}
```

### Azkars (Hisnul Muslim)

```ts
import { HisnulMuslimRepository, Language } from 'react-native-muslim-data';

const azkarRepo = HisnulMuslimRepository.getInstance();

// Get all azkar categories
const categories = azkarRepo.getAzkarCategories(Language.en);

// Get chapters for a category
const chapters = azkarRepo.getAzkarChapters({
  language: Language.en,
  categoryId: 1,
});

// Get chapters by IDs (useful for favorites)
const favoriteChapters = azkarRepo.getAzkarChaptersByIds({
  language: Language.en,
  chapterIds: [12, 15],
});

// Search azkar chapters
const results = azkarRepo.searchAzkarChapters({
  language: Language.ar,
  query: 'morning',
});

// Get azkar items for a chapter
const items = azkarRepo.getAzkarItems({
  language: Language.en,
  chapterId: 1,
});
```

### Names of Allah

```ts
import { NameOfAllahRepository, Language } from 'react-native-muslim-data';

const namesRepo = NameOfAllahRepository.getInstance();
const names = namesRepo.getNames(Language.en);
```

## Project Structure

```
src/
├── index.ts                              # Main entry point
├── data/
│   ├── database/
│   │   ├── muslimDb.ts                   # SQLite singleton wrapper
│   │   ├── muslimDao.ts                  # Data access object
│   │   └── rowQuery.ts                   # SQL query builder
│   └── models/
│       ├── language.ts                   # Supported languages enum
│       ├── azkars/
│       │   ├── azkarCategory.ts
│       │   ├── azkarChapter.ts
│       │   └── azkarItem.ts
│       ├── location/
│       │   └── location.ts
│       ├── names/
│       │   └── nameOfAllah.ts
│       └── prayerTimes/
│           ├── asrMethod.ts
│           ├── calculatedPrayerTime.ts   # Astronomical prayer time calculator
│           ├── calculationMethod.ts
│           ├── customMethod.ts
│           ├── higherLatitudeMethod.ts
│           ├── prayerAttribute.ts
│           └── prayerTime.ts
├── repositories/
│   ├── locationRepository.ts
│   ├── prayerTimeRepository.ts
│   ├── nameOfAllahRepository.ts
│   └── hisnulMuslimRepository.ts
└── utils/
    ├── dateUtils.ts
    └── stringDate.ts
```

## License

MIT
