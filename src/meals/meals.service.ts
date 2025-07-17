import { ConflictException, Injectable } from '@nestjs/common';
import { UpdateMealDto } from './dto/update-meal.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMealDto } from './dto/create-meal.dto';
import { Meal } from '@prisma/client';
import { UsersService } from '../users/users.service';
import { StorageService } from '../storage/storage.service';
import { MyLoggerService } from '../logger/logger.service';
import { MealResponse } from './types';

@Injectable()
export class MealsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UsersService,
    private readonly storageService: StorageService,
    private readonly loggerService: MyLoggerService,
  ) {}

  private async getMealsWithImgUrls(meals: Meal[]): Promise<MealResponse[]> {
    const mealsWithImagesUrls: MealResponse[] = [];

    for (const meal of meals) {
      const imageUrl = await this.storageService.getFile(meal.imageKey);
      mealsWithImagesUrls.push({ ...meal, image: imageUrl });
    }
    return mealsWithImagesUrls;
  }

  private async uploadFile(mealId: number, file: Express.Multer.File) {
    if (!file) return null;

    const key = await this.storageService.uploadFile(
      `meals/${mealId}.${file.originalname}`,
      file.buffer,
    );

    if (key) {
      await this.prisma.meal.update({
        where: { id: mealId },
        data: { imageKey: key },
      });
    }

    return await this.storageService.getFile(key);
  }

  async create(
    createMealDto: CreateMealDto,
    userEmail: string,
    file: Express.Multer.File,
  ): Promise<MealResponse | undefined> {
    const user = await this.userService.findUser(userEmail);

    if (!user) throw new ConflictException('User not found');

    const result = await this.prisma.meal.create({
      data: { ...createMealDto, userId: user.id },
    });

    const imageUrl = await this.uploadFile(result.id, file);

    const obj: Partial<Meal> = result;

    delete obj.imageKey;

    return { ...obj, image: imageUrl };
  }

  async update(
    mealId: number,
    updateMealDto: UpdateMealDto,
    file: Express.Multer.File,
  ): Promise<MealResponse | undefined> {
    try {
      const result = await this.prisma.meal.update({
        where: { id: mealId },
        data: { ...updateMealDto },
      });

      const imageUrl = await this.uploadFile(mealId, file);

      const obj: Partial<Meal> = result;

      delete obj.imageKey;

      return { ...obj, image: imageUrl };
    } catch (error) {
      this.loggerService.error('MealsService update', error);
    }
  }

  remove(mealId: number) {
    return this.prisma.meal.delete({
      where: { id: mealId },
    });
  }

  async findAll(): Promise<MealResponse[]> {
    const meals = await this.prisma.meal.findMany();

    return this.getMealsWithImgUrls(meals);
  }

  async findAllByUser(userEmail: string): Promise<MealResponse[]> {
    const user = await this.userService.findUser(userEmail);

    const meals = await this.prisma.meal.findMany({
      where: { userId: user?.id },
    });

    return this.getMealsWithImgUrls(meals);
  }

  async findOne(id: number): Promise<Meal> {
    const meal = await this.prisma.meal.findUnique({ where: { id } });

    if (!meal) throw new ConflictException('Meal not found');

    const imageUrl = await this.storageService.getFile(meal.imageKey);
    return { ...meal, imageKey: imageUrl };
  }
}
