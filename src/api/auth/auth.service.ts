import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Response } from 'express';
import { DATABASE_CONNECTION } from 'src/database/database-connection';
import { FilesService } from '../upload/upload.service';
import * as schema from '../users/schema';
import { User } from '../users/schema';
import { UsersService } from '../users/users.service';
import { SignUpDTO } from './dto/auth.dto';
import { EditProfileDto } from './dto/edit-profile.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<typeof schema>,
    private configService: ConfigService,
    private filesService: FilesService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findUserByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      return user;
    }
    return null;
  }

  async signIn(
    email: string,
    pass: string,
    res: Response,
  ): Promise<{ accessToken: string }> {
    const user = await this.usersService.findUserByEmail(email);

    if (!user) {
      throw new UnauthorizedException('USER_NOT_FOUND');
    }

    const isMatch = await bcrypt.compare(pass, user.password);

    if (!isMatch) {
      throw new UnauthorizedException();
    }

    return await this.getAccessToken(user, res);
  }

  async signUp(
    signUpDto: SignUpDTO,
    res: Response,
    avatar?: Express.Multer.File,
  ): Promise<{ accessToken: string }> {
    try {
      const existingUserByEmail = await this.usersService.findUserByEmail(
        signUpDto.email,
      );

      if (existingUserByEmail) {
        throw new ConflictException('EMAIL_EXISTS');
      }

      const existingUserByNickname = await this.usersService.findUserByNickname(
        signUpDto.nickname,
      );

      if (existingUserByNickname) {
        throw new ConflictException('NICKNAME_EXISTS');
      }

      const image = avatar
        ? this.filesService.getFileUrl(avatar.filename)
        : null;

      const saltOrRounds = 10;
      const hash = await bcrypt.hash(signUpDto.password, saltOrRounds);

      const [user] = await this.database
        .insert(schema.users)
        .values({ ...signUpDto, password: hash, avatar: image })
        .returning();

      const accessToken = await this.getAccessToken(user, res);
      this.setRefreshToken(user.id, res);

      return accessToken;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      console.error('error:', error);
      throw new InternalServerErrorException(
        '회원가입 중 오류가 발생했습니다.',
      );
    }
  }

  async editProfile(
    editProfileDto: EditProfileDto,
    user: User,
    avatar?: Express.Multer.File,
  ) {
    try {
      if (editProfileDto.nickname) {
        const existingNickname = await this.usersService.findUserByNickname(
          editProfileDto.nickname,
        );

        if (existingNickname && existingNickname.id !== user.id) {
          throw new ConflictException('NICKNAME_EXISTS');
        }
      }

      let image: string | null = null;
      let oldAvatarPath: string | null = null;

      if (avatar) {
        image = this.filesService.getFileUrl(avatar.filename);
        oldAvatarPath = user.avatar;
      }

      const [result] = await this.database
        .update(schema.users)
        .set({ ...editProfileDto, avatar: image })
        .where(eq(schema.users.id, user.id))
        .returning();

      if (!result) {
        throw new NotFoundException('사용자를 찾을 수 없습니다.');
      }

      if (oldAvatarPath) {
        try {
          await this.filesService.deleteFile(oldAvatarPath);
        } catch (error) {
          console.error('이전 파일 삭제 실패:', error);
        }
      }

      const { password, ...userWithoutPassword } = result;
      return userWithoutPassword;
    } catch (error) {
      if (avatar) {
        try {
          await this.filesService.deleteFile(avatar.filename);
        } catch (deleteError) {
          console.error('업로드된 파일 삭제 실패:', deleteError);
        }
      }

      console.error('error:', error);
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        error.message || '회원정보 수정 중 오류가 발생했습니다.',
      );
    }
  }

  async getAccessToken(
    user: User,
    res: Response,
  ): Promise<{ accessToken: string }> {
    const payload = {
      sub: user.id,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn:
        this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRATION') ?? '15m',
    });

    const cookieOptions = {
      path: '/',
      ...(process.env.NODE_ENV === 'production'
        ? {
            domain: '.yoursite.com',
            sameSite: 'none' as const,
            secure: true,
            httpOnly: true,
          }
        : {}),
    };

    res.cookie('accessToken', accessToken, cookieOptions);

    return { accessToken };
  }

  async restoreAccessToken(
    user: User,
    res: Response,
  ): Promise<{ accessToken: string }> {
    return await this.getAccessToken(user, res);
  }

  setRefreshToken(userId: string, res: Response): void {
    const refreshToken = this.jwtService.sign(
      { sub: userId },
      {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn:
          this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION') ?? '2w',
      },
    );

    const setResCookie = {
      path: '/',
      ...(process.env.NODE_ENV === 'production'
        ? {
            domain: '.mybacksite.com',
            sameSite: 'none' as const,
            secure: true,
            httpOnly: true,
          }
        : {}),
    };

    res.cookie('refreshToken', refreshToken, setResCookie);
  }
}
