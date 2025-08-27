import { Injectable } from "@nestjs/common";
import { AwsS3Service } from "../shared/services/aws-s3.service";
import { AppConfigService } from "../shared/services/app.config.service";
import { ProjectEntity } from "../service-organization/project/project.entity";
import { TestSuiteEntity } from "../service-organization/test-suite/test-suite.entity";
import { UtilsService } from "../_helpers/utils.service";
import { generateTestCasesPdf, generateTestResultPdf, generateTestSuitesPdf } from "./pdf.utils";

@Injectable()
export class PdfService {
    constructor(
        private readonly awsS3Service: AwsS3Service,
        private readonly appConfigService: AppConfigService,
    ) { }

    /**
     * Internal method to generate test cases pdf
     * and forward it to aws service to store in s3
     */
    async generateTestCasesPdf(project: ProjectEntity, testCasesObject: any) {
        const { pdfConfig } = this.appConfigService;
        const pdfCommonConfig = pdfConfig?.common;
        const pdfTestCaseConfig = pdfConfig?.testCase;
        const projectName = project.name.replace(/\s/g, "_");
        const pdfName = `${projectName}_`.concat(pdfTestCaseConfig.fileName);
        const pdfBuffer = generateTestCasesPdf(testCasesObject, project);
        const file = UtilsService.createUploadableFile(pdfName, pdfCommonConfig, pdfBuffer);
        const key = await this.awsS3Service.uploadPdf(file);
        return key;
    }

    /**
     * Internal method to generate test suites pdf
     * and forward it to aws service to store in s3
     */
    async generateTestSuitesPdf(
        project: ProjectEntity,
        testSuites: TestSuiteEntity[],
    ) {
        const { pdfConfig } = this.appConfigService;
        const pdfCommonConfig = pdfConfig?.common;
        const pdfTestSuiteConfig = pdfConfig?.testSuite;
        const projectName = project.name.replace(/\s/g, "_");
        const pdfName = `${projectName}_`.concat(pdfTestSuiteConfig.fileName);
        const pdfBuffer = generateTestSuitesPdf(testSuites);
        const file = UtilsService.createUploadableFile(pdfName, pdfCommonConfig, pdfBuffer);
        const key = await this.awsS3Service.uploadPdf(file);
        return key;
    }

    /**
     * Internal method to generate test suite result pdf
     * and forward it to aws service to store in s3
     */
    async generateTestSuiteResultPdf(project: ProjectEntity, testSuite: TestSuiteEntity, testCaseResultsObject: any) {
        const { pdfConfig } = this.appConfigService;
        const pdfCommonConfig = pdfConfig?.common;
        const pdfTestSuiteResultConfig = pdfConfig?.testSuiteResult;
        const projectName = project.name.replace(/\s/g, "_");
        const pdfName = `${projectName}_`.concat(pdfTestSuiteResultConfig.fileName);
        const pdfBuffer = generateTestResultPdf(testSuite, testCaseResultsObject);
        const file = UtilsService.createUploadableFile(pdfName, pdfCommonConfig, pdfBuffer);
        const key = await this.awsS3Service.uploadPdf(file);
        return key;
    }
}
