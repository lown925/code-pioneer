import { Injectable, Optional } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BattleDomainService } from './battle-domain.service';
import {
  calculateBattleRank,
  calculateBattleWinRate,
  compareBattleRanking,
} from './battle-ranking';
import type { BattleProfilePayload } from './battle.types';
import { BattleSkillService } from './battle-skill.service';
import { BattleTrackService } from './battle-track.service';
import { getTrackForMajor, PROFESSIONAL_TRACK_CATALOG } from '../course/course-catalog';
import {
  calculateBattleCompetitiveTier,
  createBattleCompetitiveTitle,
} from './battle-competitive-tier';

type BattleProfileRecord = {
  userId: string;
  rating: number;
  highestRating: number;
  totalBattles: number;
  rankedBattles: number;
  friendBattles: number;
  trainingBattles: number;
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
    private readonly battleSkillService: BattleSkillService,
    @Optional() private readonly battleTrackService?: BattleTrackService,
  ) {}

  async getBattleProfile(currentUserId: string) {
    const profile =
      await this.battleDomainService.ensureBattleProfile(currentUserId);
    const profiles = await this.loadProfiles();
    const sortedProfiles = [...profiles].sort(compareBattleRanking);
    const availableSkills =
      await this.loadAvailableSkillProfiles(currentUserId);
    const availableTracks = await this.loadAvailableTrackProfiles(currentUserId);
    const currentUser = await this.prisma.user?.findUnique?.({
      where: { id: currentUserId },
      select: { major: true },
    });

    return {
      success: true as const,
      data: this.toPayload(
        profile,
        sortedProfiles,
        availableSkills,
        availableTracks,
        getTrackForMajor(currentUser?.major)?.trackKey ?? null,
      ),
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
        trainingBattles: true,
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
    availableSkills: BattleProfilePayload['availableSkills'],
    availableTracks: BattleProfilePayload['availableTracks'],
    defaultTrackKey: string | null,
  ): BattleProfilePayload {
    const rank = calculateBattleRank(sortedProfiles, profile.userId);

    return {
      userId: profile.userId,
      rating: profile.rating,
      highestRating: profile.highestRating,
      totalBattles: profile.totalBattles ?? 0,
      rankedBattles: profile.rankedBattles ?? 0,
      friendBattles: profile.friendBattles ?? 0,
      trainingBattles: profile.trainingBattles ?? 0,
      wins: profile.wins ?? 0,
      losses: profile.losses ?? 0,
      draws: profile.draws ?? 0,
      winRate: calculateBattleWinRate(
        (profile.wins ?? 0) + (profile.losses ?? 0) + (profile.draws ?? 0),
        profile.wins ?? 0,
      ),
      currentWinStreak: profile.currentWinStreak ?? 0,
      bestWinStreak: profile.bestWinStreak ?? 0,
      rank: rank ?? 0,
      currentRank: rank ?? 0,
      availableSkills,
      availableTracks,
      defaultTrackKey,
    };
  }

  private async loadAvailableSkillProfiles(currentUserId: string) {
    const availableSkills = await this.battleSkillService.getAvailableSkills();
    const ratings = await this.prisma.userBattleSkillRating.findMany({
      where: {
        skillCode: { in: availableSkills.map((skill) => skill.code) },
      },
      select: {
        userId: true,
        skillCode: true,
        rating: true,
        highestRating: true,
        rankedBattles: true,
      },
    });

    return availableSkills.map((skill) => {
      const skillRatings = ratings
        .filter((rating) => rating.skillCode === skill.code)
        .sort((left, right) => {
          if (left.rating !== right.rating) {
            return right.rating - left.rating;
          }

          if (left.rankedBattles !== right.rankedBattles) {
            return right.rankedBattles - left.rankedBattles;
          }

          return left.userId.localeCompare(right.userId);
        });
      const rating = skillRatings.find((item) => item.userId === currentUserId);
      const rankedRatings = skillRatings.filter(
        (item) => item.rankedBattles > 0,
      );
      const rankIndex = rankedRatings.findIndex(
        (item) => item.userId === currentUserId,
      );
      const rankedBattles = rating?.rankedBattles ?? 0;
      const tier = calculateBattleCompetitiveTier(
        rating?.rating ?? 0,
        rankedBattles,
      );

      return {
        code: skill.code,
        name: skill.name,
        rating: rating?.rating ?? null,
        highestRating: rating?.highestRating ?? null,
        rankedBattles,
        rank: rankIndex >= 0 ? rankIndex + 1 : null,
        status: tier.status,
        star: tier.star,
        title: createBattleCompetitiveTitle(skill.name, tier.star),
      };
    });
  }

  private async loadAvailableTrackProfiles(currentUserId: string) {
    const tracks = this.battleTrackService?.list() ?? PROFESSIONAL_TRACK_CATALOG;
    const trackRatingDelegate = (this.prisma as any).userBattleTrackRating;
    const ratings = trackRatingDelegate?.findMany
      ? await trackRatingDelegate.findMany({
          select: { userId: true, trackKey: true, rating: true, rankedBattles: true },
        })
      : [];
    return tracks.map((track) => {
      const trackRatings = ratings
        .filter((rating) => rating.trackKey === track.trackKey && rating.rankedBattles > 0)
        .sort((left, right) => right.rating - left.rating || right.rankedBattles - left.rankedBattles || left.userId.localeCompare(right.userId));
      const current = ratings.find((rating) => rating.userId === currentUserId && rating.trackKey === track.trackKey);
      const rankIndex = trackRatings.findIndex((rating) => rating.userId === currentUserId);
      return {
        trackKey: track.trackKey,
        formalName: track.formalName,
        shortName: track.shortName,
        rating: current?.rating ?? null,
        rankedBattles: current?.rankedBattles ?? 0,
        rank: rankIndex >= 0 ? rankIndex + 1 : null,
        status: current && current.rankedBattles > 0 ? 'RANKED' as const : 'UNRANKED' as const,
      };
    });
  }
}
