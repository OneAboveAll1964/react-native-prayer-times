import { MuslimDao } from '../data/database/muslimDao';
import { Location } from '../data/models/location/location';

/** Repository for accessing location data. */
export class LocationRepository {
  private static instance: LocationRepository | null = null;
  private readonly dao: MuslimDao;

  private constructor(dao: MuslimDao) {
    this.dao = dao;
  }

  static getInstance(dao?: MuslimDao): LocationRepository {
    if (!LocationRepository.instance) {
      LocationRepository.instance = new LocationRepository(
        dao ?? MuslimDao.getInstance(),
      );
    }
    return LocationRepository.instance;
  }

  /**
   * Search for locations by the given locationName.
   * Returns a list of locations that match the search query.
   */
  searchLocations(locationName: string): Location[] {
    try {
      return this.dao.searchLocations(locationName);
    } catch {
      return [];
    }
  }

  /**
   * Get the location by the given countryCode and locationName.
   * Returns the location if found, otherwise returns null.
   */
  geocoder(countryCode: string, locationName: string): Location | null {
    try {
      return this.dao.geocoder(countryCode, locationName);
    } catch {
      return null;
    }
  }

  /**
   * Get the location by the given latitude and longitude.
   * Returns the closest location if found, otherwise returns null.
   */
  reverseGeocoder(latitude: number, longitude: number): Location | null {
    try {
      return this.dao.reverseGeocoder(latitude, longitude);
    } catch {
      return null;
    }
  }

  /**
   * Get the list of locations with fixed prayer times.
   */
  getFixedPrayerTimesList(): Location[] {
    try {
      return this.dao.getFixedPrayerTimesList();
    } catch {
      return [];
    }
  }
}
