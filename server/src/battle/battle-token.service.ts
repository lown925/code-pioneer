import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import {
  INVITATION_TOKEN_BYTES,
  INVITE_CODE_ALPHABET,
  INVITE_CODE_LENGTH,
} from './battle.constants';

@Injectable()
export class BattleTokenService {
  generateInvitationToken() {
    return randomBytes(INVITATION_TOKEN_BYTES).toString('base64url');
  }

  generateInviteCode() {
    const bytes = randomBytes(INVITE_CODE_LENGTH);
    let code = '';

    for (let index = 0; index < INVITE_CODE_LENGTH; index += 1) {
      code += INVITE_CODE_ALPHABET[bytes[index]! % INVITE_CODE_ALPHABET.length];
    }

    return code;
  }
}
