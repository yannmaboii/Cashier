import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ProdukModule } from './produk/produk.module.js';
import { KategoriModule } from './kategori/kategori.module.js';
import { UserModule } from './user/user.module.js';
import { AuthModule } from './auth/auth.module.js';
import { TransaksiModule } from './transaksi/transaksi.module.js';
import { RoleModule } from './role/role.module.js';
import { CustomerModule } from './customer/customer.module.js';
import { OngkirModule } from './ongkir/ongkir.module.js';
import { PembayaranModule } from './pembayaran/pembayaran.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'mlbb12345',
      database: 'kasir_db',
      autoLoadEntities: true,
      synchronize: true,
    }),
    ProdukModule,
    KategoriModule,
    UserModule,
    AuthModule,
    TransaksiModule,
    RoleModule,
    CustomerModule,
    OngkirModule,
    PembayaranModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}