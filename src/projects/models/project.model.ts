import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('Project')
export class ProjectModel {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field()
  url!: string;

  @Field(() => String, { nullable: true })
  description!: string | null;
}
