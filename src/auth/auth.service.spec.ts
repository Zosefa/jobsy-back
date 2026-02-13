import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthAppService } from './application/auth.app.service';
import { AuthDomainService } from './domain/auth.domain.service';
import { AUTH_REPOSITORY } from './domain/auth.repository';
import { BrevoEmailService } from './infrastructure/brevo-email.service';

describe('AuthAppService', () => {
  let service: AuthAppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthAppService,
        AuthDomainService,
        { provide: AUTH_REPOSITORY, useValue: {} },
        { provide: JwtService, useValue: { signAsync: jest.fn(), verifyAsync: jest.fn() } },
        { provide: ConfigService, useValue: { get: jest.fn() } },
        { provide: BrevoEmailService, useValue: { sendResetCodeEmail: jest.fn() } },
      ],
    }).compile();

    service = module.get<AuthAppService>(AuthAppService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
