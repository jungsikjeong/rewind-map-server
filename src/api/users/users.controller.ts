import { Controller, Get, Query } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findUserByEmail(@Query('email') email: string) {
    return await this.usersService.findUserByEmail(email);
  }
}
