import {
    Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Roles } from 'src/app/auth/authorization/decorator/roles.decorator';
import { JwtAuthGuard } from 'src/app/auth/authorization/guard/jwt.auth.guard';
import { UserRole } from './enum/user-role.enum';
import { RolesGuard } from 'src/app/auth/authorization/guard/role.guard';
import { Response } from 'express';
import { UsersService } from './users.service';
import { CurrentUser } from 'src/app/auth/authorization/decorator/current-user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
    // Admin: get all users
  @Get('')
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles(UserRole.Admin)
  findAll() {
    return this.usersService.findAll();
  }

  // Get current logged-in user's info
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@CurrentUser() user: { userId: string }) {
    return this.usersService.findOne(user.userId);
  }

  // Update current user
  @Patch('me')
  @UseGuards(JwtAuthGuard)
  updateMe(
    @CurrentUser() user: { userId: string },
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(user.userId, updateUserDto);
  }

  // Admin: soft delete user
  @Delete(':id')
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles(UserRole.Admin)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  // Admin: deactivate user
  @Patch('/toggleActivation/:id')
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles(UserRole.Guide)
  deactivate(@Param('id') id: string) {
    return this.usersService.toggleActivation(id);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  logout(@Req() req, @Res({ passthrough: true }) res: Response) {
    return this.usersService.logout(req.user.userId, res);
  }
}
