import {
  decodeCommunityCursor,
  encodeCommunityCursor,
  previewCommunityText,
  toCommunityImagePreview,
  trimCommunityText,
} from './community.utils';

describe('community.utils', () => {
  it('encodes and decodes community cursors symmetrically', () => {
    const cursor = encodeCommunityCursor({
      id: '11111111-1111-4111-8111-111111111111',
    });

    expect(decodeCommunityCursor(cursor)).toEqual({
      id: '11111111-1111-4111-8111-111111111111',
    });
  });

  it('returns null for malformed cursors', () => {
    expect(decodeCommunityCursor('not-a-valid-cursor')).toBeNull();
  });

  it('trims text and builds stable previews', () => {
    expect(trimCommunityText('  hello world  ')).toBe('hello world');
    expect(previewCommunityText('  short text  ', 20)).toBe('short text');
    expect(previewCommunityText('1234567890abcdef', 10)).toBe('1234567890...');
  });

  it('limits image previews to the requested count', () => {
    expect(
      toCommunityImagePreview(
        ['a.png', 'b.png', 'c.png', 'd.png'],
        3,
      ),
    ).toEqual(['a.png', 'b.png', 'c.png']);
  });
});
