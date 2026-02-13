import {
  Body,
  Controller,
  Get,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from '../files/files.service';
import { ProfilRecruteurAppService } from './application/profil-recruteur.app.service';
import { UpdateProfilRecruteurDto } from './dto/update-profil-recruteur.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';

@Controller('profil-recruteur')
@UseGuards(AuthGuard('jwt-access'))
@ApiTags('Profil Recruteur')
@ApiBearerAuth()
export class ProfilRecruteurController {
  constructor(private readonly service: ProfilRecruteurAppService) {}

  @Get('/info')
  getInfo(@Req() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.service.getInfo(req.user);
  }

  @Put('')
  @ApiBody({ type: UpdateProfilRecruteurDto })
  updateMe(@Req() req: any, @Body() dto: UpdateProfilRecruteurDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.service.updateProfile(req.user, dto);
  }

  @Put('update/photo')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['photo'],
      properties: {
        photo: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('photo', FilesService.multerOptions('recruteur', 'photo')),
  )
  updatePhoto(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.service.updatePhoto(req.user, file);
  }
}
