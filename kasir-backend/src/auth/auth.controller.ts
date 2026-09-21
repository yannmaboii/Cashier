import {
  Body,
  Controller,
  Post,
  Patch,
  Get,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Post('register')
  register(
    @Body() body: { email: string; username: string; password: string },
  ) {
    return this.authService.register(body.email, body.username, body.password);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('password')
  changePassword(
    @Req() req: any,
    @Body() body: { oldPassword: string; newPassword: string },
  ) {
    return this.authService.changePassword(
      req.user.email,
      body.oldPassword,
      body.newPassword,
    );
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {
    // Redirect ke Google ditangani otomatis oleh passport
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: any, @Res() res: any) {
    const hasil = await this.authService.loginWithGoogle(req.user);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';

    return res.redirect(
      `${frontendUrl}/auth/google/success?token=${hasil.access_token}`,
    );
  }
}