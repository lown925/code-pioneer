import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { COURSE_CATALOG, getTrackDefinition, PROFESSIONAL_TRACK_CATALOG } from '../course/course-catalog';

export const DEFAULT_PROFESSIONAL_TRACK_KEY = 'big-data';
export const DEFAULT_BATTLE_RATING = 1000;

@Injectable()
export class BattleTrackService {
  constructor(private readonly prisma: PrismaService) {}

  normalize(trackKey?: string | null) {
    const normalized = (trackKey ?? DEFAULT_PROFESSIONAL_TRACK_KEY).trim().toLowerCase();
    if (!getTrackDefinition(normalized)) {
      throw new BadRequestException('INVALID_PROFESSIONAL_TRACK');
    }
    return normalized;
  }

  list() {
    return PROFESSIONAL_TRACK_CATALOG;
  }

  async ensureRating(userId: string, trackKey: string, client: PrismaService | any = this.prisma) {
    const normalized = this.normalize(trackKey);
    return client.userBattleTrackRating.upsert({
      where: { userId_trackKey: { userId, trackKey: normalized } },
      update: {},
      create: { userId, trackKey: normalized },
    });
  }

  async getRating(userId: string, trackKey: string, client: PrismaService | any = this.prisma) {
    const normalized = this.normalize(trackKey);
    return client.userBattleTrackRating.findUnique({
      where: { userId_trackKey: { userId, trackKey: normalized } },
    });
  }

  async getPublishedCourseSlugs(trackKey: string, client: PrismaService | any = this.prisma) {
    const normalized = this.normalize(trackKey);
    const slugs = await client.course.findMany({
      where: { status: 'PUBLISHED', deletedAt: null },
      select: { slug: true },
    });
    const published = new Set(slugs.map((item: { slug: string }) => item.slug));
    return COURSE_CATALOG
      .filter((course) => course.professionalTracks.includes(normalized) && published.has(course.slug))
      .sort((left, right) => left.order - right.order)
      .map((course) => course.slug);
  }
}
