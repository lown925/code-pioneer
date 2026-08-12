import type { SeedCourse } from './types';
import { JAVASCRIPT_STARTER_COURSE } from './v1/javascript-starter';
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
  JAVASCRIPT_STARTER_COURSE,
  PYTHON_BASIC_COURSE,
];
