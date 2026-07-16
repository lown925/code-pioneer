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

export type ChapterContentBlockType =
  | 'TEXT'
  | 'HEADING'
  | 'IMAGE'
  | 'CODE'
  | 'TIP'
  | 'WARNING'
  | 'EXAMPLE'
  | 'QUESTION';

export type ChapterContentBlock = {
  id: string;
  type: ChapterContentBlockType;
  sortOrder: number;
  content: Record<string, unknown>;
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

export type ChapterDetailData = {
  id: string;
  courseId: string;
  courseTitle: string;
  title: string;
  summary: string | null;
  estimatedMinutes: number;
  sortOrder: number;
  hasQuiz: boolean;
  learningStatus: 'NOT_STARTED' | 'LEARNING' | 'COMPLETED';
  previousChapterId: string | null;
  nextChapterId: string | null;
  contentBlocks: ChapterContentBlock[];
};
