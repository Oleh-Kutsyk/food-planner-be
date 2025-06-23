import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findUser(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async createUser(body: CreateUserDto): Promise<User | null> {
    return this.prisma.user.create({ data: body });
  }
}
