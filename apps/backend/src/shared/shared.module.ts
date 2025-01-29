import { forwardRef, Global, Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AwsS3Service } from "./services/aws-s3.service";
import { PdfService } from "../service-pdf/pdf.service";
import { AppConfigService } from "./services/app.config.service";
import { GeneratorService } from "./services/generator.service";
import { ValidatorService } from "./services/validator.service";
import { ContactFormService } from "./contact-form/contact-form.service";
import { ContactFormController } from "./contact-form/contact-form.controller";

import { AuthModule } from "../service-auth/auth/auth.module";
import { ContactFormEntity } from "./contact-form/contact-form.entity";
import { ConfigService } from "@nestjs/config";
import { AllConfigType } from "src/config/config.type";

const providers = [
  ContactFormService,
  ValidatorService,
  AwsS3Service,
  GeneratorService,
  PdfService,
  AppConfigService,
];

const controllers = [ContactFormController];

@Global()
@Module({
  imports: [
    HttpModule,
    forwardRef(() => AuthModule),
    TypeOrmModule.forFeature([ContactFormEntity]),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService<AllConfigType>) => ({
        secretOrPrivateKey: configService.get("app.jwtKey", { infer: true }),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers,
  providers,
  exports: [...providers, HttpModule, JwtModule],
})
export class SharedModule {}
