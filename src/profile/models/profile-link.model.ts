import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('ProfileLink')
export class ProfileLinkModel {
  @Field(() => ID)
  id!: string;

  @Field()
  label!: string;

  @Field()
  url!: string;
}
