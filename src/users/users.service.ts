import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findUserById(
    id: number,
  ): Promise<Omit<User, 'password' | 'accessToken' | 'refreshToken'> | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: { meals: true },
      omit: { password: true, accessToken: true, refreshToken: true },
    });
  }

  async findUser(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findUserByKey(
    key: keyof User,
    value: string | number,
  ): Promise<User | null> {
    return this.prisma.user.findFirst({ where: { [key]: value } });
  }

  async createUser(body: CreateUserDto): Promise<User | null> {
    return this.prisma.user.create({ data: body });
  }

  async updateUser(body: UpdateUserDto): Promise<User | null> {
    return this.prisma.user.update({
      where: { email: body.email },
      data: body,
    });
  }
}
