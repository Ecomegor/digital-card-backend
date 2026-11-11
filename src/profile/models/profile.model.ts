import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('Profile')
export class ProfileModel {
  @Field(() => ID)
  id!: string;

  @Field()
  slug!: string;

  @Field()
  fullName!: string;

  @Field()
  headline!: string;

  @Field()
  bio!: string;
}
