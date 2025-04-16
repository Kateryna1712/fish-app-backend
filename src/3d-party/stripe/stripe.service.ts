import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);

  constructor(@Inject('STRIPE_API_KEY') private readonly apiKey: string) {
    // @ts-ignore
    this.stripe = new Stripe(this.apiKey, { apiVersion: '2024-12-18.acacia' });
    this.logger.log('StripeService initialized with API version 2023-10-16');
  }

  async getProducts(): Promise<Stripe.Product[]> {
    try {
      const products = await this.stripe.products.list();
      this.logger.log('Products fetched successfully, products', products);
      return products.data;
    } catch (error) {
      this.logger.error('Failed to fetch products from Stripe', error.stack);
      throw new Error('Unable to fetch products from Stripe');
    }
  }

  async getCustomerOne(email: string) {
    try {
      const customer = await this.stripe.customers.search({
        query: `email:"${email}"`,
      });
      this.logger.log('Customer fetched successfully', customer.data);
      return customer.data[0];
    } catch (error) {
      this.logger.error('Failed to fetch customers from Stripe', error.stack);
      throw new Error('Unable to fetch customers from Stripe');
    }
  }

  async getCustomers(): Promise<Stripe.Customer[]> {
    try {
      const customers = await this.stripe.customers.list();
      this.logger.log('Customers fetched successfully');
      return customers.data;
    } catch (error) {
      this.logger.error('Failed to fetch customers from Stripe', error.stack);
      throw new Error('Unable to fetch customers from Stripe');
    }
  }

  async createCustomerRecord({ email, name }: { email: string; name: string }) {
    try {
      const customer = await this.stripe.customers.create({
        email,
        name,
      });

      console.log('=-=-=-=-= created customer in stripe', customer);

      return customer;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        'Creating a customer record failed.',
      );
    }
  }

  async setupintent(name: string, email: string, customerId: string) {
    try {
      if (customerId.length === 0) {
        customerId = (await this.createCustomerRecord({ email, name })).id;
      }
      const ephemeralKey = await this.stripe.ephemeralKeys.create({
        customer: customerId,
      });
      const setupIntent = await this.stripe.setupIntents.create({
        customer: customerId,
      });
      return {
        setupIntent: setupIntent.client_secret,
        ephemeralKey: ephemeralKey.secret,
        customer: customerId,
      };
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        'Creating a customer record failed.',
      );
    }
  }

  async paymentIntent(
    userId: string,
    userEmail: string,
    amount: number,
    currency: string,
    customerId: string,
    gateway: string,
  ) {
    try {
      amount *= 100;
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency,
        // payment_method_types: ['card'],
        customer: customerId,
        // confirm: true,
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: { userId, userEmail },
      });
      return { clientSecret: paymentIntent.client_secret, customerId };
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        'Creating a customer record failed.',
      );
    }
  }

  async createSubscription(customerId: string, priceId: string) {
    try {
      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        expand: ['latest_invoice.payment_intent'],
        // payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
      });

      return subscription;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        'Error while creating subscription.',
      );
    }
  }

  attachPaymentMethodToCustomer = async (
    customerId: string,
    paymentMethodId: string,
  ) => {
    const payMet = await this.stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    const updCustomerpay = await this.stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    console.log(
      '_--=-=-=-=-=-=-=payMet, updCustomerpay',
      payMet,
      updCustomerpay,
    );
  };

  verifySignature(payload: any, sig: string): Stripe.Event {
    try {
      return this.stripe.webhooks.constructEvent(
        payload,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (error) {
      console.log('ERROR IN verifySignature ', error);
    }
  }
}
