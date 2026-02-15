import { open, type DB } from '@op-engineering/op-sqlite';

const DB_NAME = 'muslim_db_v3.0.0.db';

/** Database row as a generic key-value map. */
export type DbRow = Record<string, unknown>;

/**
 * Singleton wrapper around the Muslim Data SQLite database.
 *
 * The pre-populated database must be bundled with your app:
 * - **iOS**: Place `muslim_db_v3.0.0.db` in the app bundle (add to Xcode project).
 * - **Android**: Place `muslim_db_v3.0.0.db` in `android/app/src/main/assets/`.
 *
 * op-sqlite will automatically look for the file in the app bundle / assets
 * when using `open({ name })` without a `location`.
 */
export class MuslimDb {
  private static instance: MuslimDb | null = null;
  private db: DB | null = null;

  private constructor() {}

  /** Get or create the singleton instance. */
  static getInstance(): MuslimDb {
    if (!MuslimDb.instance) {
      MuslimDb.instance = new MuslimDb();
    }
    return MuslimDb.instance;
  }

  /** Open the database connection. Must be called once before any queries. */
  open(): void {
    if (this.db) return;
    this.db = open({ name: DB_NAME });
    this.db.execute('PRAGMA foreign_keys = ON');
  }

  /** Execute a raw SQL query and return all result rows. */
  query(sql: string): DbRow[] {
    this.ensureOpen();
    const result = this.db!.execute(sql);
    if (!result.rows || result.rows.length === 0) {
      return [];
    }

    // op-sqlite returns rows as an array of arrays with column names separately.
    // Convert to array of objects.
    const columns: string[] = result.columnNames ?? [];
    const rows: DbRow[] = [];
    for (const rawRow of result.rows._array ?? result.rows) {
      if (Array.isArray(rawRow)) {
        const obj: DbRow = {};
        for (let i = 0; i < columns.length; i++) {
          obj[columns[i]] = rawRow[i];
        }
        rows.push(obj);
      } else {
        // Already an object
        rows.push(rawRow as DbRow);
      }
    }
    return rows;
  }

  /** Execute a raw SQL query and return the first result row, or null. */
  querySingle(sql: string): DbRow | null {
    const rows = this.query(sql);
    return rows.length > 0 ? rows[0] : null;
  }

  /** Close the database connection. */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  private ensureOpen(): void {
    if (!this.db) {
      throw new Error(
        'MuslimDb is not open. Call MuslimDb.getInstance().open() before querying.',
      );
    }
  }
}
