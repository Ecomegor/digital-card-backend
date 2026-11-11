import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('Experience')
export class ExperienceModel {
  @Field(() => ID)
  id!: string;

  @Field()
  company!: string;

  @Field()
  position!: string;

  @Field(() => Date, { nullable: true })
  startDate!: Date | null;

  @Field(() => Date, { nullable: true })
  endDate!: Date | null;

  @Field(() => String, { nullable: true })
  period!: string | null;

  @Field(() => [String])
  achievements!: string[];
}
