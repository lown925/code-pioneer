import type { SeedCourse } from './types';
import { DATA_STRUCTURES_ALGORITHMS_COURSE } from './v1/data-structures-algorithms';
import { LINUX_FUNDAMENTALS_COURSE } from './v1/linux-fundamentals';
import { PYTHON_BASIC_COURSE } from './v1/python-basic';
import { DATABASE_SQL_FOUNDATIONS_COURSE } from './v1/database-sql-foundations';
import { COMPUTER_ARCHITECTURE_OPERATING_SYSTEMS_COURSE } from './v1/computer-architecture-operating-systems';
import { COMPUTER_NETWORKS_FUNDAMENTALS_COURSE } from './v1/computer-networks-fundamentals';
import { JAVA_OBJECT_ORIENTED_PROGRAMMING_COURSE } from './v1/java-object-oriented-programming';
import { SOFTWARE_ENGINEERING_PROJECT_DEVELOPMENT_COURSE } from './v1/software-engineering-project-development';
import { BIG_DATA_FUNDAMENTALS_COURSE } from './v1/big-data-fundamentals';
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
  COMPUTER_ARCHITECTURE_OPERATING_SYSTEMS_COURSE,
  COMPUTER_NETWORKS_FUNDAMENTALS_COURSE,
  JAVA_OBJECT_ORIENTED_PROGRAMMING_COURSE,
  SOFTWARE_ENGINEERING_PROJECT_DEVELOPMENT_COURSE,
  BIG_DATA_FUNDAMENTALS_COURSE,
];
