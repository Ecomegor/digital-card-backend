import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloDriverConfig } from '@nestjs/apollo';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GqlOptionsFactory } from '@nestjs/graphql';
import { join } from 'node:path';
import { EnvironmentVariables, NodeEnvironment } from '../config/environment.js';

@Injectable()
export class GraphqlConfigService implements GqlOptionsFactory<ApolloDriverConfig> {
  constructor(private readonly config: ConfigService<EnvironmentVariables, true>) {}

  createGqlOptions(): ApolloDriverConfig {
    return {
      autoSchemaFile: this.isProduction() ? true : join(process.cwd(), 'schema.gql'),
      sortSchema: true,
      playground: false,
      introspection: true,
      plugins: [ApolloServerPluginLandingPageLocalDefault({ embed: true })],
    };
  }

  private isProduction(): boolean {
    return this.config.get('NODE_ENV', { infer: true }) === NodeEnvironment.Production;
  }
}
