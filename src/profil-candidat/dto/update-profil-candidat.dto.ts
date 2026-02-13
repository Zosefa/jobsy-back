import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

class TelephoneCandidatInputDto {
  @ApiPropertyOptional()
  @IsString()
  telephone: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPhonePrincipal?: boolean;
}

export class UpdateProfilCandidatDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  prenom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  paysId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ville?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  adresse?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  resume?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  anneesExperience?: number;

  @ApiPropertyOptional({ type: [TelephoneCandidatInputDto] })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return value;
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TelephoneCandidatInputDto)
  telephones?: TelephoneCandidatInputDto[];
}
