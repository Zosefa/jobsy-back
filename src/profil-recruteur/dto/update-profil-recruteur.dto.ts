import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

class TelephoneRecruteurInputDto {
  @ApiPropertyOptional()
  @IsString()
  telephone: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPhonePrincipal?: boolean;
}

export class UpdateProfilRecruteurDto {
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
  @IsString()
  fonction?: string;

  @ApiPropertyOptional({ type: [TelephoneRecruteurInputDto] })
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
  @Type(() => TelephoneRecruteurInputDto)
  telephones?: TelephoneRecruteurInputDto[];
}
