import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { JwtPayload, Tokens } from './types';
import * as process from 'node:process';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signUp(body: CreateUserDto) {
    const user = await this.userService.findUser(body.email);

    if (user) throw new ConflictException('User already exists');

    const salt = await bcrypt.genSalt();
    body.password = await bcrypt.hash(body.password, salt);

    return await this.userService.createUser(body);
  }

  async signIn(email: string, password: string): Promise<Tokens> {
    const user = await this.userService.findUser(email);

    if (!user) throw new Error('Incorrect credentials');

    const isPassMatch = await bcrypt.compare(password, user.password);

    if (!isPassMatch) throw new Error('Incorrect credentials');

    const payload: JwtPayload = { email: user.email };

    const tokens = {
      accessToken: await this.jwtService.signAsync(payload, {
        expiresIn: '50m',
        secret: process.env.JWT_SECRET,
      }),
      refreshToken: await this.jwtService.signAsync(payload, {
        expiresIn: '1d',
        secret: process.env.JWT_SECRET,
      }),
    };

    user.accessToken = tokens.accessToken;
    user.refreshToken = tokens.refreshToken;

    await this.userService.updateUser(user);

    return tokens;
  }

  async refreshToken(
    refreshToken: string,
  ): Promise<Pick<Tokens, 'accessToken'>> {
    const user = await this.userService.findUserByKey(
      'refreshToken',
      refreshToken,
    );

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        user.refreshToken,
      );

      const accessToken = await this.jwtService.signAsync(payload, {
        expiresIn: '5m',
        secret: process.env.JWT_SECRET,
      });

      user.accessToken = accessToken;

      await this.userService.updateUser(user);

      return { accessToken };
    } catch {
      throw new UnauthorizedException();
    }
  }

  async signOut(email: string) {
    const user = await this.userService.findUser(email);

    if (!user) throw new UnauthorizedException();

    user.accessToken = null;
    user.refreshToken = null;

    await this.userService.updateUser(user);
  }
}
