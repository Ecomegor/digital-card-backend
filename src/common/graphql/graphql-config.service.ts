import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { type ApolloDriverConfig } from '@nestjs/apollo';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { type GqlOptionsFactory } from '@nestjs/graphql';
import { join } from 'node:path';
import { type EnvironmentVariables, NodeEnvironment } from '../config/environment.js';
import { createGraphqlErrorFormatter } from './format-graphql-error.js';
import { type GraphqlContext } from './graphql-context.js';

@Injectable()
export class GraphqlConfigService implements GqlOptionsFactory<ApolloDriverConfig> {
  constructor(private readonly config: ConfigService<EnvironmentVariables, true>) {}

  createGqlOptions(): ApolloDriverConfig {
    const isProduction = this.isProduction();

    return {
      autoSchemaFile: isProduction ? true : join(process.cwd(), 'schema.gql'),
      sortSchema: true,
      playground: false,
      introspection: true,
      includeStacktraceInErrorResponses: !isProduction,
      formatError: createGraphqlErrorFormatter(isProduction),
      context: ({ req }: GraphqlContext): GraphqlContext => ({ req }),
      plugins: [ApolloServerPluginLandingPageLocalDefault({ embed: true })],
    };
  }

  private isProduction(): boolean {
    return this.config.get('NODE_ENV', { infer: true }) === NodeEnvironment.Production;
  }
}
