import { getFormalCoreRoute, getFormalCourse } from './growth-route';

describe('formal professional learning routes', () => {
  it.each([
    ['big-data', ['python-basic', 'data-structures-algorithms', 'linux-fundamentals', 'database-sql-fundamentals', 'big-data-fundamentals', 'spark-data-processing']],
    ['computer-science', ['python-basic', 'data-structures-algorithms', 'linux-fundamentals', 'database-sql-fundamentals', 'computer-architecture-operating-systems', 'computer-networks-fundamentals']],
    ['software-engineering', ['python-basic', 'data-structures-algorithms', 'java-object-oriented-programming', 'database-sql-fundamentals', 'software-engineering-project-development', 'computer-networks-fundamentals']],
  ])('keeps the %s route in formal metadata order', (trackKey, expected) => {
    expect(getFormalCoreRoute(trackKey).map((course) => course.slug)).toEqual(expected);
  });

  it('keeps battle eligibility independent from core route membership', () => {
    expect(getFormalCourse('linux-fundamentals')?.professionalDirections).toContain('software-engineering');
    expect(getFormalCoreRoute('software-engineering').map((course) => course.slug)).not.toContain('linux-fundamentals');
  });
});
