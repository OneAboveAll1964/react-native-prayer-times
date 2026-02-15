import { AsrMethod } from './asrMethod';
import { CalculationMethod } from './calculationMethod';
import { CustomMethod, createCustomMethod } from './customMethod';
import { HigherLatitudeMethod } from './higherLatitudeMethod';

/** Prayer attribute that holds all information to create prayer times object. */
export interface PrayerAttribute {
  readonly calculationMethod: CalculationMethod;
  readonly customMethod: CustomMethod;
  readonly asrMethod: AsrMethod;
  readonly higherLatitudeMethod: HigherLatitudeMethod;
  readonly offset: readonly [number, number, number, number, number, number];
}

/** Creates a PrayerAttribute with sensible defaults. */
export function createPrayerAttribute(
  overrides?: Partial<PrayerAttribute>,
): PrayerAttribute {
  return {
    calculationMethod: overrides?.calculationMethod ?? CalculationMethod.makkah,
    customMethod: overrides?.customMethod ?? createCustomMethod(),
    asrMethod: overrides?.asrMethod ?? AsrMethod.shafii,
    higherLatitudeMethod: overrides?.higherLatitudeMethod ?? HigherLatitudeMethod.angleBased,
    offset: overrides?.offset ?? [0, 0, 0, 0, 0, 0],
  };
}
