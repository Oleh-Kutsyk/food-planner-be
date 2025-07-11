import { Module } from '@nestjs/common';
import { MealsService } from './meals.service';
import { MealsController } from './meals.controller';
import { UsersModule } from '../users/users.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [UsersModule, StorageModule],
  controllers: [MealsController],
  providers: [MealsService],
})
export class MealsModule {}
