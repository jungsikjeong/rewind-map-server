import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
  UploadedFile,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { GetUser } from 'src/commons/decorators/get-user.decorator';
import { User } from '../users/schema';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { SignInDTO, SignUpDTO } from './dto/auth.dto';
import { EditProfileDto } from './dto/edit-profile.dto';
import { createFileUploadInterceptor } from 'src/commons/interceptors/file-upload.interceptor';

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
  @UseInterceptors(createFileUploadInterceptor('avatar'))
  signUp(
    @Res({ passthrough: true }) res: Response,
    @Body(ValidationPipe) signUpDto: SignUpDTO,
    @UploadedFile() avatar?: Express.Multer.File,
  ) {
    return this.authService.signUp(signUpDto, res, avatar);
  }

  @Post('restore-access-token')
  @UseGuards(AuthGuard('jwt-refresh'))
  @Public()
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
  editProfile(
    @Body() editProfileDto: EditProfileDto,
    @GetUser() user: User,
    @UploadedFile() avatar?: Express.Multer.File,
  ) {
    return this.authService.editProfile(editProfileDto, user, avatar);
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
