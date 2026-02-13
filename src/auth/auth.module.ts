import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthAppService } from './application/auth.app.service';
import { JwtAccessStrategy } from './strategies/jwt-access.strategy';
import { FilesModule } from '../files/files.module';
import { AuthDomainService } from './domain/auth.domain.service';
import { AUTH_REPOSITORY } from './domain/auth.repository';
import { AuthPrismaRepository } from './infrastructure/auth.prisma.repository';
import { BrevoEmailService } from './infrastructure/brevo-email.service';

@Module({
  imports: [ConfigModule, JwtModule.register({}), FilesModule],
  controllers: [AuthController],
  providers: [
    AuthAppService,
    AuthDomainService,
    { provide: AUTH_REPOSITORY, useClass: AuthPrismaRepository },
    BrevoEmailService,
    JwtAccessStrategy,
  ],
})
export class AuthModule {}
