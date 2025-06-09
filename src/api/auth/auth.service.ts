import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Response } from 'express';
import { DATABASE_CONNECTION } from 'src/database/database-connection';
import * as schema from '../users/schema';
import { NewUser, User } from '../users/schema';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<typeof schema>,
    private configService: ConfigService,
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
    signUpDto: NewUser,
    res: Response,
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

      const saltOrRounds = 10;
      const hash = await bcrypt.hash(signUpDto.password, saltOrRounds);

      const [user] = await this.database
        .insert(schema.users)
        .values({ ...signUpDto, password: hash })
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

  async getAccessToken(
    user: User,
    res: Response,
  ): Promise<{ accessToken: string }> {
    const payload = {
      sub: user.id,
      nickname: user.nickname,
      roles: user.role,
    };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '15m',
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
      { secret: this.configService.get<string>('JWT_SECRET'), expiresIn: '2w' },
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
