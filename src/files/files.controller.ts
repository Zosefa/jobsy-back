import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { FilesService } from './files.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';

@Controller('files')
@UseGuards(AuthGuard('jwt-access'))
@ApiTags('Files')
@ApiBearerAuth()
export class FilesController {
  constructor(private readonly files: FilesService) {}

  @Post('candidat/photo')
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
  uploadCandidatPhoto(@UploadedFile() file: Express.Multer.File) {
    return this.files.buildResponse(file);
  }

  @Post('candidat/cv')
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
  uploadCandidatCv(@UploadedFile() file: Express.Multer.File) {
    return this.files.buildResponse(file);
  }

  @Post('recruteur/photo')
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
  uploadRecruteurPhoto(@UploadedFile() file: Express.Multer.File) {
    return this.files.buildResponse(file);
  }

  @Post('admin/photo')
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
    FileInterceptor('photo', FilesService.multerOptions('admin', 'photo')),
  )
  uploadAdminPhoto(@UploadedFile() file: Express.Multer.File) {
    return this.files.buildResponse(file);
  }
}
