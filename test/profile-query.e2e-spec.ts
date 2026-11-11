import { type INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
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

const RELATION_TABLES = ['profile_links', 'skills', 'experiences', 'projects'];

interface ExecutedSql {
  query: string;
  params: string;
}

interface GraphqlResponse {
  data?: unknown;
  errors?: unknown[];
}

interface NamedRelations {
  links: { label: string }[];
  skills: { name: string }[];
  experience: { company: string }[];
  projects: { name: string }[];
}

interface TemporaryProfile {
  id: string;
  slug: string;
  marker: string;
}

describe('profile query', () => {
  const executedSql: ExecutedSql[] = [];
  let app: INestApplication;
  let prisma: PrismaService;
  let graphqlUrl: string;

  before(async () => {
    app = await NestFactory.create(AppModule, { logger: false });
    configureApp(app);
    prisma = app.get(PrismaService);
    prisma.$on('query', ({ query, params }) => executedSql.push({ query, params }));
    await app.listen(0, '127.0.0.1');
    graphqlUrl = `${await app.getUrl()}/graphql`;
  });

  after(async () => {
    await app.close();
  });

  async function execute(query: string): Promise<{ data: unknown; sql: ExecutedSql[] }> {
    executedSql.length = 0;

    const response = await fetch(graphqlUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    const body = (await response.json()) as GraphqlResponse;

    assert.equal(body.errors, undefined);
    assert.ok(body.data);

    return { data: body.data, sql: [...executedSql] };
  }

  async function createTemporaryProfile(marker: string): Promise<TemporaryProfile> {
    const slug = `e2e-${marker}-${randomUUID()}`;
    const { id } = await prisma.profile.create({
      data: {
        slug,
        name: marker,
        description: marker,
        links: { create: { label: marker, url: `https://${marker}.example`, sortOrder: 0 } },
        skills: { create: { name: marker, sortOrder: 0 } },
        experiences: {
          create: { company: marker, position: marker, startDate: new Date(), sortOrder: 0 },
        },
        projects: { create: { name: marker, url: `https://${marker}.example`, sortOrder: 0 } },
      },
      select: { id: true },
    });

    return { id, slug, marker };
  }

  function relationsQueryFor(profiles: readonly TemporaryProfile[]): string {
    const fields = profiles.map(
      ({ marker, slug }) => `
        ${marker}: profile(slug: "${slug}") {
          links { label }
          skills { name }
          experience { company }
          projects { name }
        }
      `,
    );

    return `query { ${fields.join('')} }`;
  }

  it('runs one select per requested relation and none for unrequested ones', async () => {
    const fullQuery = await execute(FULL_PROFILE_QUERY);
    const scalarQuery = await execute(SCALAR_PROFILE_QUERY);

    assert.equal(fullQuery.sql.length, 5);
    assert.ok(fullQuery.sql.every(({ query }) => query.startsWith('SELECT')));
    assert.equal(scalarQuery.sql.length, 1);
    assert.ok(scalarQuery.sql.every(({ query }) => query.startsWith('SELECT')));
  });

  it('batches relations of several profiles into one IN query per relation', async () => {
    const profiles: TemporaryProfile[] = [];

    try {
      profiles.push(await createTemporaryProfile('first'));
      profiles.push(await createTemporaryProfile('second'));

      const { data, sql } = await execute(relationsQueryFor(profiles));
      const profilesByMarker = data as Record<string, NamedRelations>;

      for (const table of RELATION_TABLES) {
        const relationSql = sql.filter(({ query }) => query.includes(`FROM "public"."${table}"`));

        assert.equal(relationSql.length, 1, `${table} must be loaded with a single query`);
        for (const { id } of profiles) {
          assert.ok(relationSql[0]?.params.includes(id), `${table} query must include ${id}`);
        }
      }

      for (const { marker } of profiles) {
        assert.deepEqual(profilesByMarker[marker], {
          links: [{ label: marker }],
          skills: [{ name: marker }],
          experience: [{ company: marker }],
          projects: [{ name: marker }],
        });
      }
    } finally {
      await prisma.profile.deleteMany({ where: { id: { in: profiles.map(({ id }) => id) } } });
    }
  });
});
