export type CourseDifficulty =
  | 'BEGINNER'
  | 'BASIC'
  | 'INTERMEDIATE'
  | 'ADVANCED';

export type CourseListItem = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  coverUrl: string | null;
  difficulty: CourseDifficulty;
  estimatedMinutes: number;
  chapterCount: number;
  learnerCount: number;
  progressPercent: number;
};

export type CourseListData = {
  items: CourseListItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
  };
};

export type CourseChapter = {
  id: string;
  title: string;
  summary: string | null;
  estimatedMinutes: number;
  sortOrder: number;
};

export type CourseDetailData = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string | null;
  coverUrl: string | null;
  difficulty: CourseDifficulty;
  estimatedMinutes: number;
  targetAudience: string | null;
  learningObjectives: unknown;
  learnerCount: number;
  progressPercent: number;
  chapters: CourseChapter[];
};
