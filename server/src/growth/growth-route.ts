import { FORMAL_COURSE_PLAN } from '../../prisma/seed-data/formal-course-plan';

export const getFormalCoreRoute = (trackKey: string) =>
  FORMAL_COURSE_PLAN
    .filter((course) => course.coreRouteOrder[trackKey] !== undefined)
    .sort(
      (left, right) =>
        (left.coreRouteOrder[trackKey] ?? Number.MAX_SAFE_INTEGER) -
          (right.coreRouteOrder[trackKey] ?? Number.MAX_SAFE_INTEGER),
    );

export const getFormalCourse = (slug: string) =>
  FORMAL_COURSE_PLAN.find((course) => course.slug === slug) ?? null;
