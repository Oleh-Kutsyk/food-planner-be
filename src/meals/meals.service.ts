import { ConflictException, Injectable } from '@nestjs/common';
import { UpdateMealDto } from './dto/update-meal.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMealDto } from './dto/create-meal.dto';
import { Meal } from '@prisma/client';
import { UsersService } from '../users/users.service';
import { StorageService } from '../storage/storage.service';
import { MyLoggerService } from '../logger/logger.service';

@Injectable()
export class MealsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UsersService,
    private readonly storageService: StorageService,
    private readonly loggerService: MyLoggerService,
  ) {}

  async create(createMealDto: CreateMealDto, userEmail: string) {
    const user = await this.userService.findUser(userEmail);

    if (!user) throw new ConflictException('User not found');

    return this.prisma.meal.create({
      data: { ...createMealDto, userId: user.id },
    });
  }

  async update(
    mealId: number,
    updateMealDto: UpdateMealDto,
    file: Express.Multer.File,
  ) {
    try {
      let imageUrl: string | null = null;
      let key: string | undefined = '';

      if (file) {
        key = await this.storageService.uploadFile(
          `meals/${mealId}.${file.originalname}`,
          file.buffer,
        );
      }

      const result = await this.prisma.meal.update({
        where: { id: mealId },
        data: { ...updateMealDto, ...(key && { image: key }) },
      });

      if (result.image) {
        imageUrl = await this.storageService.getFile(result.image);
      }

      return { ...result, image: imageUrl };
    } catch (error) {
      this.loggerService.error('MealsService update', error);
    }
  }

  remove(mealId: number) {
    return this.prisma.meal.delete({
      where: { id: mealId },
    });
  }

  findAll(): Promise<Meal[]> {
    return this.prisma.meal.findMany();
  }

  async findManyByUser(userEmail: string): Promise<Meal[]> {
    const user = await this.userService.findUser(userEmail);

    const meals = await this.prisma.meal.findMany({
      where: { userId: user?.id },
    });

    const mealsWithImagesUrls: Meal[] = [];

    for (const meal of meals) {
      const imageUrl = await this.storageService.getFile(meal.image);
      console.log(imageUrl);
      mealsWithImagesUrls.push({ ...meal, image: imageUrl });
    }
    console.log('mealsWithImagesUrls', mealsWithImagesUrls);
    return mealsWithImagesUrls;
  }

  async findOne(id: number): Promise<Meal> {
    const meal = await this.prisma.meal.findUnique({ where: { id } });

    if (!meal) throw new ConflictException('Meal not found');

    const imageUrl = await this.storageService.getFile(meal.image);
    return { ...meal, image: imageUrl };
  }
}
