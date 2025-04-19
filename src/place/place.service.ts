import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PlanService } from 'src/pricing-plans/plan.service';
import { Place } from './entities/place.entity';

@Injectable()
export class PlaceService {
  constructor(
    @InjectRepository(Place)
    private readonly placeRepository: Repository<Place>,
    private readonly planService: PlanService,
  ) {}

  async create(
    createPlaceDto: CreatePlaceDto,
    userId: string,
    subscrType: string,
  ) {
    try {
      const plan = await this.planService.findOneByName(subscrType);
      if (!plan) throw new NotFoundException(`Plan ${subscrType} not found`);

      const places = await this.findAllUserPlaces(userId);

      // if (places.length >= plan.placesNumber) {
      //   throw new ForbiddenException('Limit error', {
      //     cause: new Error(),
      //     description: 'You have reached the limit of places',
      //   });
      // }

      const newPlace = this.placeRepository.create({
        ...createPlaceDto,
        user: { id: userId },
      });
      return await this.placeRepository.save(newPlace);
    } catch (e) {
      console.error('Error creating place:', e);
      throw e; // Re-throw the error to be handled by the controller
    }
  }

  async findAllUserPlaces(userId: string) {
    return await this.placeRepository.find({ where: { user: { id: userId } } });
  }

  async findOne(id: string) {
    return await this.placeRepository.findOne({ where: { id } });
  }

  async update(id: string, updatePlaceDto: UpdatePlaceDto, userId: string) {
    const place = await this.placeRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (!place) throw new NotFoundException(`Place with id ${id} not found`);
    return await this.placeRepository.save({ ...place, ...updatePlaceDto });
  }

  async remove(id: string, userId: string) {
    const place = await this.placeRepository.findOne({
      where: { id, user: { id: userId } },
    });
    await this.placeRepository.remove(place);
  }
}
