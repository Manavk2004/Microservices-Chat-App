import { Logger, Search } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { SearchModule } from "./search.module";
import { applyToMicroservice } from "@app/rpc";


async function bootstrap(){
  process.title="search"

  const logger = new Logger('SearchBootstrap')
  const rmqUrl = process.env.RABBITMQ_URL ?? 'amqp://localhost:5672';
  const queue = process.env.SARCH_QUEUE ?? 'search_queue'

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    SearchModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [rmqUrl],
        queue,
        queueOptions: {
          durable: false
        }
      }
    }
  )

  applyToMicroservice(app)

  app.enableShutdownHooks()

  await app.listen()

  logger.log(`Search RMQ listening on queue ${queue} via ${rmqUrl}`)


}

bootstrap()