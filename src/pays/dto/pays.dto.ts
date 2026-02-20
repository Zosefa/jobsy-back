import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PaysDto {
  @ApiProperty()
  @IsString()
  nom: string;

  @ApiProperty()
  @IsString()
  codeIso2: string;

  @ApiProperty()
  @IsString()
  codeIso3: string;
}
