import { Context, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { type GraphqlContext } from '../common/graphql/graphql-context.js';
import { ProfileModel } from '../profile/models/profile.model.js';
import { ProjectModel } from './models/project.model.js';
import { type Project } from './project.js';
import { ProjectsLoader } from './projects.loader.js';

@Resolver(() => ProfileModel)
export class ProjectsResolver {
  constructor(private readonly projectsLoader: ProjectsLoader) {}

  @ResolveField(() => [ProjectModel])
  projects(
    @Parent() profile: ProfileModel,
    @Context() context: GraphqlContext,
  ): Promise<Project[]> {
    return this.projectsLoader.load(context, profile.id);
  }
}
