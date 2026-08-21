import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('professional track migration', () => {
  it('is forward-only and preserves legacy data', () => {
    const sql = readFileSync(
      resolve(
        __dirname,
        '../../prisma/migrations/20260821120000_add_professional_track_scope/migration.sql',
      ),
      'utf8',
    );

    expect(sql).toMatch(/ADD COLUMN "professional_track_key" TEXT/);
    expect(sql).toMatch(/CREATE TABLE "user_battle_track_ratings"/);
    expect(sql).toMatch(/"track_key" TEXT NOT NULL/);
    expect(sql).toMatch(/user_battle_track_ratings_user_id_track_key_key/);
    expect(sql).not.toMatch(/\b(?:DROP|DELETE\s+FROM|TRUNCATE)\b/i);
    expect(sql).not.toMatch(/ALTER\s+TYPE/i);
  });
});
