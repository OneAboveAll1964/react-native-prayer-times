/** Location model that holds all information about a prayer location. */
export interface Location {
  readonly id: number;
  readonly name: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly countryCode: string;
  readonly countryName: string;
  readonly hasFixedPrayerTime: boolean;
  readonly prayerDependentId: number | null;
}

export function createLocation(params: {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  countryCode: string;
  countryName: string;
  hasFixedPrayerTime: boolean;
  prayerDependentId?: number | null;
}): Location {
  return {
    id: params.id,
    name: params.name,
    latitude: params.latitude,
    longitude: params.longitude,
    countryCode: params.countryCode,
    countryName: params.countryName,
    hasFixedPrayerTime: params.hasFixedPrayerTime,
    prayerDependentId: params.prayerDependentId ?? null,
  };
}
