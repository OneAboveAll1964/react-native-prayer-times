import { open, moveAssetsDatabase, type DB } from '@op-engineering/op-sqlite';

const DB_NAME = 'muslim_db_v3.0.0.db';

/** Database row as a generic key-value map. */
export type DbRow = Record<string, unknown>;

/**
 * Singleton wrapper around the Muslim Data SQLite database.
 *
 * The pre-populated database is bundled with the app via `react-native-asset`.
 * On first launch, `moveAssetsDatabase` copies it from native assets to the
 * documents directory where op-sqlite can open it.
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

  /**
   * Open the database connection. Must be called once before any queries.
   * This is async because it needs to copy the DB from native assets on first launch.
   */
  async open(): Promise<void> {
    if (this.db) return;

    // Copy pre-populated DB from native assets to documents directory.
    // Does NOT overwrite if it already exists, so this is safe to call every launch.
    await moveAssetsDatabase({ filename: DB_NAME });

    this.db = open({ name: DB_NAME });
    this.db.executeSync('PRAGMA foreign_keys = ON');
  }

  /** Execute a raw SQL query and return all result rows. */
  query(sql: string): DbRow[] {
    this.ensureOpen();
    const result = this.db!.executeSync(sql);
    return (result.rows ?? []) as DbRow[];
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
        'MuslimDb is not open. Call await MuslimDb.getInstance().open() before querying.',
      );
    }
  }
}
