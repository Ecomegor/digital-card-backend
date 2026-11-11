import { type INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

const FULL_PROFILE_QUERY = `
  query {
    profile {
      name
      description
      links { label url }
      skills { name }
      experience { company position period achievements }
      projects { name url }
    }
  }
`;

const SCALAR_PROFILE_QUERY = `
  query {
    profile { name description }
  }
`;

interface GraphqlResponse {
  data?: unknown;
  errors?: unknown[];
}

describe('profile query', () => {
  const executedSql: string[] = [];
  let app: INestApplication;
  let graphqlUrl: string;

  before(async () => {
    app = await NestFactory.create(AppModule, { logger: false });
    configureApp(app);
    app.get(PrismaService).$on('query', ({ query }) => executedSql.push(query));
    await app.listen(0, '127.0.0.1');
    graphqlUrl = `${await app.getUrl()}/graphql`;
  });

  after(async () => {
    await app.close();
  });

  async function sqlExecutedBy(query: string): Promise<string[]> {
    executedSql.length = 0;

    const response = await fetch(graphqlUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    const body = (await response.json()) as GraphqlResponse;

    assert.equal(body.errors, undefined);

    return [...executedSql];
  }

  it('runs one select per requested relation and none for unrequested ones', async () => {
    const fullQuerySql = await sqlExecutedBy(FULL_PROFILE_QUERY);
    const scalarQuerySql = await sqlExecutedBy(SCALAR_PROFILE_QUERY);

    assert.equal(fullQuerySql.length, 5);
    assert.ok(fullQuerySql.every((sql) => sql.startsWith('SELECT')));
    assert.equal(scalarQuerySql.length, 1);
    assert.ok(scalarQuerySql.every((sql) => sql.startsWith('SELECT')));
  });
});
