import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import express from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RegisterCandidatDto } from './dto/register-candidat.dto';
import { RegisterRecruteurDto } from './dto/register-recruteur.dto';
import { LoginDto } from './dto/login.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from '../files/files.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly files: FilesService,
  ) {}

  @Post('register/candidat')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: RegisterCandidatDto })
  @UseInterceptors(
    FileInterceptor('photo', FilesService.multerOptions('candidat', 'photo')),
  )
  registerCandidat(
    @Body() dto: RegisterCandidatDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const photoPath = file ? this.files.buildResponse(file).path : undefined;
    return this.auth.registerCandidat({ ...dto, photo: photoPath });
  }

  @Post('register/recruteur')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: RegisterRecruteurDto })
  @UseInterceptors(
    FileInterceptor('photo', FilesService.multerOptions('recruteur', 'photo')),
  )
  registerRecruteur(
    @Body() dto: RegisterRecruteurDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const photoPath = file ? this.files.buildResponse(file).path : undefined;
    return this.auth.registerRecruteur({ ...dto, photo: photoPath });
  }

  @Post('login')
  @ApiBody({ type: LoginDto })
  async login(
    @Body() dto: LoginDto,
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const meta = { ip: req.ip, userAgent: req.headers['user-agent'] };
    const out = await this.auth.login(dto.email, dto.password, meta);

    this.setCookies(res, out.accessToken, out.refreshToken);
    return { userId: out.userId, role: out.role };
  }

  @Post('refresh')
  async refresh(
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const token = req.cookies?.refresh_token;
    if (!token) return { ok: false };

    const meta = { ip: req.ip, userAgent: req.headers['user-agent'] };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const out = await this.auth.refresh(token, meta);

    this.setCookies(res, out.accessToken, out.refreshToken);
    return { userId: out.userId, role: out.role };
  }

  @UseGuards(AuthGuard('jwt-access'))
  @Post('logout')
  @ApiBearerAuth()
  async logout(
    @Req() req: any,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    await this.auth.logout(req.user);
    this.clearCookies(res);
    return { success: true, message: 'Déconnexion réussie' };
  }

  @UseGuards(AuthGuard('jwt-access'))
  @Get('me')
  @ApiBearerAuth()
  me(@Req() req: any) {
    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      userId: req.user.sub,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      role: req.user.role,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      sessionId: req.user.sid,
    };
  }

  private setCookies(
    res: express.Response,
    accessToken: string,
    refreshToken: string,
  ) {
    const isProd = process.env.NODE_ENV === 'production';

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/auth/refresh',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
  }

  private clearCookies(res: express.Response) {
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/auth/refresh' });
  }
}
