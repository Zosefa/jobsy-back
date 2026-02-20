import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  IsUUID,
  IsInt,
  ValidateNested,
} from 'class-validator';
import { Transform, Type, plainToInstance } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class TelephoneCandidatInputDto {
  @ApiProperty()
  @IsString()
  telephone: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPhonePrincipal?: boolean;
}

export class RegisterCandidatDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty()
  @IsString()
  nom: string;

  @ApiProperty()
  @IsString()
  prenom: string;

  @ApiProperty()
  @IsUUID()
  paysId: string;

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

  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  @IsOptional()
  photo?: any;

  @ApiPropertyOptional({ type: [TelephoneCandidatInputDto] })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          return plainToInstance(TelephoneCandidatInputDto, parsed);
        }
        if (parsed && typeof parsed === 'object') {
          return plainToInstance(TelephoneCandidatInputDto, [parsed]);
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return parsed;
      } catch {
        return value;
      }
    }
    if (Array.isArray(value)) {
      return plainToInstance(TelephoneCandidatInputDto, value);
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return value;
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TelephoneCandidatInputDto)
  telephones?: TelephoneCandidatInputDto[];
}
