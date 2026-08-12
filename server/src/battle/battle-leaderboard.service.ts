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
import { BattleSkillService } from './battle-skill.service';

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

type BattleSkillLeaderboardRecord = {
  userId: string;
  rating: number;
  highestRating: number;
  rankedBattles: number;
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
    private readonly battleSkillService: BattleSkillService,
  ) {}

  async getLeaderboard(
    currentUserId: string,
    page = 1,
    pageSize = 100,
    requestedSkill?: string,
  ) {
    if (page < 1 || pageSize < 1 || pageSize > 100) {
      throw new BadRequestException(
        BATTLE_ERROR_CODES.BATTLE_INVALID_LEADERBOARD_QUERY,
      );
    }

    if (requestedSkill) {
      const skill = await this.battleSkillService.assertAvailableSkill(
        requestedSkill,
      );
      return this.getSkillLeaderboard(
        currentUserId,
        skill.code,
        page,
        pageSize,
      );
    }

    const ratings = (await this.prisma.userBattleSkillRating.findMany({
      where: {
        rankedBattles: { gt: 0 },
      },
      select: {
        userId: true,
        rating: true,
        highestRating: true,
        rankedBattles: true,
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
    })) as BattleSkillLeaderboardRecord[];

    const profiles = this.aggregateTotalLeaderboard(ratings);

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
        skill: null,
      } satisfies BattleLeaderboardPayload,
    };
  }

  private aggregateTotalLeaderboard(
    ratings: BattleSkillLeaderboardRecord[],
  ): BattleLeaderboardRecord[] {
    const aggregated = new Map<string, BattleLeaderboardRecord>();

    for (const rating of ratings) {
      const existing = aggregated.get(rating.userId);

      if (existing) {
        existing.rating += rating.rating;
        existing.highestRating += rating.highestRating;
        existing.totalBattles += rating.rankedBattles;
        existing.wins += rating.wins;
        existing.losses += rating.losses;
        existing.draws += rating.draws;
        continue;
      }

      aggregated.set(rating.userId, {
        userId: rating.userId,
        rating: rating.rating,
        highestRating: rating.highestRating,
        totalBattles: rating.rankedBattles,
        wins: rating.wins,
        losses: rating.losses,
        draws: rating.draws,
        user: rating.user,
      });
    }

    return [...aggregated.values()];
  }

  private async getSkillLeaderboard(
    currentUserId: string,
    skillCode: string,
    page: number,
    pageSize: number,
  ) {
    const ratings = await this.prisma.userBattleSkillRating.findMany({
      where: {
        skillCode,
        rankedBattles: { gt: 0 },
      },
      orderBy: [
        { rating: 'desc' },
        { rankedBattles: 'desc' },
        { userId: 'asc' },
      ],
      select: {
        userId: true,
        rating: true,
        highestRating: true,
        rankedBattles: true,
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
    });
    const total = ratings.length;
    const skip = (page - 1) * pageSize;
    const pageItems = ratings.slice(skip, skip + pageSize);
    const myIndex = ratings.findIndex((rating) => rating.userId === currentUserId);

    return {
      success: true as const,
      data: {
        items: pageItems.map((rating, index) => ({
          rank: skip + index + 1,
          userId: rating.userId,
          nickname: rating.user.nickname,
          avatarUrl: rating.user.avatarUrl ?? null,
          rating: rating.rating,
          highestRating: rating.highestRating,
          wins: rating.wins,
          losses: rating.losses,
          draws: rating.draws,
          winRate: calculateBattleWinRate(
            rating.rankedBattles,
            rating.wins,
          ),
        })),
        page,
        pageSize,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
        myRank: myIndex >= 0 ? myIndex + 1 : null,
        myRating: myIndex >= 0 ? ratings[myIndex]!.rating : null,
        serverTime: new Date(),
        skill: skillCode,
      } satisfies BattleLeaderboardPayload,
    };
  }
}
