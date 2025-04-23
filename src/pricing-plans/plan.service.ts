import { Injectable } from '@nestjs/common';
import { Plan } from './entities/plan.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePlanDto } from './dto/create-plan.dto';

@Injectable()
export class PlanService {
  constructor(
    @InjectRepository(Plan)
    private planRepository: Repository<Plan>,
  ) {}
  async create(createPlanDto: CreatePlanDto) {
    const subscr = await this.planRepository.save(createPlanDto);
    return subscr;
  }

  async findAll() {
    return this.planRepository.find();
  }

  async findOneByName(name: string) {
    return this.planRepository.findOne({ where: { name } });
  }
}
