import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CustomerService } from './customer.service.js';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';

@Controller('customer')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Roles('customer')
  @Get('me')
  getMe(@Req() req: any) {
    return this.customerService.findByEmail(req.user.email);
  }

  @Roles('customer')
  @Patch('me')
  updateMe(@Req() req: any, @Body() dto: UpdateCustomerDto) {
    return this.customerService.updateByEmail(req.user.email, dto);
  }

  @Roles('customer')
  @Post('me/foto')
  @UseInterceptors(
    FileInterceptor('foto', {
      storage: diskStorage({
        destination: './uploads/customer',
        filename: (req, file, callback) => {
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, unique + extname(file.originalname));
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
          return callback(
            new Error('Hanya file gambar (jpg, png, webp) yang diizinkan'),
            false,
          );
        }
        callback(null, true);
      },
      limits: { fileSize: 2 * 1024 * 1024 },
    }),
  )
  uploadFotoMe(@Req() req: any, @UploadedFile() file: any) {
    return this.customerService.updateFotoByEmail(
      req.user.email,
      '/uploads/customer/' + file.filename,
    );
  }

  @Roles('admin')
  @Post()
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customerService.create(createCustomerDto);
  }

  @Roles('admin')
  @Get()
  findAll() {
    return this.customerService.findAll();
  }

  @Roles('admin')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customerService.findOne(+id);
  }

  @Roles('admin')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customerService.update(+id, updateCustomerDto);
  }

  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.customerService.remove(+id);
  }
}