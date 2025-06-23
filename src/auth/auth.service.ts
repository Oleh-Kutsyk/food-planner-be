import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../users/dto/create-user.dto';

import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signUp(body: CreateUserDto) {
    const user = await this.userService.findUser(body.email);
    if (user) {
      throw new Error('User already exists');
    }

    const salt = await bcrypt.genSalt();
    body.password = await bcrypt.hash(body.password, salt);

    return await this.userService.createUser(body);
  }

  async signIn(email: string, password: string): Promise<any> {
    const user = await this.userService.findUser(email);

    if (!user) {
      throw new Error('User does not exist');
    }

    const isPassMatch = await bcrypt.compare(password, user.password);

    if (!isPassMatch) {
      throw new Error('Incorrect credentials');
    }

    const payload = { email: user.email };

    return {
      accessToken: await this.jwtService.signAsync(payload, {
        expiresIn: '10m',
      }),
      refreshToken: await this.jwtService.signAsync(payload, {
        expiresIn: '1d',
      }),
    };
  }
}
