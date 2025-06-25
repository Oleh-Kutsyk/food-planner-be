import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { SignInDto } from './dto/sign-in.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto.ts';
import { AuthGuard } from './auth.guard';
import { AuthenticatedRequest } from './types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  signUp(@Body() body: CreateUserDto) {
    return this.authService.signUp(body);
  }

  @Post('sign-in')
  signIn(@Body() body: SignInDto) {
    return this.authService.signIn(body.email, body.password);
  }

  @Post('sign-out')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  signOut(@Request() req: AuthenticatedRequest) {
    return this.authService.signOut(req.email);
  }

  @Post('refresh-token')
  refreshToken(@Body() body: RefreshTokenDto) {
    return this.authService.refreshToken(body.refreshToken);
  }
}
