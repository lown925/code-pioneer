import { COURSE_CATALOG, getTrackDefinition, getTrackForMajor, PROFESSIONAL_TRACK_CATALOG } from './course-catalog';

describe('professional course catalog', () => {
  it('defines stable track identities and shared course mappings', () => {
    expect(PROFESSIONAL_TRACK_CATALOG.map((track) => track.trackKey)).toEqual([
      'big-data', 'computer-science', 'software-engineering',
    ]);
    expect(COURSE_CATALOG.find((course) => course.slug === 'data-structures-algorithms')?.professionalTracks).toEqual([
      'computer-science', 'software-engineering', 'big-data',
    ]);
    expect(getTrackDefinition('big-data')?.formalName).toBe('数据科学与大数据技术');
  });

  it('keeps future courses in metadata without requiring page mappings', () => {
    expect(COURSE_CATALOG.find((course) => course.slug === 'linux-fundamentals')).toMatchObject({
      professionalTracks: ['computer-science', 'big-data', 'software-engineering'],
    });
  });

  it('resolves a profile major to one stable track identity', () => {
    expect(getTrackForMajor('major.data_science_big_data')?.trackKey).toBe('big-data');
    expect(getTrackForMajor('major.computer_science')?.trackKey).toBe('computer-science');
    expect(getTrackForMajor('major.software_engineering')?.trackKey).toBe('software-engineering');
    expect(getTrackForMajor('custom:other')).toBeNull();
  });
});
