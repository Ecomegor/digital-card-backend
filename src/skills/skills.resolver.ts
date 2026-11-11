import { Context, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { type GraphqlContext } from '../common/graphql/graphql-context.js';
import { ProfileModel } from '../profile/models/profile.model.js';
import { SkillModel } from './models/skill.model.js';
import { type Skill } from './skill.js';
import { SkillsLoader } from './skills.loader.js';

@Resolver(() => ProfileModel)
export class SkillsResolver {
  constructor(private readonly skillsLoader: SkillsLoader) {}

  @ResolveField(() => [SkillModel])
  skills(@Parent() profile: ProfileModel, @Context() context: GraphqlContext): Promise<Skill[]> {
    return this.skillsLoader.load(context, profile.id);
  }
}
