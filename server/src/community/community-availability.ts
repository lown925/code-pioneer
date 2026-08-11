import {
  HttpException,
  HttpStatus,
  Injectable,
  type CanActivate,
} from '@nestjs/common';
import {
  resolveAppEnvironment,
  type AppEnvironment,
} from '../environment/environment.config';

export const COMMUNITY_UNAVAILABLE_CODE = 'COMMUNITY_UNAVAILABLE';

export function isCommunityAvailable(
  appEnvironment: AppEnvironment = resolveAppEnvironment(),
) {
  return appEnvironment === 'development' || appEnvironment === 'test';
}

@Injectable()
export class CommunityAvailabilityGuard implements CanActivate {
  canActivate() {
    if (isCommunityAvailable()) {
      return true;
    }

    throw new HttpException(
      {
        success: false,
        error: {
          code: COMMUNITY_UNAVAILABLE_CODE,
          message: COMMUNITY_UNAVAILABLE_CODE,
        },
      },
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
}
