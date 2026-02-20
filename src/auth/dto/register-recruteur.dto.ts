import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Transform, Type, plainToInstance } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class TelephoneRecruteurInputDto {
  @ApiProperty()
  @IsString()
  telephone: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPhonePrincipal?: boolean;
}

export class RegisterRecruteurDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty()
  @IsUUID()
  entrepriseId: string;

  @ApiProperty()
  @IsString()
  nom: string;

  @ApiProperty()
  @IsString()
  prenom: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fonction?: string;

  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  @IsOptional()
  photo?: any;

  @ApiPropertyOptional({ type: [TelephoneRecruteurInputDto] })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return plainToInstance(TelephoneRecruteurInputDto, parsed);
        }
        if (parsed && typeof parsed === 'object') {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return plainToInstance(TelephoneRecruteurInputDto, [parsed]);
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return parsed;
      } catch {
        return value;
      }
    }
    if (Array.isArray(value)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return plainToInstance(TelephoneRecruteurInputDto, value);
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return value;
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TelephoneRecruteurInputDto)
  telephones?: TelephoneRecruteurInputDto[];
}
