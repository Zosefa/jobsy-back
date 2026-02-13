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
import { TelephoneRecruteurAppService } from './application/telephone-recruteur.app.service';
import {
  CreateTelephoneRecruteurDto,
  UpdateTelephoneRecruteurDto,
} from './dto/telephone-recruteur.dto';
import { ApiBearerAuth, ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';

@Controller('telephone-recruteur')
@UseGuards(AuthGuard('jwt-access'))
@ApiTags('Telephone Recruteur')
@ApiBearerAuth()
export class TelephoneRecruteurController {
  constructor(private readonly service: TelephoneRecruteurAppService) {}

  @Get('')
  list(@Req() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.service.list(req.user);
  }

  @Post('')
  @ApiBody({ type: CreateTelephoneRecruteurDto })
  create(@Req() req: any, @Body() dto: CreateTelephoneRecruteurDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.service.create(req.user, dto);
  }

  @Put(':id')
  @ApiParam({ name: 'id', required: true })
  @ApiBody({ type: UpdateTelephoneRecruteurDto })
  update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateTelephoneRecruteurDto,
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
