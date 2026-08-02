import { Injectable } from '@nestjs/common';
import {
  getAppVersion,
  getDataNamespace,
  resolveAppEnvironment,
} from './environment/environment.config';

@Injectable()
export class AppService {
  getHealth() {
    return {
      success: true,
      data: {
        status: 'ok',
        environment: resolveAppEnvironment(),
        dataNamespace: getDataNamespace(),
        appVersion: getAppVersion(),
      },
    };
  }
}
