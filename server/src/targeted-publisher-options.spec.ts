import { findStaleTargetedPublisherOptionIds } from '../scripts/targeted-publisher';

describe('targeted publisher option maintenance', () => {
  it('identifies matching, reduced, and empty source option sets', () => {
    expect(findStaleTargetedPublisherOptionIds(
      [{ id: 'option-1' }, { id: 'option-2' }, { id: 'option-3' }, { id: 'option-4' }],
      [{ id: 'option-1' }, { id: 'option-2' }, { id: 'option-3' }, { id: 'option-4' }],
    )).toEqual([]);
    expect(findStaleTargetedPublisherOptionIds(
      [{ id: 'option-1' }, { id: 'option-2' }],
      [{ id: 'option-1' }, { id: 'option-2' }, { id: 'option-3' }, { id: 'option-4' }],
    )).toEqual(['option-3', 'option-4']);
    expect(findStaleTargetedPublisherOptionIds(
      [],
      [{ id: 'option-1' }, { id: 'option-2' }, { id: 'option-3' }, { id: 'option-4' }],
    )).toEqual(['option-1', 'option-2', 'option-3', 'option-4']);
  });

  it('keeps current source options out of stale results', () => {
    expect(findStaleTargetedPublisherOptionIds(
      [{ id: 'current-option' }],
      [{ id: 'current-option' }, { id: 'old-option' }],
    )).toEqual(['old-option']);
  });

});
