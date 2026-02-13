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
import { ProfilCandidatService } from './profil-candidat.service';
import { UpdateProfilCandidatDto } from './dto/update-profil-candidat.dto';
import { FilesService } from '../files/files.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';

@Controller('profil-candidat')
@UseGuards(AuthGuard('jwt-access'))
@ApiTags('Profil Candidat')
@ApiBearerAuth()
export class ProfilCandidatController {
  constructor(private readonly service: ProfilCandidatService) {}

  @Get('/info')
  getInfo(@Req() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.service.getInfo(req.user);
  }

  @Put('')
  @ApiBody({ type: UpdateProfilCandidatDto })
  updateMe(@Req() req: any, @Body() dto: UpdateProfilCandidatDto) {
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
    FileInterceptor('photo', FilesService.multerOptions('candidat', 'photo')),
  )
  updatePhoto(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.service.updatePhoto(req.user, file);
  }

  @Put('update/cv')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['cv'],
      properties: {
        cv: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('cv', FilesService.multerOptions('candidat', 'cv')),
  )
  updateCv(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.service.updateCv(req.user, file);
  }
}
