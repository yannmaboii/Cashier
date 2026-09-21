import {
  Injectable,
  Inject,
  forwardRef,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
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

  async loginWithGoogle(googleUser: {
    email: string;
    firstName: string;
    lastName: string;
    picture: string | null;
  }) {
    if (!googleUser?.email) {
      throw new BadRequestException('Email Google tidak ditemukan');
    }

    let user = await this.userService.findByEmail(googleUser.email);
    const namaLengkap =
      `${googleUser.firstName} ${googleUser.lastName}`.trim() ||
      googleUser.email.split('@')[0];

    if (!user) {
      const randomPassword = crypto.randomBytes(16).toString('hex');
      const usernameDasar = googleUser.email.split('@')[0];
      const usernameUnik =
        usernameDasar + Math.floor(1000 + Math.random() * 9000);

      user = await this.userService.create({
        email: googleUser.email,
        username: usernameUnik,
        password: randomPassword,
        role: 'customer',
      });

      await this.customerService.create({
        nama: namaLengkap,
        email: googleUser.email,
      });
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

  async changePassword(
    email: string,
    oldPassword: string,
    newPassword: string,
  ) {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('User tidak ditemukan');
    }

    const isValid = await bcrypt.compare(oldPassword, user.password);
    if (!isValid) {
      throw new BadRequestException('Password lama salah');
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.userService.update(user.id, { password: hashed } as any);

    return { message: 'Password berhasil diubah' };
  }
}