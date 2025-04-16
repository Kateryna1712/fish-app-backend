import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1744823175098 implements MigrationInterface {
  name = 'Migration1744823175098';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "otp" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "otp" character varying NOT NULL, "expiration" TIMESTAMP NOT NULL DEFAULT now(), "created_on" TIMESTAMP NOT NULL DEFAULT now(), "auth_id" uuid, CONSTRAINT "UQ_0ff01343154ec14e84bed53d1ff" UNIQUE ("otp"), CONSTRAINT "REL_63c1bd3f7b0e02e3bf5444ccaa" UNIQUE ("auth_id"), CONSTRAINT "PK_32556d9d7b22031d7d0e1fd6723" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "otp_passw" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "otp" character varying NOT NULL, "expiration" TIMESTAMP NOT NULL, "created_on" TIMESTAMP NOT NULL DEFAULT now(), "auth_id" uuid, CONSTRAINT "UQ_2e60b4a6fe5e364551338b2c8c0" UNIQUE ("otp"), CONSTRAINT "REL_ae75a62fb72dd7a4a0b091d135" UNIQUE ("auth_id"), CONSTRAINT "PK_f31f6f927d6e750fc9b68786fe5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "auth" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "method" character varying, "token" character varying, "verified" boolean NOT NULL DEFAULT false, "time" TIMESTAMP DEFAULT now(), "created_on" TIMESTAMP NOT NULL DEFAULT now(), "updated_on" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid, CONSTRAINT "UQ_b54f616411ef3824f6a5c06ea46" UNIQUE ("email"), CONSTRAINT "REL_9922406dc7d70e20423aeffadf" UNIQUE ("user_id"), CONSTRAINT "PK_7e416cf6172bc5aec04244f6459" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "plan" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "stripe_plan_id" character varying, "price" integer NOT NULL, "stripe_price_id" character varying, "currency" character varying, "description" text NOT NULL, "permission" character varying NOT NULL, "places_number" integer, "created_on" TIMESTAMP NOT NULL DEFAULT now(), "updated_on" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_54a2b686aed3b637654bf7ddbb3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."subscription_status_enum" AS ENUM('active', 'inactive', 'pending', 'canceled', 'failed', 'expired')`,
    );
    await queryRunner.query(
      `CREATE TABLE "subscription" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "stripe_subscription_id" character varying NOT NULL, "stripe_customer_id" character varying NOT NULL, "status" "public"."subscription_status_enum" NOT NULL DEFAULT 'inactive', "current_period_start" TIMESTAMP, "current_period_end" TIMESTAMP, "type" character varying NOT NULL DEFAULT 'free', "created_on" TIMESTAMP NOT NULL DEFAULT now(), "updated_on" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, "planId" uuid, CONSTRAINT "PK_8c3e00ebd02103caa1174cd5d9d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "place" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "lat" double precision NOT NULL, "lon" double precision NOT NULL, "created_on" TIMESTAMP NOT NULL DEFAULT now(), "updated_on" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "PK_96ab91d43aa89c5de1b59ee7cca" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "created_on" TIMESTAMP NOT NULL DEFAULT now(), "updated_on" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "invitation" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "accepted" boolean NOT NULL DEFAULT false, "created_on" TIMESTAMP NOT NULL DEFAULT now(), "updated_on" TIMESTAMP NOT NULL DEFAULT now(), "owner_id" uuid, "friend_id" uuid, CONSTRAINT "UQ_bcb0a0d2333443083582a05cdd8" UNIQUE ("email"), CONSTRAINT "REL_3c8aa1ab48419806a3d2ec1229" UNIQUE ("owner_id"), CONSTRAINT "REL_0887bbd948e9a2db9c28db3ccf" UNIQUE ("friend_id"), CONSTRAINT "PK_beb994737756c0f18a1c1f8669c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."subscription_liqpay_status_enum" AS ENUM('active', 'inactive', 'pending', 'canceled', 'failed', 'expired')`,
    );
    await queryRunner.query(
      `CREATE TABLE "subscription_liqpay" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" "public"."subscription_liqpay_status_enum" NOT NULL DEFAULT 'pending', "current_period_start" TIMESTAMP, "current_period_end" TIMESTAMP, "type" character varying NOT NULL DEFAULT 'free', "liqpay_order_id" character varying, "liqpay_transaction_id" integer, "payment_id" integer, "created_on" TIMESTAMP NOT NULL DEFAULT now(), "updated_on" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, "planId" uuid, CONSTRAINT "PK_b983e34e43a71103206f78f531c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "otp" ADD CONSTRAINT "FK_63c1bd3f7b0e02e3bf5444ccaac" FOREIGN KEY ("auth_id") REFERENCES "auth"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "otp_passw" ADD CONSTRAINT "FK_ae75a62fb72dd7a4a0b091d135e" FOREIGN KEY ("auth_id") REFERENCES "auth"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth" ADD CONSTRAINT "FK_9922406dc7d70e20423aeffadf3" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription" ADD CONSTRAINT "FK_cc906b4bc892b048f1b654d2aa0" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription" ADD CONSTRAINT "FK_6b6d0e4dc88105a4a11103dd2cd" FOREIGN KEY ("planId") REFERENCES "plan"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "place" ADD CONSTRAINT "FK_f6bdcc6c120ebfeeb91e2187082" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "invitation" ADD CONSTRAINT "FK_3c8aa1ab48419806a3d2ec12293" FOREIGN KEY ("owner_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "invitation" ADD CONSTRAINT "FK_0887bbd948e9a2db9c28db3ccfa" FOREIGN KEY ("friend_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription_liqpay" ADD CONSTRAINT "FK_66f74de2902dec9f1ed5a6bb578" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription_liqpay" ADD CONSTRAINT "FK_21f2ac8b10ce3e16714833d2443" FOREIGN KEY ("planId") REFERENCES "plan"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "subscription_liqpay" DROP CONSTRAINT "FK_21f2ac8b10ce3e16714833d2443"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription_liqpay" DROP CONSTRAINT "FK_66f74de2902dec9f1ed5a6bb578"`,
    );
    await queryRunner.query(
      `ALTER TABLE "invitation" DROP CONSTRAINT "FK_0887bbd948e9a2db9c28db3ccfa"`,
    );
    await queryRunner.query(
      `ALTER TABLE "invitation" DROP CONSTRAINT "FK_3c8aa1ab48419806a3d2ec12293"`,
    );
    await queryRunner.query(
      `ALTER TABLE "place" DROP CONSTRAINT "FK_f6bdcc6c120ebfeeb91e2187082"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription" DROP CONSTRAINT "FK_6b6d0e4dc88105a4a11103dd2cd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscription" DROP CONSTRAINT "FK_cc906b4bc892b048f1b654d2aa0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth" DROP CONSTRAINT "FK_9922406dc7d70e20423aeffadf3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "otp_passw" DROP CONSTRAINT "FK_ae75a62fb72dd7a4a0b091d135e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "otp" DROP CONSTRAINT "FK_63c1bd3f7b0e02e3bf5444ccaac"`,
    );
    await queryRunner.query(`DROP TABLE "subscription_liqpay"`);
    await queryRunner.query(
      `DROP TYPE "public"."subscription_liqpay_status_enum"`,
    );
    await queryRunner.query(`DROP TABLE "invitation"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "place"`);
    await queryRunner.query(`DROP TABLE "subscription"`);
    await queryRunner.query(`DROP TYPE "public"."subscription_status_enum"`);
    await queryRunner.query(`DROP TABLE "plan"`);
    await queryRunner.query(`DROP TABLE "auth"`);
    await queryRunner.query(`DROP TABLE "otp_passw"`);
    await queryRunner.query(`DROP TABLE "otp"`);
  }
}
