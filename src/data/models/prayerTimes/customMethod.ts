/** A model representing custom prayer time calculation method. */
export interface CustomMethod {
  readonly fajrAngle: number;
  readonly ishaAngle: number;
}

export function createCustomMethod(
  fajrAngle: number = 18.0,
  ishaAngle: number = 17.0,
): CustomMethod {
  return { fajrAngle, ishaAngle };
}

/** Get the angles array for a CustomMethod. */
export function customMethodAngles(method: CustomMethod): number[] {
  return [method.fajrAngle, 1.0, 0.0, 0.0, method.ishaAngle];
}
