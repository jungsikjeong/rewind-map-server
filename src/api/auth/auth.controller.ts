import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request as ExpressRequest, Response } from 'express';
import { User } from '../users/schema';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { SignInDTO, SignUpDTO } from './dto/auth.request';
import { JwtAccessStrategy } from './strategies/jwt-access.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signin')
  @Public()
  @HttpCode(HttpStatus.OK)
  async signIn(
    @Body() signInDto: SignInDTO,
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.authService.signIn(
      signInDto.email,
      signInDto.password,
      res,
    );
  }

  @Post('signup')
  @Public()
  signUp(@Body() signUpDto: SignUpDTO, @Res() res: Response) {
    return this.authService.signUp(signUpDto, res);
  }

  @UseGuards(JwtRefreshStrategy)
  @Post('restore-access-token')
  @Public()
  restoreAccessToken(@Request() req: ExpressRequest, @Res() res: Response) {
    console.log('리스토어 토큰 테스트:', req.user);
    return this.authService.restoreAccessToken(req.user as User, res);
  }

  @UseGuards(JwtAccessStrategy)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
    });

    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
    });

    return {
      message: '로그아웃 되었습니다.',
      success: true,
    };
  }
}
