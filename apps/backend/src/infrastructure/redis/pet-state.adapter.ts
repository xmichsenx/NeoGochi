import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { PetStatePort } from '../../application/ports/pet-state.port';
import { Pet } from '../../domain/pet.entity';
import { Pet as PetData } from '@neogochi/shared';

@Injectable()
export class RedisPetStateAdapter implements PetStatePort {
  private readonly redis: Redis;
  private readonly keyPrefix = 'pet:session:';

  constructor(private readonly configService: ConfigService) {
    this.redis = new Redis({
      host: this.configService.get<string>('game.redis.host', 'localhost'),
      port: this.configService.get<number>('game.redis.port', 6379),
    });
  }

  async save(pet: Pet): Promise<void> {
    const key = this.getKey(pet.id);
    await this.redis.set(key, JSON.stringify(pet.toPlain()));
  }

  async findBySessionId(sessionId: string): Promise<Pet | null> {
    const key = this.getKey(sessionId);
    const data = await this.redis.get(key);
    if (!data) return null;
    const parsed: PetData = JSON.parse(data);
    return new Pet(parsed);
  }

  async delete(sessionId: string): Promise<void> {
    const key = this.getKey(sessionId);
    await this.redis.del(key);
  }

  private getKey(sessionId: string): string {
    return `${this.keyPrefix}${sessionId}`;
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }
}
