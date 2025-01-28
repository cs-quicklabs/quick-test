import "./boilerplate.polyfill";

import * as path from "path";
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { I18nModule, HeaderResolver } from "nestjs-i18n";
//import * as dotenv from 'dotenv';
import { MailerModule } from "@nestjs-modules/mailer";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";
import { ScheduleModule } from "@nestjs/schedule";
import { APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core/constants";
import {
  contextMiddleware,
  RawBodyMiddleware,
  JsonBodyMiddleware,
} from "./middlewares";
import { AuthModule } from "./service-auth/auth/auth.module";
import { UserModule } from "./service-users/user/user.module";
//import { ConfigService } from "./shared/services/config.service";
import { SharedModule } from "./shared/shared.module";
import { ProjectModule } from "./service-organization/project/project.module";
import { TestCaseModule } from "./service-organization/test-case/test-case.module";
import { TestSuitesModule } from "./service-organization/test-suite/test-suite.module";
import { OrganizationModule } from "./service-organization/organization/organization.module";
import { MilestoneModule } from "./service-organization/milestone/milestone.module";
import { PaymentModule } from "./service-organization/payment/payment.module";
import { DefectModule } from "./service-organization/defect/defect.module";
import { PluginModule } from "./service-organization/plugin/plugin.module";
import { ResponseInterceptor } from "./common/interceptors/response-interceptor";
import { ExceptionResponseFilter } from "./common/filters/exception-response.filter";
import { RoleModule } from "./service-role/role.module";
import { PermissionModule } from "./service-permission/permission.module";
import { TypeOrmConfigService } from "./database/typeorm-config.service";
import { DataSource, DataSourceOptions } from "typeorm";

import { ConfigModule, ConfigService } from "@nestjs/config";
import { AllConfigType } from "./config/config.type";
import appConfig from "./config/app.config";
import awsConfig from "./config/aws.config";
import databaseConfig from "./config/database.config";
import emailConfig from "./config/email.config";
import pdfConfig from "./config/pdf.config";
import stripeConfig from "./config/stripe.config";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfig,
        awsConfig,
        databaseConfig,
        emailConfig,
        pdfConfig,
        stripeConfig,
      ],
      envFilePath: [".env"],
    }),

    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
      dataSourceFactory: async (options: DataSourceOptions) => {
        return new DataSource(options).initialize();
      },
    }),

    I18nModule.forRootAsync({
      useFactory: (configService: ConfigService<AllConfigType>) => ({
        fallbackLanguage: configService.get("app.fallbackLanguage", {
          infer: true,
        }),
        loaderOptions: {
          path: path.join(__dirname, "/i18n/"),
          watch:
            configService.get("app.nodeEnv", { infer: true }) === "development",
        },
      }),
      resolvers: [
        {
          use: HeaderResolver,
          useFactory: (configService: ConfigService<AllConfigType>) => [
            configService.get("app.headerLanguage", { infer: true }),
          ],
          inject: [ConfigService],
        },
      ],
      imports: [
        AuthModule,
        UserModule,
        SharedModule,
        ProjectModule,
        OrganizationModule,
        TestCaseModule,
        TestSuitesModule,
        MilestoneModule,
        PaymentModule,
        DefectModule,
        PluginModule,
        ConfigModule,
      ],
      inject: [ConfigService],
    }),

    MailerModule.forRootAsync({
      useFactory: (configService: ConfigService<AllConfigType>) => ({
        transport: {
          host: configService.get("email.serverName", { infer: true }),
          port: configService.get("email.port", { infer: true }),
          secure: false,
          auth: {
            user: configService.get("email.userName", { infer: true }),
            pass: configService.get("email.key", { infer: true }),
          },
          tls: {
            rejectUnauthorized: false,
          },
        },
        defaults: {
          from: `<${configService.get("email.defaultEmail", { infer: true })}>`,
        },
        template: {
          dir: path.join(__dirname),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
        preview: false,
      }),
      imports: [ConfigModule],
      inject: [ConfigService],
    }),

    // PuppeteerModule.forRoot({
    //   isGlobal: true,
    //   timeout: 60000,
    // }),

    ScheduleModule.forRoot(),
    AuthModule,
    UserModule,
    ProjectModule,
    TestCaseModule,
    OrganizationModule,
    MilestoneModule,
    SharedModule,
    PaymentModule,
    DefectModule,
    PluginModule,
    RoleModule,
    PermissionModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ExceptionResponseFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): MiddlewareConsumer | void {
    consumer.apply(contextMiddleware).forRoutes("*");
    consumer.apply(RawBodyMiddleware).forRoutes({
      path: "/payments/webhook",
      method: RequestMethod.POST,
    });
    consumer.apply(JsonBodyMiddleware).forRoutes("*");
  }
}
