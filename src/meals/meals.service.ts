import { ConflictException, Injectable } from '@nestjs/common';
import { UpdateMealDto } from './dto/update-meal.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMealDto } from './dto/create-meal.dto';
import { Meal } from '@prisma/client';
import { UsersService } from '../users/users.service';

@Injectable()
export class MealsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UsersService,
  ) {}

  async create(createMealDto: CreateMealDto, userEmail: string) {
    const user = await this.userService.findUser(userEmail);

    if (!user) throw new ConflictException('User not found');

    return this.prisma.meal.create({
      data: { ...createMealDto, userId: user.id },
    });
  }

  findAll(): Promise<Meal[]> {
    return this.prisma.meal.findMany();
  }

  findOne(id: number) {
    return this.prisma.meal.findUnique({ where: { id } });
  }

  update(id: number, updateMealDto: UpdateMealDto) {
    return `This action updates a #${id} meal`;
  }

  remove(id: number) {
    return `This action removes a #${id} meal`;
  }
}
