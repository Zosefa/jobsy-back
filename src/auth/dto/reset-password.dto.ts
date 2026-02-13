import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length, MinLength, Matches } from 'class-validator';

export class ResetPasswordRequestDto {
  @ApiProperty()
  @IsEmail()
  email: string;
}

export class ResetPasswordConfirmDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Code à 5 chiffres envoyé par email' })
  @IsString()
  @Length(5, 5)
  @Matches(/^\d{5}$/)
  code: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  newPassword: string;
}
