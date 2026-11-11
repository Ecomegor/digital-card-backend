import { type Prisma } from '../src/generated/prisma/client.js';

type OrderedSeed<T> = Omit<T, 'id' | 'sortOrder'>;

export interface ProfileSeed {
  slug: string;
  name: string;
  description: string;
  links: OrderedSeed<Prisma.ProfileLinkCreateManyProfileInput>[];
  skills: OrderedSeed<Prisma.SkillCreateManyProfileInput>[];
  experiences: OrderedSeed<Prisma.ExperienceCreateManyProfileInput>[];
  projects: OrderedSeed<Prisma.ProjectCreateManyProfileInput>[];
}

function skillsOf(category: string, names: readonly string[]): ProfileSeed['skills'] {
  return names.map((name) => ({ name, category }));
}

export const profileSeed: ProfileSeed = {
  slug: 'developer',
  name: 'Егор Шагов',
  description:
    'Backend-разработчик: TypeScript, Node.js, Go, PostgreSQL. Проектирую API и real-time системы, разворачиваю их в Docker и довожу до продакшена.',
  links: [
    { label: 'GitHub', url: 'https://github.com/Ecomegor' },
    { label: 'Telegram', url: 'https://t.me/egorecom' },
  ],
  skills: [
    ...skillsOf('Languages', ['Go', 'Node.js', 'TypeScript', 'PHP']),
    ...skillsOf('API & Architecture', [
      'REST API',
      'GraphQL',
      'WebSockets',
      'System Design',
      'Clean Architecture',
    ]),
    ...skillsOf('Databases', ['PostgreSQL', 'Redis', 'MongoDB']),
    ...skillsOf('DevOps', ['Docker', 'CI/CD', 'Git', 'Linux', 'Nginx']),
  ],
  experiences: [
    {
      company: 'Caether.ai',
      position: 'Основатель, Backend-разработчик',
      achievements: [
        'Спроектировал и реализовал backend на TypeScript, Node.js, Go и PostgreSQL.',
        'Развернул сервис в Docker и настроил CI/CD.',
      ],
    },
    {
      company: 'Twittor',
      position: 'Основатель, Backend-разработчик',
      achievements: [
        'Реализовал обмен сообщениями в реальном времени на WebSockets.',
        'Использовал PostgreSQL для хранения данных и Redis для кеширования.',
        'Построил backend по принципам Clean Architecture.',
      ],
    },
  ],
  projects: [
    { name: 'caether.ai', url: 'https://caether.ai' },
    { name: 'twittor.net', url: 'https://twittor.net' },
  ],
};
