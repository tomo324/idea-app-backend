import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SigninDto, SignupDto } from './dto';
import { FastifyReply } from 'fastify';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // jwtをcookieに保存する
  @Post('signup')
  async signup(
    @Body() dto: SignupDto,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const accessToken = await this.authService.signup(dto);
    const isProduction = process.env.NODE_ENV === 'production';
    res.setCookie('accessToken', accessToken, {
      path: '/',
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
    });
  }

  @HttpCode(HttpStatus.OK)
  @Post('signin')
  async signin(
    @Body() dto: SigninDto,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const accessToken = await this.authService.signin(dto);
    const isProduction = process.env.NODE_ENV === 'production';
    res.setCookie('accessToken', accessToken, {
      path: '/',
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
    });
  }
}
