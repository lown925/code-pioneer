import type { CurrentUserContext } from '../auth/auth.types';
import { GrowthAiPromptService } from './ai-prompt.service';
import { GrowthController } from './growth.controller';
import { GrowthService } from './growth.service';

describe('GrowthController AI prompt endpoint', () => {
  let controller: GrowthController;
  const growthService = {};
  const growthAiPromptService = {
    buildPrompt: jest.fn(),
  };

  const currentUser: CurrentUserContext = {
    id: 'authenticated-user-id',
    sessionId: 'session-id',
    tokenType: 'USER',
    role: 'NORMAL',
  };

  beforeEach(() => {
    controller = new GrowthController(
      growthService as GrowthService,
      growthAiPromptService as unknown as GrowthAiPromptService,
    );
    growthAiPromptService.buildPrompt.mockReset();
  });

  it('builds only for the authenticated user and returns the minimal response', async () => {
    const prompt = '确定性的成长顾问提示词';
    growthAiPromptService.buildPrompt.mockResolvedValue(prompt);

    await expect(controller.getAiPrompt(currentUser)).resolves.toEqual({
      success: true,
      data: { prompt, mode: 'GENERAL' },
    });

    expect(growthAiPromptService.buildPrompt).toHaveBeenCalledTimes(1);
    expect(growthAiPromptService.buildPrompt).toHaveBeenCalledWith(
      currentUser.id,
    );
  });

  it('does not accept a client-selected user id or expose context data', async () => {
    growthAiPromptService.buildPrompt.mockResolvedValue('prompt');

    const response = await controller.getAiPrompt(currentUser);

    expect(response).toEqual({
      success: true,
      data: { prompt: 'prompt', mode: 'GENERAL' },
    });
    expect(response).not.toHaveProperty('data.context');
    expect(growthAiPromptService.buildPrompt).toHaveBeenCalledWith(
      'authenticated-user-id',
    );
  });
});
