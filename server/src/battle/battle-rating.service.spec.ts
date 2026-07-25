import { BadRequestException } from '@nestjs/common';
import { BattleResult } from '../../generated/prisma/enums';
import { BattleRatingService } from './battle-rating.service';

describe('BattleRatingService', () => {
  const service = new BattleRatingService();

  it('awards about +16 to the winner when ratings are equal', () => {
    const result = service.calculateWithDefaultKFactor({
      playerRating: 1000,
      opponentRating: 1000,
      result: BattleResult.WIN,
    });

    expect(result.ratingDelta).toBe(16);
    expect(result.ratingAfter).toBe(1016);
  });

  it('awards about -16 to the loser when ratings are equal', () => {
    const result = service.calculateWithDefaultKFactor({
      playerRating: 1000,
      opponentRating: 1000,
      result: BattleResult.LOSS,
    });

    expect(result.ratingDelta).toBe(-16);
    expect(result.ratingAfter).toBe(984);
  });

  it('returns 0 for a draw between equally rated players', () => {
    const result = service.calculateWithDefaultKFactor({
      playerRating: 1000,
      opponentRating: 1000,
      result: BattleResult.DRAW,
    });

    expect(result.ratingDelta).toBe(0);
    expect(result.ratingAfter).toBe(1000);
  });

  it('gives the higher rated winner less than 16 points', () => {
    const result = service.calculateWithDefaultKFactor({
      playerRating: 1200,
      opponentRating: 1000,
      result: BattleResult.WIN,
    });

    expect(result.ratingDelta).toBeLessThan(16);
    expect(result.ratingDelta).toBeGreaterThan(0);
  });

  it('gives the lower rated winner more than 16 points', () => {
    const result = service.calculateWithDefaultKFactor({
      playerRating: 1000,
      opponentRating: 1200,
      result: BattleResult.WIN,
    });

    expect(result.ratingDelta).toBeGreaterThan(16);
  });

  it('does not allow ratingAfter below 0', () => {
    const result = service.calculateEloChange({
      playerRating: 0,
      opponentRating: 3000,
      result: BattleResult.LOSS,
      kFactor: 32,
    });

    expect(result.ratingAfter).toBe(0);
    expect(result.ratingDelta).toBe(0);
  });

  it('returns unchanged rating for friend mode helper', () => {
    expect(service.createNoRatingChange(1234)).toEqual({
      ratingBefore: 1234,
      ratingDelta: 0,
      ratingAfter: 1234,
      expectedScore: 0,
    });
  });

  it('rejects invalid rating input', () => {
    expect(() =>
      service.calculateEloChange({
        playerRating: -1,
        opponentRating: 1000,
        result: BattleResult.WIN,
        kFactor: 32,
      }),
    ).toThrow(BadRequestException);

    expect(() =>
      service.calculateEloChange({
        playerRating: 1000,
        opponentRating: 1000,
        result: BattleResult.WIN,
        kFactor: 0,
      }),
    ).toThrow(BadRequestException);
  });
});
