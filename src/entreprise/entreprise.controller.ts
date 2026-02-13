import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from '../files/files.service';
import { EntrepriseService } from './entreprise.service';
import { EntrepriseDto } from './dto/entreprise.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

@Controller('entreprse')
@ApiTags('Entreprise')
export class EntrepriseController {
  constructor(
    private readonly service: EntrepriseService,
    private readonly files: FilesService,
  ) {}

  @Get('')
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiParam({ name: 'id', required: true })
  findById(@Req() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.service.findById(req.params.id);
  }

  @Post('')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['nom', 'ville', 'paysId', 'siegeSocial'],
      properties: {
        nom: { type: 'string' },
        ville: { type: 'string' },
        paysId: { type: 'string', format: 'uuid' },
        siegeSocial: { type: 'string' },
        logo: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('logo', FilesService.multerOptions('entreprise', 'logo')),
  )
  create(
    @Body() dto: EntrepriseDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const logoPath = file ? this.files.buildResponse(file).path : undefined;
    return this.service.createEntreprise({ ...dto, logo: logoPath });
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt-access'))
  @ApiBearerAuth()
  @ApiParam({ name: 'id', required: true })
  @ApiBody({ type: EntrepriseDto })
  update(@Req() req: any, @Body() dto: EntrepriseDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.service.updateEntreprise(req.params.id, dto);
  }

  @Put('update/logo')
  @UseGuards(AuthGuard('jwt-access'))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['logo'],
      properties: {
        logo: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('logo', FilesService.multerOptions('entreprise', 'logo')),
  )
  updateLogo(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.service.updateLogo(req.params.id, file);
  }
}
