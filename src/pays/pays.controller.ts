import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { PaysAppService } from './application/pays.app.service';
import { PaysDto } from './dto/pays.dto';
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

  @Post('')
  @ApiParam({ name: 'nom', required: true })
  @ApiParam({ name: 'codeIso2', required: true })
  @ApiParam({ name: 'codeIso3', required: false })
  createPays(@Body() dto: PaysDto) {
    return this.service.createPays(dto);
  }
}
