import { Meal } from '@prisma/client';

export interface MealResponse extends Partial<Omit<Meal, 'imageKey'>> {
  image: string | null;
}
