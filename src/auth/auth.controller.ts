import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  signUp(@Body() body: CreateUserDto) {
    return this.authService.signUp(body);
  }

  @Post('sign-in')
  signIn(@Body() body: { email: string; password: string }) {
    return this.authService.signIn(body.email, body.password);
  }
}
