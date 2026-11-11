import { ArgsType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

@ArgsType()
export class ProfileArgs {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  slug!: string;
}
