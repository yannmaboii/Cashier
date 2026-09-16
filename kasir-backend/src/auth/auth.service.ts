import {
  Injectable,
  Inject,
  forwardRef,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service.js';
import { CustomerService } from '../customer/customer.service.js';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    @Inject(forwardRef(() => CustomerService))
    private customerService: CustomerService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Email atau password salah');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email atau password salah');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    };
  }

  async register(email: string, username: string, password: string) {
    const existing = await this.userService.findByEmail(email);
    if (existing) {
      throw new UnauthorizedException('Email sudah terdaftar');
    }

    const user = await this.userService.create({
      email,
      username,
      password,
      role: 'customer',
    });

    await this.customerService.create({
      nama: username,
      email,
    });

    const payload = { sub: user.id, email: user.email, role: user.role };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    };
  }
}