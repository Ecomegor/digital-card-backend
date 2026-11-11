import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { AppConfigModule } from './common/config/app-config.module.js';
import { GraphqlConfigService } from './common/graphql/graphql-config.service.js';
import { ExperienceModule } from './experience/experience.module.js';
import { HealthModule } from './health/health.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ProfileModule } from './profile/profile.module.js';
import { ProjectsModule } from './projects/projects.module.js';
import { SkillsModule } from './skills/skills.module.js';

@Module({
  imports: [
    AppConfigModule,
    PrismaModule,
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      useClass: GraphqlConfigService,
    }),
    HealthModule,
    ProfileModule,
    SkillsModule,
    ExperienceModule,
    ProjectsModule,
  ],
})
export class AppModule {}
