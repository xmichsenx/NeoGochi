import { Controller, Get, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { GetGraveyardQuery } from '../application/queries/get-graveyard.query';

@Controller('graveyard')
export class GraveyardController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  async getGraveyard(@Query('page') page?: string, @Query('limit') limit?: string) {
    const pageNum = Math.max(1, parseInt(page ?? '1', 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit ?? '20', 10) || 20));
    return this.queryBus.execute(new GetGraveyardQuery(pageNum, limitNum));
  }
}
