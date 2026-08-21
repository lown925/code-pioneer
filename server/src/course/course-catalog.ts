import { FORMAL_COURSE_PLAN } from '../../prisma/seed-data/formal-course-plan';

export type ProfessionalTrackDefinition = {
  trackKey: string;
  formalName: string;
  shortName: string;
  majorKeys: readonly string[];
};

export type ProfessionalTrackIdentity = {
  trackKey: string;
  formalName: string;
  shortName: string;
};

export type CourseCatalogEntry = {
  slug: string;
  order: number;
  implementationLanguage: string | null;
  subjectCategory: string;
  professionalTracks: readonly string[];
  interests: readonly string[];
  prerequisites: readonly string[];
  nextCourses: readonly string[];
};

export const PROFESSIONAL_TRACK_CATALOG: readonly ProfessionalTrackDefinition[] = [
  {
    trackKey: 'big-data',
    formalName: '数据科学与大数据技术',
    shortName: '大数据',
    majorKeys: ['major.data_science_big_data', 'major.big_data_management'],
  },
  {
    trackKey: 'computer-science',
    formalName: '计算机科学与技术',
    shortName: '计算机',
    majorKeys: ['major.computer_science'],
  },
  {
    trackKey: 'software-engineering',
    formalName: '软件工程',
    shortName: '软件工程',
    majorKeys: ['major.software_engineering'],
  },
];

export const COURSE_CATALOG: readonly CourseCatalogEntry[] = FORMAL_COURSE_PLAN.map(
  (course) => ({
    slug: course.slug,
    order: course.order,
    implementationLanguage: course.implementationLanguage,
    subjectCategory: course.subjectCategory,
    professionalTracks: course.professionalDirections,
    interests: course.interests,
    prerequisites: course.prerequisites,
    nextCourses: course.nextCourses,
  }),
);

export const getTrackDefinition = (trackKey: string) =>
  PROFESSIONAL_TRACK_CATALOG.find((item) => item.trackKey === trackKey) ?? null;

export const getTrackForMajor = (major: string | null | undefined) =>
  PROFESSIONAL_TRACK_CATALOG.find((track) => track.majorKeys.includes(major ?? '')) ?? null;

export const getProfessionalTrackIdentity = (
  trackKey: string | null | undefined,
): ProfessionalTrackIdentity | null => {
  const track = trackKey ? getTrackDefinition(trackKey) : null;
  return track
    ? { trackKey: track.trackKey, formalName: track.formalName, shortName: track.shortName }
    : null;
};

export const getCourseCatalogEntry = (slug: string) =>
  COURSE_CATALOG.find((item) => item.slug === slug) ?? null;
