import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TelephoneCandidatService } from './telephone-candidat.service';
import {
  CreateTelephoneCandidatDto,
  UpdateTelephoneCandidatDto,
} from './dto/telephone-candidat.dto';
import { ApiBearerAuth, ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';

@Controller('telephone-candidat')
@UseGuards(AuthGuard('jwt-access'))
@ApiTags('Telephone Candidat')
@ApiBearerAuth()
export class TelephoneCandidatController {
  constructor(private readonly service: TelephoneCandidatService) {}

  @Get('')
  list(@Req() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.service.list(req.user);
  }

  @Post('')
  @ApiBody({ type: CreateTelephoneCandidatDto })
  create(@Req() req: any, @Body() dto: CreateTelephoneCandidatDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.service.create(req.user, dto);
  }

  @Put(':id')
  @ApiParam({ name: 'id', required: true })
  @ApiBody({ type: UpdateTelephoneCandidatDto })
  update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateTelephoneCandidatDto,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.service.update(req.user, id, dto);
  }

  @Delete(':id')
  @ApiParam({ name: 'id', required: true })
  remove(@Req() req: any, @Param('id') id: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.service.remove(req.user, id);
  }
}
