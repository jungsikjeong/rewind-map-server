import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
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
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findUserByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      return user;
    }
    return null;
  }

  async signIn(email: string, pass: string): Promise<{ access_token: string }> {
    const user = await this.usersService.findUserByEmail(email);

    if (!user) {
      throw new UnauthorizedException('USER_NOT_FOUND');
    }

    const isMatch = await bcrypt.compare(pass, user.password);

    if (!isMatch) {
      throw new UnauthorizedException();
    }

    const access_token = await this.getAccessToken(user);

    return {
      access_token,
    };
  }

  async signUp(signUpDto: NewUser): Promise<{ access_token: string }> {
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

      const access_token = await this.getAccessToken(user);

      return { access_token };
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

  async getAccessToken(user: User) {
    const payload = {
      sub: user.id,
      nickname: user.nickname,
      roles: user.role,
    };

    return await this.jwtService.signAsync(payload);
  }

  async restoreAccessToken(user: User): Promise<string> {
    return await this.getAccessToken(user);
  }
}
