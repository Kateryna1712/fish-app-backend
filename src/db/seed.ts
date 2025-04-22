import { Plan } from '@/pricing-plans/entities/plan.entity';
import { AppDataSource } from './data-source';

interface PlanInterface {
  name: string;
  price: number;
  currency: string;
  description: string;
  permission: string;
  placesNumber: number;
}

const plans: PlanInterface[] = [
  {
    name: 'free',
    price: 0,
    currency: 'UAH',
    description:
      'Perfect for casual anglers who want to get started with the basics. ',
    permission: 'free',
    placesNumber: 2,
  },
  {
    name: 'free',
    price: 20,
    currency: 'UAH',
    description:
      'For serious anglers who want an edge on every trip. Unlock advanced forecasts, detailed weather insights, and powerful tools to plan your next big catch with precision.',
    permission: 'pro',
    placesNumber: 50,
  },
];

async function seedPlans() {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const planRepository = AppDataSource.getRepository(Plan);

    for (const item of plans) {
      const plan = planRepository.create({ ...item });
      await planRepository.save(plan);
    }
    console.log('Database seeded successfully!');
  } catch (error) {
    console.log('Error occured during seeding plans', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

seedPlans();
