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

  update(mealId: number, updateMealDto: UpdateMealDto) {
    return this.prisma.meal.update({
      where: { id: mealId },
      data: updateMealDto,
    });
  }

  remove(mealId: number) {
    return this.prisma.meal.delete({
      where: { id: mealId },
    });
  }

  findAll(): Promise<Meal[]> {
    return this.prisma.meal.findMany();
  }

  async findManyForByUser(userEmail: string): Promise<Meal[]> {
    const user = await this.userService.findUser(userEmail);
    return this.prisma.meal.findMany({ where: { userId: user?.id } });
  }

  findOne(id: number) {
    return this.prisma.meal.findUnique({ where: { id } });
  }
}
