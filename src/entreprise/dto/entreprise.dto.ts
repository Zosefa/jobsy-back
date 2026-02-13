import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EntrepriseDto {
  @ApiProperty()
  @IsString()
  nom: string;

  @ApiProperty()
  @IsString()
  ville: string;

  @ApiProperty()
  @IsUUID()
  paysId: string;

  @ApiProperty()
  @IsString()
  siegeSocial: string;
}
