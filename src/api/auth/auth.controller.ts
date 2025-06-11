import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { GetUser } from 'src/commons/decorators/get-user.decorator';
import { User } from '../users/schema';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { SignInDTO, SignUpDTO } from './dto/auth.dto';
import { EditProfileDto } from './dto/edit-profile.dto';

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
  signUp(
    @Body(ValidationPipe) signUpDto: SignUpDTO,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.signUp(signUpDto, res);
  }

  @Post('restore-access-token')
  @UseGuards(AuthGuard('jwt-refresh'))
  // @Public()
  restoreAccessToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @GetUser() user: User,
  ) {
    return this.authService.restoreAccessToken(req.user as User, res);
  }

  @Get('/me')
  @UseGuards(AuthGuard())
  getProfile(@GetUser() user: User) {
    return user;
  }

  @Patch('/me')
  @UseGuards(AuthGuard())
  editProfile(@Body() editProfileDto: EditProfileDto, @GetUser() user: User) {
    return this.authService.editProfile(editProfileDto, user);
  }

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
