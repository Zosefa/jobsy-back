import { Controller, Get, Param } from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { PaysService } from './pays.service';
@Controller('pays')
@ApiTags('Pays')
export class PaysController {
  constructor(private readonly service: PaysService) {}

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
