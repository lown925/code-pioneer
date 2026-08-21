export type ProfessionalTrack = {
  trackKey: string;
  formalName: string;
  shortName: string;
};

export type CourseCapability = {
  courseId: string;
  slug: string;
  title: string;
  order?: number;
  implementationLanguage: string | null;
  subjectCategory: string;
  professionalTracks: string[];
  interests?: string[];
  practiceQuestionCount: number;
  battleQuestionCount: number;
  supportsPractice: boolean;
  supportsBattle: boolean;
};

export type CourseCapabilityResponse = {
  items: CourseCapability[];
  tracks: ProfessionalTrack[];
};
