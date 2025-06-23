import { Injectable } from '@nestjs/common';
import { UpdateMealDto } from './dto/update-meal.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMealDto } from './dto/create-meal.dto';
import { Meal } from '@prisma/client';

@Injectable()
export class MealsService {
  constructor(private readonly prisma: PrismaService) {}

  create(createMealDto: CreateMealDto) {
    return this.prisma.meal.create({ data: createMealDto });
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
