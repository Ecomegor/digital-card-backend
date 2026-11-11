import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { type EnvironmentVariables } from '../common/config/environment.js';
import { type Prisma, PrismaClient } from '../generated/prisma/client.js';

type QueryEventOptions = Prisma.PrismaClientOptions & {
  log: [{ emit: 'event'; level: 'query' }];
};

@Injectable()
export class PrismaService
  extends PrismaClient<QueryEventOptions>
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private readonly logQueries: boolean;

  constructor(config: ConfigService<EnvironmentVariables, true>) {
    super({
      adapter: new PrismaPg({ connectionString: config.get('DATABASE_URL', { infer: true }) }),
      log: [{ emit: 'event', level: 'query' }],
    });

    this.logQueries = config.get('PRISMA_LOG_QUERIES', { infer: true });
  }

  async onModuleInit(): Promise<void> {
    if (this.logQueries) {
      this.$on('query', ({ query, params, duration }) => {
        this.logger.log(`${query} ${params} +${String(duration)}ms`);
      });
    }

    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
