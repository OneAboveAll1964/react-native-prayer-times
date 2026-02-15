/** Azkar Item model that holds azkar item information. */
export interface AzkarItem {
  readonly id: number;
  readonly chapterId: number;
  readonly item: string | null;
  readonly transliteration: string | null;
  readonly count: number | null;
  readonly topNote: string | null;
  readonly bottomNote: string | null;
  readonly translation: string | null;
  readonly reference: string;
}
