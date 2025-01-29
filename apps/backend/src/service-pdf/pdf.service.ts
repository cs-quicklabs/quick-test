import { unlink } from "fs";
import { Injectable } from "@nestjs/common";
import { AwsS3Service } from "../shared/services/aws-s3.service";
import { AppConfigService } from "../shared/services/app.config.service";
import { ProjectEntity } from "../service-organization/project/project.entity";
import { TestSuiteEntity } from "../service-organization/test-suite/test-suite.entity";
import { UtilsService } from "../_helpers/utils.service";
import * as htmlToPdf from 'html-pdf';
import { getTestCasesFromHtml, getTestResultFromHtml, getTestSuitesFromHtml } from "./pdf.utils";

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
    async generateTestCasesPdf(project: ProjectEntity, testCasesObject) {
        const { pdfConfig } = this.appConfigService;
        const pdfCommonConfig = pdfConfig?.common;
        const pdfTestCaseConfig = pdfConfig?.testCase;
        const projectName = project.name.replace(/\s/g, "_");
        const pdfName = `${projectName}_`.concat(pdfTestCaseConfig.fileName);
        const content = getTestCasesFromHtml(testCasesObject)
        const buffer = await this.generatePdf(content);
        const file = UtilsService.createUploadableFile(pdfName, pdfCommonConfig, buffer);
        const key = await this.awsS3Service.uploadPdf(file);
        unlink(`${pdfName}.html`, () => { });
        return key;
    }

    async generatePdf(content: string): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const options = { format: 'A4', border: { top: "30px", right: "30px", bottom: "30px", left: "30px" } };
            htmlToPdf.create(content, options).toBuffer((err, buffer) => {
                if (err) reject(err);
                else resolve(buffer);
            });
        });
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
        const content = getTestSuitesFromHtml(testSuites);
        const buffer = await this.generatePdf(content);
        const file = UtilsService.createUploadableFile(pdfName, pdfCommonConfig, buffer,);
        const key = await this.awsS3Service.uploadPdf(file);
        unlink(`${pdfName}.html`, () => { });
        return key;
    }

    /**
     * Internal method to generate test suite result pdf
     * and forward it to aws service to store in s3
     */
    async generateTestSuiteResultPdf(project: ProjectEntity, testSuite: TestSuiteEntity, testCaseResultsObject) {
        const { pdfConfig } = this.appConfigService;
        const pdfCommonConfig = pdfConfig?.common;
        const pdfTestSuiteResultConfig = pdfConfig?.testSuiteResult;
        const projectName = project.name.replace(/\s/g, "_");
        const pdfName = `${projectName}_`.concat(pdfTestSuiteResultConfig.fileName);
        const content = getTestResultFromHtml(testSuite, testCaseResultsObject);
        const buffer = await this.generatePdf(content);
        const file = UtilsService.createUploadableFile(pdfName, pdfCommonConfig, buffer);
        const key = await this.awsS3Service.uploadPdf(file);
        unlink(`${pdfName}.html`, () => { });
        return key;
    }
}
