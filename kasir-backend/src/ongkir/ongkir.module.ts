import { Module } from '@nestjs/common';
import { OngkirService } from './ongkir.service.js';
import { OngkirController } from './ongkir.controller.js';

@Module({
  controllers: [OngkirController],
  providers: [OngkirService],
})
export class OngkirModule {}