import { ArgsType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

@ArgsType()
export class ProfileArgs {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'slug may contain only lowercase letters, digits and dashes',
  })
  slug?: string | null;
}
