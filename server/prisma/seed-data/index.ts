import type { SeedCourse } from './types';
import { DATA_STRUCTURES_ALGORITHMS_COURSE } from './v1/data-structures-algorithms';
import { LINUX_FUNDAMENTALS_COURSE } from './v1/linux-fundamentals';
import { PYTHON_BASIC_COURSE } from './v1/python-basic';
import { DATABASE_SQL_FOUNDATIONS_COURSE } from './v1/database-sql-foundations';
import type { SeedBattleSkill } from './types';

export const BATTLE_SKILL_SEEDS: SeedBattleSkill[] = [
  {
    code: 'PYTHON',
    name: 'Python',
    isEnabled: true,
    sortOrder: 100,
  },
  {
    code: 'JAVASCRIPT',
    name: 'JavaScript',
    isEnabled: false,
    sortOrder: 200,
  },
];

export const VERSIONED_COURSE_SEEDS: SeedCourse[] = [
  PYTHON_BASIC_COURSE,
  DATA_STRUCTURES_ALGORITHMS_COURSE,
  LINUX_FUNDAMENTALS_COURSE,
  DATABASE_SQL_FOUNDATIONS_COURSE,
];
