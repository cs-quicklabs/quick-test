import { ClassSerializerInterceptor, ValidationPipe } from "@nestjs/common";
import { NestFactory, Reflector } from "@nestjs/core";
import {
  ExpressAdapter,
  NestExpressApplication,
} from "@nestjs/platform-express";
import compression = require("compression");
import morgan = require("morgan");
import {
  initializeTransactionalContext,
  patchTypeORMRepositoryWithBaseRepository,
} from "typeorm-transactional-cls-hooked";

import * as bodyParser from "body-parser";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./filters/bad-request.filter";
import { QueryFailedFilter } from "./filters/query-failed.filter";
//import { ConfigService } from "./shared/services/config.service";
//import { SharedModule } from "./shared/shared.module";
import { NewrelicInterceptor } from "./common/interceptors/newrelic.interceptor";
import { setupSwagger } from "./viveo-swagger";

import { ConfigService } from "@nestjs/config";
import { AllConfigType } from "./config/config.type";

async function bootstrap() {
  initializeTransactionalContext();
  patchTypeORMRepositoryWithBaseRepository();
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(),
    {
      cors: true,
      bodyParser: false,
    },
  );
  const configService = app.get(ConfigService<AllConfigType>);
  app.enable("trust proxy"); // only if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
  app.use("/v1/payments/webhook", bodyParser.raw({ type: "application/json" }));

  app.enableCors();
  app.use(compression());
  app.use(morgan("combined"));
  app.setGlobalPrefix(
    configService.getOrThrow("app.apiPrefix", { infer: true }),
    {
      exclude: ["/"],
    },
  );
  const reflector = app.get(Reflector);

  app.useGlobalFilters(
    new HttpExceptionFilter(reflector),
    new QueryFailedFilter(reflector),
  );

  app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));
  app.useGlobalInterceptors(new NewrelicInterceptor());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      dismissDefaultMessages: true,
      validationError: {
        target: false,
      },
    }),
  );

  //const configService = app.select(SharedModule).get(ConfigService);

  setupSwagger(app);

  const port = configService.getOrThrow("app.port", { infer: true });
  await app.listen(port);
  console.info(`Server running on port ${port}`);
}

bootstrap();
