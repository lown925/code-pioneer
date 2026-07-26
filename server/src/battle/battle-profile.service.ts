import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BattleDomainService } from './battle-domain.service';
import {
  calculateBattleRank,
  calculateBattleWinRate,
  compareBattleRanking,
} from './battle-ranking';
import type { BattleProfilePayload } from './battle.types';

type BattleProfileRecord = {
  userId: string;
  rating: number;
  highestRating: number;
  totalBattles: number;
  rankedBattles: number;
  friendBattles: number;
  wins: number;
  losses: number;
  draws: number;
  currentWinStreak: number;
  bestWinStreak: number;
};

@Injectable()
export class BattleProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly battleDomainService: BattleDomainService,
  ) {}

  async getBattleProfile(currentUserId: string) {
    const profile = await this.battleDomainService.ensureBattleProfile(
      currentUserId,
    );
    const profiles = await this.loadProfiles();
    const sortedProfiles = [...profiles].sort(compareBattleRanking);

    return {
      success: true as const,
      data: this.toPayload(profile, sortedProfiles),
    };
  }

  private async loadProfiles() {
    return this.prisma.battleProfile.findMany({
      select: {
        userId: true,
        rating: true,
        highestRating: true,
        totalBattles: true,
        rankedBattles: true,
        friendBattles: true,
        wins: true,
        losses: true,
        draws: true,
        currentWinStreak: true,
        bestWinStreak: true,
      },
    }) as Promise<BattleProfileRecord[]>;
  }

  private toPayload(
    profile: BattleProfileRecord,
    sortedProfiles: BattleProfileRecord[],
  ): BattleProfilePayload {
    const rank = calculateBattleRank(sortedProfiles, profile.userId);

    return {
      userId: profile.userId,
      rating: profile.rating,
      highestRating: profile.highestRating,
      totalBattles: profile.totalBattles ?? 0,
      rankedBattles: profile.rankedBattles ?? 0,
      friendBattles: profile.friendBattles ?? 0,
      wins: profile.wins ?? 0,
      losses: profile.losses ?? 0,
      draws: profile.draws ?? 0,
      winRate: calculateBattleWinRate(
        profile.totalBattles ?? 0,
        profile.wins ?? 0,
      ),
      currentWinStreak: profile.currentWinStreak ?? 0,
      bestWinStreak: profile.bestWinStreak ?? 0,
      rank: rank ?? 0,
      currentRank: rank ?? 0,
    };
  }
}
