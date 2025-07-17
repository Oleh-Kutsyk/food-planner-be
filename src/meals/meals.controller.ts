import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Put,
  Req,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { MealsService } from './meals.service';
import { CreateMealDto } from './dto/create-meal.dto';
import { UpdateMealDto } from './dto/update-meal.dto';
import { Roles } from '../guards/roles.decorator';
import { RolesGuard } from '../guards/auth.guard';
import { AuthGuard } from '../auth/auth.guard';
import { AuthenticatedRequest } from '../auth/types';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('meals')
@UseGuards(RolesGuard)
export class MealsController {
  constructor(private readonly mealsService: MealsService) {}

  @UseInterceptors(FileInterceptor('image'))
  @Post()
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  create(
    @Req() req: AuthenticatedRequest,
    @Body() createMealDto: CreateMealDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    return this.mealsService.create(createMealDto, req.email, image);
  }

  @UseInterceptors(FileInterceptor('image'))
  @Put(':id')
  @UseGuards(AuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateMealDto: UpdateMealDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    return this.mealsService.update(+id, updateMealDto, image);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string) {
    return this.mealsService.remove(+id);
  }

  @Get('all')
  async findAll() {
    return await this.mealsService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  findOne(@Param('id') id: string) {
    return this.mealsService.findOne(+id);
  }

  @Get()
  @UseGuards(AuthGuard)
  findAllByUser(@Req() req: AuthenticatedRequest) {
    return this.mealsService.findAllByUser(req.email);
  }
}
