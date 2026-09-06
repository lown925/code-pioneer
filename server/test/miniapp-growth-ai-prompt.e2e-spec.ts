import { readFileSync } from 'fs';
import { resolve } from 'path';

const miniappRoot = resolve(__dirname, '../../miniapp');

function readMiniappFile(relativePath: string) {
  return readFileSync(resolve(miniappRoot, relativePath), 'utf8');
}

describe('miniapp Growth AI prompt', () => {
  const script = () => readMiniappFile('pages/growth/index.ts');
  const template = () => readMiniappFile('pages/growth/index.wxml');

  it('defines the minimal API type and helper without client-selected identity', () => {
    const types = readMiniappFile('types/growth.ts');
    const helper = readMiniappFile('utils/growth.ts');

    expect(types).toContain('export type GrowthAiPromptData = {');
    expect(types).toContain('prompt: string;');
    expect(types).toContain('mode: "GENERAL";');
    expect(helper).toContain('url: "/growth/ai-prompt"');
    expect(helper).toContain('method: "GET"');
    expect(helper).toContain('authMode: "required"');

    const helperStart = helper.indexOf('fetchGrowthAiPrompt');
    const helperEnd = helper.indexOf(
      'export function fetchGrowthOverview',
      helperStart,
    );
    const helperSource = helper.slice(helperStart, helperEnd);
    expect(helperSource).not.toMatch(/userId|professionalTrackKey|mode|data:/);
  });

  it('places the AI advisor between profile and continue learning', () => {
    const source = template();
    const profileIndex = source.indexOf('学习画像');
    const aiPromptIndex = source.indexOf('AI 成长顾问');
    const continueIndex = source.indexOf('继续学习');

    expect(profileIndex).toBeGreaterThanOrEqual(0);
    expect(aiPromptIndex).toBeGreaterThan(profileIndex);
    expect(aiPromptIndex).toBeLessThan(continueIndex);
    expect(source).toContain('生成提示词');
    expect(source).toContain('复制提示词');
    expect(source).toContain('重新生成');
    expect(source).toContain('重试');
    expect(source).toContain('scroll-y class="ai-prompt-content"');
    expect(source).toContain('selectable="true"');
    expect(source).toContain(
      '提示词仅包含学习画像与学习记录，不包含账号身份信息。',
    );
  });

  it('does not request a prompt during page lifecycle or initial state', () => {
    const source = script();
    expect(source).toMatch(/aiPromptLoading:\s*false/);
    expect(source).toMatch(/aiPrompt:\s*""/);
    expect(source).toMatch(/aiPromptError:\s*""/);

    const onShow = source.slice(
      source.indexOf('onShow()'),
      source.indexOf('onUnload()'),
    );
    expect(onShow).not.toContain('fetchGrowthAiPrompt');
    expect(source).toContain('void this.loadOverview()');
  });

  it('guards duplicate generation, preserves the server prompt, and exposes recoverable errors', () => {
    const source = script();
    const handlerStart = source.indexOf('async handleGenerateAiPrompt');
    const handlerEnd = source.indexOf('\n  handleCopyAiPrompt()', handlerStart);
    const handler = source.slice(handlerStart, handlerEnd);

    expect(handler).toContain('if (this.data.aiPromptLoading) return;');
    expect(handler).toContain('aiPromptLoading: true');
    expect(handler).toContain('fetchGrowthAiPrompt()');
    expect(handler).toContain('this.setData({ aiPrompt: result.prompt');
    expect(handler).toContain('生成失败，请稍后重试');
    expect(handler).toContain('EMPTY_AI_PROMPT');
    expect(template()).toContain('生成中...');
  });

  it('copies the complete prompt through the platform clipboard and shows concise toasts', () => {
    const source = script();
    const handler = source.slice(source.indexOf('handleCopyAiPrompt'));

    expect(handler).toContain('wx.setClipboardData');
    expect(handler).toContain('data: this.data.aiPrompt');
    expect(handler).toContain('title: "提示词已复制"');
    expect(handler).toContain('title: "复制失败，请重试"');
    expect(handler).toContain(
      'if (!this.data.aiPrompt || this.data.aiPromptLoading) return;',
    );
    expect(handler).not.toContain('split(');
    expect(handler).not.toContain('join(');
  });

  it('keeps existing Growth modules and does not add third-party navigation', () => {
    const source = script();
    const templateSource = template();

    for (const existingModule of [
      '继续学习',
      '下一步推荐',
      '专业学习路线',
      '我的学习目标',
      '学习表现',
      '错题分析',
      '对战',
    ]) {
      expect(templateSource).toContain(existingModule);
    }

    expect(source).not.toMatch(
      /WebView|navigateToMiniProgram|chatgpt\.com|deepseek\.com/iu,
    );
    expect(source).not.toContain('wx.request');
  });
});
