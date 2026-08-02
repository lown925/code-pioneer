import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  getAppVersion,
  getDataNamespace,
  resolveAppEnvironment,
} from './environment/environment.config';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('health', () => {
    it('should return the health payload', () => {
      expect(appController.getHealth()).toEqual({
        success: true,
        data: {
          status: 'ok',
          environment: resolveAppEnvironment(),
          dataNamespace: getDataNamespace(),
          appVersion: getAppVersion(),
        },
      });
    });
  });
});
