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
  category: string;
  language: string | null;
  difficulty: CourseDifficulty;
  estimatedMinutes: number;
  chapterCount: number;
  learnerCount: number;
  order?: number;
  implementationLanguage?: string | null;
  subjectCategory?: string;
  professionalTracks?: string[];
  interests?: string[];
  prerequisites?: string[];
  nextCourses?: string[];
  progressPercent: number;
  isSelected: boolean;
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
  category: string;
  language: string | null;
  difficulty: CourseDifficulty;
  estimatedMinutes: number;
  targetAudience: string | null;
  learningObjectives: unknown;
  learnerCount: number;
  progressPercent: number;
  isSelected: boolean;
  chapters: CourseChapter[];
};

export type CourseSelectionResponse = {
  courseId: string;
  selected: boolean;
  alreadySelected?: boolean;
  alreadyDeselected?: boolean;
  progressPreserved: boolean;
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
