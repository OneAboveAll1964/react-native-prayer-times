import { CustomMethod, customMethodAngles } from './customMethod';

/** Prayer calculation methods. */
export enum CalculationMethod {
  /** Umm al-Qura, Makkah */
  makkah = 'makkah',
  /** Muslim World League (MWL) */
  mwl = 'mwl',
  /** Islamic Society of North America (ISNA) */
  isna = 'isna',
  /** University of Islamic Sciences, Karachi */
  karachi = 'karachi',
  /** Egyptian General Authority of Survey */
  egypt = 'egypt',
  /** Ithna Ashari */
  jafari = 'jafari',
  /** Institute of Geophysics, University of Tehran */
  tehran = 'tehran',
  /** Custom Setting */
  custom = 'custom',
}

/** Returns method parameters map for all calculation methods. */
export function getMethodParams(
  customMethod: CustomMethod,
): Record<CalculationMethod, number[]> {
  return {
    [CalculationMethod.makkah]: [18.5, 1.0, 0.0, 1.0, 90.0],
    [CalculationMethod.mwl]: [18.0, 1.0, 0.0, 0.0, 17.0],
    [CalculationMethod.isna]: [15.0, 1.0, 0.0, 0.0, 15.0],
    [CalculationMethod.karachi]: [18.0, 1.0, 0.0, 0.0, 18.0],
    [CalculationMethod.egypt]: [19.5, 1.0, 0.0, 0.0, 17.5],
    [CalculationMethod.jafari]: [16.0, 0.0, 4.0, 0.0, 14.0],
    [CalculationMethod.tehran]: [17.7, 0.0, 4.5, 0.0, 14.0],
    [CalculationMethod.custom]: customMethodAngles(customMethod),
  };
}
