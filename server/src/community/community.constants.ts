export const COMMUNITY_CATEGORY_KEYS = [
  'LEARNING',
  'BATTLE',
  'CODE_HELP',
  'CAREER',
  'GENERAL',
] as const;

export type CommunityCategoryKey =
  (typeof COMMUNITY_CATEGORY_KEYS)[number];

export const COMMUNITY_DEFAULT_CATEGORIES = [
  {
    key: 'LEARNING' as const,
    name: '学习交流',
    description: '分享课程、章节和学习方法。',
    sortOrder: 1,
  },
  {
    key: 'BATTLE' as const,
    name: 'Battle 讨论',
    description: '围绕对战策略、题目和复盘展开交流。',
    sortOrder: 2,
  },
  {
    key: 'CODE_HELP' as const,
    name: '代码求助',
    description: '讨论代码实现、报错排查和写法优化。',
    sortOrder: 3,
  },
  {
    key: 'CAREER' as const,
    name: '求职与工作',
    description: '讨论实习、面试、就业和职业规划。',
    sortOrder: 4,
  },
  {
    key: 'GENERAL' as const,
    name: '综合交流',
    description: '其他与码站先锋相关的话题都可以在这里发布。',
    sortOrder: 5,
  },
] as const;

export const COMMUNITY_POST_LIMIT_DEFAULT = 10;
export const COMMUNITY_POST_LIMIT_MAX = 20;
export const COMMUNITY_VIEW_COUNT_WINDOW_MS = 5 * 60 * 1000;
