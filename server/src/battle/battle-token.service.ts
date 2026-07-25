import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { INVITATION_TOKEN_BYTES } from './battle.constants';

@Injectable()
export class BattleTokenService {
  generateInvitationToken() {
    return randomBytes(INVITATION_TOKEN_BYTES).toString('base64url');
  }
}
