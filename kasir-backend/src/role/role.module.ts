import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleService } from './role.service.js';
import { RoleController } from './role.controller.js';
import { Role } from './entities/role.entity.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([Role]), AuthModule],
  controllers: [RoleController],
  providers: [RoleService],
})
export class RoleModule {}