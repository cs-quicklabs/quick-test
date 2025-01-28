import { ConfigService } from "@nestjs/config";
import { AllConfigType } from "../../config/config.type";

export class AppConfigService {
  constructor(private readonly configService: ConfigService<AllConfigType>) {}

  get isDevelopment(): boolean {
    return (
      this.configService.get("app.nodeEnv", { infer: true }) === "development"
    );
  }

  get isProduction(): boolean {
    return (
      this.configService.get("app.nodeEnv", { infer: true }) === "production"
    );
  }

  get isQa(): boolean {
    return this.configService.get("app.nodeEnv", { infer: true }) === "qa";
  }

  get nodeEnv(): string {
    return (
      this.configService.get("app.nodeEnv", { infer: true }) || "development"
    );
  }

  get fallbackLanguage(): string {
    return this.configService.get("app.fallbackLanguage", { infer: true })
      ? this.configService
          .get("app.fallbackLanguage", { infer: true })
          .toLowerCase()
      : "en";
  }

  get pdfConfig() {
    return {
      common: {
        mimeType: "application/pdf",
        encodingType: "BufferEncoding",
      },
      testCase: {
        fileName: "test_cases.pdf",
      },
      testSuite: {
        fileName: "test_suite.pdf",
      },
      testSuiteResult: {
        fileName: "test_suite_result.pdf",
      },
    };
  }
}
