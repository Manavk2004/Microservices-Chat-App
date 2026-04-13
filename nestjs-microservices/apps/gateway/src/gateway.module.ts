import { Module } from '@nestjs/common';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/user.module';
import { ProductsHttpController } from './products/products.controller';
import { SearchHttpController } from './search/search.controller';

@Module({
  imports: [

    //loads .env into process.env -> Simpler and also standard
    ConfigModule.forRoot({
      isGlobal: true
    }),

    //Connect our gateway to our mongo users
    MongooseModule.forRoot(process.env.MONGO_URI_USERS as string),
    UsersModule,
    AuthModule,
    ClientsModule.register(
      [
        {
          name: 'CATALOG_CLIENT',
          transport: Transport.RMQ,
          options: {
            urls: [process.env.RABBITMQ_URL ?? 'amqp://localhost:5672'],
            queue: process.env.CATALOG_QUEUE ?? 'catalog_queue',
            queueOptions: {durable: false }
          }
        },
        {
          name: 'MEDIA_CLIENT',
          transport: Transport.RMQ,
          options: {
            urls: [process.env.RABBITMQ_URL ?? 'amqp://localhost:5672'],
            queue: process.env.MEDIA_QUEUE ?? 'media_queue',
            queueOptions: {durable: false }
          }
        },
        {
          name: 'SEARCH_CLIENT',
          transport: Transport.RMQ,
          options: {
            urls: [process.env.RABBITMQ_URL ?? 'amqp://localhost:5672'],
            queue: process.env.SEARCH_QUEUE ?? 'search_queue',
            queueOptions: {durable: false }
          }
        }
      ]
    )
  ],
  controllers: [GatewayController, ProductsHttpController, SearchHttpController],
  providers: [GatewayService],
})
export class GatewayModule {}
