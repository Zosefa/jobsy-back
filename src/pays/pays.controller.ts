import { Controller, Get, Param } from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { PaysAppService } from './application/pays.app.service';
@Controller('pays')
@ApiTags('Pays')
export class PaysController {
  constructor(private readonly service: PaysAppService) {}

  @Get('')
  list() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiParam({ name: 'id', required: true })
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }
}
