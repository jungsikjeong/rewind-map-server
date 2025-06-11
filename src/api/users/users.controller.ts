import { Controller, Get, Param, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findUserByEmail(@Query('email') email: string) {
    return await this.usersService.findUserByEmail(email);
  }

  @Get('/:id')
  @Public()
  async getUserProfile(@Param('id') id: string) {
    return await this.usersService.findUserById(id);
  }
}
