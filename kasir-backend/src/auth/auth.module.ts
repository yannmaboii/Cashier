import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { UserModule } from '../user/user.module.js';
import { CustomerModule } from '../customer/customer.module.js';
import { JwtStrategy } from './jwt.strategy.js';
import { GoogleStrategy } from './google.strategy.js';

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => CustomerModule),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: 'ryan-radyth-dafaeji',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, GoogleStrategy],
  exports: [PassportModule, JwtModule],
})
export class AuthModule {}