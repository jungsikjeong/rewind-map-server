import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Request,
  Res,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { Request as ExpressRequest, Response } from 'express';
import { User } from '../users/schema';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { SignInDTO, SignUpDTO } from './dto/auth.dto';
import { JwtAccessStrategy } from './strategies/jwt-access.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { GetUser } from 'src/commons/decorators/get-user.decorator';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signin')
  @Public()
  @HttpCode(HttpStatus.OK)
  async signIn(
    @Body(ValidationPipe) signInDto: SignInDTO,
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
  signUp(@Body(ValidationPipe) signUpDto: SignUpDTO, @Res() res: Response) {
    return this.authService.signUp(signUpDto, res);
  }

  @Post('restore-access-token')
  @UseGuards(JwtRefreshStrategy)
  @Public()
  restoreAccessToken(@Request() req: ExpressRequest, @Res() res: Response) {
    console.log('리스토어 토큰 테스트:', req.user);
    return this.authService.restoreAccessToken(req.user as User, res);
  }

  // @Get('/me')
  // @UseGuards(AuthGuard())
  // getProfile(@GetUser() user: User) {
  //   return this.authService.getProfile(user);
  // }

  // @Patch('/me')
  // @UseGuards(AuthGuard())
  // editProfile(@Body() editProfileDto: EditProfileDto, @GetUser() user: User) {
  //   return this.authService.editProfile(editProfileDto, user);
  // }

  // @Get('/:id')
  // @UseGuards(AuthGuard())
  // getUserProfile(@Param('id', ParseIntPipe) id: number) {
  //   return this.authService.getUserProfile(id);
  // }

  @Post('logout')
  @UseGuards(AuthGuard())
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
