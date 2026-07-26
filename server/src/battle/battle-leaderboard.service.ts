import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BattleDomainService } from './battle-domain.service';
import { BATTLE_ERROR_CODES } from './battle.errors';
import {
  calculateBattleRank,
  calculateBattleWinRate,
  compareBattleRanking,
} from './battle-ranking';
import type { BattleLeaderboardPayload } from './battle.types';

type BattleLeaderboardRecord = {
  userId: string;
  rating: number;
  highestRating: number;
  totalBattles: number;
  wins: number;
  losses: number;
  draws: number;
  user: {
    nickname: string | null;
    avatarUrl: string | null;
  };
};

@Injectable()
export class BattleLeaderboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly battleDomainService: BattleDomainService,
  ) {}

  async getLeaderboard(currentUserId: string, page = 1, pageSize = 100) {
    if (page < 1 || pageSize < 1 || pageSize > 100) {
      throw new BadRequestException(
        BATTLE_ERROR_CODES.BATTLE_INVALID_LEADERBOARD_QUERY,
      );
    }

    await this.battleDomainService.ensureBattleProfile(currentUserId);

    const profiles = (await this.prisma.battleProfile.findMany({
      select: {
        userId: true,
        rating: true,
        highestRating: true,
        totalBattles: true,
        wins: true,
        losses: true,
        draws: true,
        user: {
          select: {
            nickname: true,
            avatarUrl: true,
          },
        },
      },
    })) as BattleLeaderboardRecord[];

    const sortedProfiles = [...profiles].sort(compareBattleRanking);
    const total = sortedProfiles.length;
    const skip = (page - 1) * pageSize;
    const pageItems = sortedProfiles.slice(skip, skip + pageSize);

    return {
      success: true as const,
      data: {
        items: pageItems.map((profile, index) => ({
          rank: skip + index + 1,
          userId: profile.userId,
          nickname: profile.user.nickname,
          avatarUrl: profile.user.avatarUrl ?? null,
          rating: profile.rating,
          highestRating: profile.highestRating,
          wins: profile.wins ?? 0,
          losses: profile.losses ?? 0,
          draws: profile.draws ?? 0,
          winRate: calculateBattleWinRate(
            profile.totalBattles ?? 0,
            profile.wins ?? 0,
          ),
        })),
        page,
        pageSize,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
        myRank: calculateBattleRank(sortedProfiles, currentUserId),
        myRating:
          sortedProfiles.find((profile) => profile.userId === currentUserId)
            ?.rating ?? null,
        serverTime: new Date(),
      } satisfies BattleLeaderboardPayload,
    };
  }
}
