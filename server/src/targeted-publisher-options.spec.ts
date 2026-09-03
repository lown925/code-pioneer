import { findStaleTargetedPublisherOptionIds } from '../scripts/targeted-publisher';
import {
  COMPUTER_NETWORKS_OPTIONS_QUESTION_ID,
  formatComputerNetworksOptionsMaintenanceResult,
  runComputerNetworksOptionsMaintenance,
} from '../scripts/maintain-computer-networks-options';

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

  it('runs exact network maintenance as a zero-write dry-run', async () => {
    const staleOptionIds = [
      '42319b90-e81b-5e26-9ba1-6567761472a6',
      'd6d30f52-f7a8-5a41-b1f5-addf4530c3b0',
      'd62bcf50-c275-5010-af2c-1de4ea787494',
      'c26681cc-4ada-569b-b121-da4d73bf7e6c',
    ];
    const findUnique = jest.fn().mockResolvedValue({
      id: '8bf343c1-3872-59be-9066-bdb063101a4f',
      status: 'PUBLISHED',
      chapters: [{ quiz: { questions: [{
        id: COMPUTER_NETWORKS_OPTIONS_QUESTION_ID,
        quizId: 'quiz-id',
        type: 'CODE_FILL',
        options: staleOptionIds.map((id) => ({ id })),
      }] } }],
    });
    const transaction = jest.fn();
    const result = await runComputerNetworksOptionsMaintenance(
      { course: { findUnique }, $transaction: transaction },
      'DRY_RUN',
    );
    expect(result).toMatchObject({
      questionId: COMPUTER_NETWORKS_OPTIONS_QUESTION_ID,
      questionType: 'CODE_FILL',
      staleOptionIds,
      transactionCommitted: false,
      deletedCount: 0,
    });
    expect(formatComputerNetworksOptionsMaintenanceResult(result)).toContain(
      staleOptionIds.join(', '),
    );
    expect(transaction).not.toHaveBeenCalled();
  });
});
