import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PlaceService } from './place.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { AuthGuard } from 'src/shared/auth-guard/auth.guard';
import { Req } from '@nestjs/common';
import { RequestWithUser } from 'src/UserAuthCommon/user/interfaces/user.interfaces';
import { RequiredSubscriptionType } from 'src/shared/auth-guard/decorators/subscription.decorator';
import { RequestWithUserSubscr } from 'src/fish/interfaces/interfaces';

@Controller('place')
export class PlaceController {
  constructor(private readonly placeService: PlaceService) {}

  @UseGuards(AuthGuard)
  @RequiredSubscriptionType(['free', 'pro'])
  @Post()
  create(
    @Body() createPlaceDto: CreatePlaceDto,
    @Req() request: RequestWithUser & RequestWithUserSubscr,
  ) {
    return this.placeService.create(
      createPlaceDto,
      request.userId,
      request.subscrType,
    );
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll(@Req() request: RequestWithUser) {
    return this.placeService.findAllUserPlaces(request.userId);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.placeService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePlaceDto: UpdatePlaceDto,
    @Req() request: RequestWithUser,
  ) {
    return this.placeService.update(id, updatePlaceDto, request.userId);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() request: RequestWithUser) {
    return this.placeService.remove(id, request.userId);
  }
}
