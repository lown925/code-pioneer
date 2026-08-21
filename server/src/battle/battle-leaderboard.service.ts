import { BadRequestException, Injectable, Optional } from '@nestjs/common';
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
import { BattleTrackService } from './battle-track.service';
import { PROFESSIONAL_TRACK_CATALOG } from '../course/course-catalog';
import {
  calculateBattleCompetitiveTier,
  createBattleCompetitiveTitle,
} from './battle-competitive-tier';

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
    @Optional() private readonly battleTrackService?: BattleTrackService,
  ) {}

  async getLeaderboard(
    currentUserId: string,
    page = 1,
    pageSize = 100,
    requestedSkill?: string,
    requestedTrack?: string,
  ) {
    if (page < 1 || pageSize < 1 || pageSize > 100) {
      throw new BadRequestException(
        BATTLE_ERROR_CODES.BATTLE_INVALID_LEADERBOARD_QUERY,
      );
    }

    if (requestedSkill) {
      const skill =
        await this.battleSkillService.assertAvailableSkill(requestedSkill);
      return this.getSkillLeaderboard(
        currentUserId,
        skill.code,
        skill.name,
        page,
        pageSize,
      );
    }

    if (requestedTrack) {
      if (!this.battleTrackService) return this.getSkillLeaderboard(currentUserId, requestedSkill ?? 'PYTHON', requestedSkill ?? 'Python', page, pageSize);
      return this.getTrackLeaderboard(
        currentUserId,
        this.battleTrackService.normalize(requestedTrack),
        page,
        pageSize,
      );
    }
    if (!this.battleTrackService) return this.getLegacyTotalLeaderboard(currentUserId, page, pageSize);
    return this.getTrackLeaderboard(
      currentUserId,
      this.battleTrackService.normalize(undefined),
      page,
      pageSize,
    );

  }

  private async getLegacyTotalLeaderboard(currentUserId: string, page: number, pageSize: number) {
    const ratings = await this.prisma.userBattleSkillRating.findMany({
      where: { rankedBattles: { gt: 0 } },
      select: { userId: true, rating: true, highestRating: true, rankedBattles: true, wins: true, losses: true, draws: true, user: { select: { nickname: true, avatarUrl: true } } },
    }) as BattleSkillLeaderboardRecord[];
    const profiles = this.aggregateTotalLeaderboard(ratings).sort(compareBattleRanking);
    const skip = (page - 1) * pageSize;
    const pageItems = profiles.slice(skip, skip + pageSize);
    return { success: true as const, data: {
      items: pageItems.map((profile, index) => ({ rank: skip + index + 1, userId: profile.userId, nickname: profile.user.nickname, avatarUrl: profile.user.avatarUrl, rating: profile.rating, highestRating: profile.highestRating, rankedBattles: profile.totalBattles, wins: profile.wins, losses: profile.losses, draws: profile.draws, winRate: calculateBattleWinRate(profile.totalBattles, profile.wins) })),
      page, pageSize, total: profiles.length, totalPages: profiles.length ? Math.ceil(profiles.length / pageSize) : 0,
      myRank: calculateBattleRank(profiles, currentUserId), myRating: profiles.find((item) => item.userId === currentUserId)?.rating ?? null, serverTime: new Date(), skill: null,
    } satisfies BattleLeaderboardPayload };
  }

  private async getTrackLeaderboard(
    currentUserId: string,
    trackKey: string,
    page: number,
    pageSize: number,
  ) {
    const ratings = await this.prisma.userBattleTrackRating.findMany({
      where: { trackKey, rankedBattles: { gt: 0 } },
      orderBy: [{ rating: 'desc' }, { rankedBattles: 'desc' }, { userId: 'asc' }],
      select: {
        userId: true, rating: true, highestRating: true, rankedBattles: true,
        wins: true, losses: true, draws: true,
        user: { select: { nickname: true, avatarUrl: true } },
      },
    });
    const total = ratings.length;
    const skip = (page - 1) * pageSize;
    const pageItems = ratings.slice(skip, skip + pageSize);
    const myIndex = ratings.findIndex((rating) => rating.userId === currentUserId);
    const track = (this.battleTrackService?.list() ?? PROFESSIONAL_TRACK_CATALOG).find((item) => item.trackKey === trackKey);
    return {
      success: true as const,
      data: {
        items: pageItems.map((rating, index) => {
          const tier = calculateBattleCompetitiveTier(rating.rating, rating.rankedBattles);
          const decisions = rating.wins + rating.losses + rating.draws;
          return {
            rank: skip + index + 1, userId: rating.userId,
            nickname: rating.user.nickname, avatarUrl: rating.user.avatarUrl,
            rating: rating.rating, highestRating: rating.highestRating,
            rankedBattles: rating.rankedBattles, wins: rating.wins,
            losses: rating.losses, draws: rating.draws,
            winRate: calculateBattleWinRate(decisions, rating.wins),
            star: tier.star!,
            title: createBattleCompetitiveTitle(track?.shortName ?? trackKey, tier.star),
          };
        }),
        page, pageSize, total,
        totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
        myRank: myIndex >= 0 ? myIndex + 1 : null,
        myRating: myIndex >= 0 ? ratings[myIndex]!.rating : null,
        serverTime: new Date(), skill: null, professionalTrackKey: trackKey,
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
    skillName: string,
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
    const myIndex = ratings.findIndex(
      (rating) => rating.userId === currentUserId,
    );

    return {
      success: true as const,
      data: {
        items: pageItems.map((rating, index) => {
          const tier = calculateBattleCompetitiveTier(
            rating.rating,
            rating.rankedBattles,
          );
          const rankedDecisions =
            rating.wins + rating.losses + rating.draws;

          return {
            rank: skip + index + 1,
            userId: rating.userId,
            nickname: rating.user.nickname,
            avatarUrl: rating.user.avatarUrl ?? null,
            rating: rating.rating,
            highestRating: rating.highestRating,
            rankedBattles: rating.rankedBattles,
            wins: rating.wins,
            losses: rating.losses,
            draws: rating.draws,
            winRate: calculateBattleWinRate(rankedDecisions, rating.wins),
            star: tier.star!,
            title: createBattleCompetitiveTitle(skillName, tier.star),
          };
        }),
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
