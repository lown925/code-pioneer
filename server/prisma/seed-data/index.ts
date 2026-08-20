import type { SeedCourse } from './types';
import { DATA_STRUCTURES_ALGORITHMS_COURSE } from './v1/data-structures-algorithms';
import { PYTHON_BASIC_COURSE } from './v1/python-basic';
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
];
