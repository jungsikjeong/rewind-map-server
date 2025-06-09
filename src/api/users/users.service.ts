import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE_CONNECTION } from 'src/database/database-connection';
import * as schema from './schema';
import { User } from './schema';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<typeof schema>,
  ) {}

  async findUserByEmail(email: string): Promise<User | undefined> {
    const result = await this.database.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email),
    });
    return result;
  }

  async findUserByNickname(nickname: string): Promise<User | undefined> {
    const result = await this.database.query.users.findFirst({
      where: (users, { eq }) => eq(users.nickname, nickname),
    });
    return result;
  }
}
