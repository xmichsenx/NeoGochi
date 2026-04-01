import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { count, desc } from 'drizzle-orm';
import postgres from 'postgres';
import { PetGraveyardPort, GraveyardEntry } from '../../application/ports/pet-graveyard.port';
import { Pet } from '../../domain/pet.entity';
import { graveyard } from './schema';

@Injectable()
export class DrizzleGraveyardAdapter implements PetGraveyardPort {
  private readonly db: PostgresJsDatabase;
  private readonly client: postgres.Sql;

  constructor(private readonly configService: ConfigService) {
    const url = this.configService.get<string>(
      'game.postgres.url',
      'postgres://neogochi:neogochi@localhost:5432/neogochi',
    );
    this.client = postgres(url);
    this.db = drizzle(this.client);
  }

  async bury(pet: Pet, causeOfDeath: string): Promise<void> {
    const createdAt = new Date(pet.createdAt);
    const now = new Date();
    const daysSurvived = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);

    await this.db.insert(graveyard).values({
      name: pet.name,
      startingClass: pet.startingClass,
      finalLevel: pet.level,
      daysSurvived: Math.max(0, daysSurvived),
      causeOfDeath,
      statsSnapshot: pet.stats.toPlain(),
      diedAt: now,
    });
  }

  async findAll(
    page: number,
    limit: number,
  ): Promise<{ entries: GraveyardEntry[]; total: number }> {
    const offset = (page - 1) * limit;

    const [entries, totalResult] = await Promise.all([
      this.db.select().from(graveyard).orderBy(desc(graveyard.diedAt)).limit(limit).offset(offset),
      this.db.select({ count: count() }).from(graveyard),
    ]);

    return {
      entries: entries.map((e) => ({
        id: e.id,
        name: e.name,
        startingClass: e.startingClass,
        finalLevel: e.finalLevel,
        daysSurvived: e.daysSurvived,
        causeOfDeath: e.causeOfDeath,
        statsSnapshot: e.statsSnapshot as Record<string, number>,
        diedAt: e.diedAt.toISOString(),
      })),
      total: totalResult[0]?.count ?? 0,
    };
  }

  async onModuleDestroy() {
    await this.client.end();
  }
}
