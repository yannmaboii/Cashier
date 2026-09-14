import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerService } from './customer.service.js';
import { CustomerController } from './customer.controller.js';
import { Customer } from './entities/customer.entity.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([Customer]), AuthModule],
  controllers: [CustomerController],
  providers: [CustomerService],
})
export class CustomerModule {}