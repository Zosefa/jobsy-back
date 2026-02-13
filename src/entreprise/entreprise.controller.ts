import {
  Body,
  Controller,
  Get,
  Param,
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
import { EntrepriseAppService } from './application/entreprise.app.service';
import { EntrepriseDto } from './dto/entreprise.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '@prisma/client';

@Controller('entreprise')
@ApiTags('Entreprise')
export class EntrepriseController {
  constructor(
    private readonly service: EntrepriseAppService,
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
  async create(
    @Body() dto: EntrepriseDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const logo = file
      ? await this.files.moveToEntityFolder(file, 'entreprise', 'logo', dto.nom)
      : undefined;
    return this.service.createEntreprise({ ...dto, logo: logo?.path });
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt-access'), RolesGuard)
  @Roles(Role.RECRUTEUR)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', required: true })
  @ApiBody({ type: EntrepriseDto })
  update(@Req() req: any, @Body() dto: EntrepriseDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.service.updateEntreprise(req.user, req.params.id, dto);
  }

  @Put(':id/logo')
  @UseGuards(AuthGuard('jwt-access'), RolesGuard)
  @Roles(Role.RECRUTEUR)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', required: true })
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
  updateLogo(
    @Req() req: any,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.service.updateLogo(req.user, id, file);
  }
}
