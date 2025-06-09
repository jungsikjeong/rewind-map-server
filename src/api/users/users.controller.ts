import { Controller, Get, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Public()
  async findUserByEmail(@Query('email') email: string) {
    return await this.usersService.findUserByEmail(email);
  }
}
