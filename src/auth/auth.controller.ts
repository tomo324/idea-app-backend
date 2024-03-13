import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // jwtをcookieに保存する
  @Post('signup')
  async signup(
    @Body() dto: AuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const access_token = await this.authService.signup(dto);
    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
    });
  }

  @HttpCode(HttpStatus.OK)
  @Post('signin')
  async signin(
    @Body() dto: AuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const access_token = await this.authService.signin(dto);
    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
    });
  }
}
