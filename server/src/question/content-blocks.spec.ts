import { canonicalizeQuestionBlocks } from './content-blocks';

describe('canonical question rendering contract', () => {
  it('keeps a prompt in one canonical text block and removes repeated blocks', () => {
    expect(canonicalizeQuestionBlocks([
      { type: 'TEXT', text: '补全 BFS 出队语句。' },
      { type: 'TEXT', text: '补全 BFS 出队语句。' },
      { type: 'CODE', code: 'vertex = queue.pop(0)', language: 'python' },
    ], '补全 BFS 出队语句。')).toEqual([
      { type: 'TEXT', text: '补全 BFS 出队语句。' },
      { type: 'CODE', code: 'vertex = queue.pop(0)', language: 'python' },
    ]);
  });

  it('adds a missing prompt before structured blocks for learning views', () => {
    expect(canonicalizeQuestionBlocks([
      { type: 'CODE', code: 'answer = ...', language: 'python' },
    ], '补全赋值语句。')).toEqual([
      { type: 'TEXT', text: '补全赋值语句。' },
      { type: 'CODE', code: 'answer = ...', language: 'python' },
    ]);
  });
});
