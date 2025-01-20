import { unlink, writeFileSync, readFileSync } from "fs";
import { Injectable } from "@nestjs/common";
import { AwsS3Service } from "./aws-s3.service";
import { AppConfigService } from "./app.config.service";
import { ProjectEntity } from "../../service-organization/project/project.entity";
import { TestSuiteEntity } from "../../service-organization/test-suite/test-suite.entity";
import { TestCaseResultStatus } from "../../common/enums/test-case-result-status";
import { TestSuiteStatus } from "../../common/enums/test-suite-status";
import { UtilsService } from "../../_helpers/utils.service";
import { chromium } from 'playwright';

@Injectable()
export class PdfService {
    constructor(
        private readonly awsS3Service: AwsS3Service,
        private readonly appConfigService: AppConfigService,
    ) { }
    private browser
    async init() {
        this.browser = await chromium.launch();
    }

    async getPage() {
        if (!this.browser) {
            await this.init();
        }
        return await this.browser.newPage();
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
        }
    }

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

        let text = "";
        let sectionCount = 1;
        for (const sectionName in testCasesObject) {
            const testCases = testCasesObject[sectionName];
            text += `<h3 class="sectionName">${sectionCount}. ${sectionName}</h3>`;
            text += `<table class="table table table-bordered table-striped table-sm">
                        <thead>
                            <tr>
                                <td class="idWidth" scope="col">ID</td>
                                <td scope="col">Title</td>
                            </tr>
                        </thead>
                        <tbody>`;
            for (let i = 0; i < testCases.length; i++) {
                text += `<tr>
                            <td class="idWidth" scope="row">${testCases[i].testcaseId}</td>
                            <td>${testCases[i].title}</td>
                        </tr>`;
            }
            text += `</tbody></table>`;
            sectionCount += 1;
        }

        const content = `
        <!DOCTYPE html>
        <html>
        
        <head>
            <title>Test Case PDF</title>
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/css/bootstrap.min.css"
                integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">
            <script src="https://code.jquery.com/jquery-3.2.1.slim.min.js"
                integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN"
                crossorigin="anonymous"></script>
            <script src="https://cdn.jsdelivr.net/npm/popper.js@1.12.9/dist/umd/popper.min.js"
                integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q"
                crossorigin="anonymous"></script>
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/js/bootstrap.min.js"
                integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl"
                crossorigin="anonymous"></script>
            <style>
                * {
                    font-family: 'Roboto', sans-serif;
                }
        
                html,
                body {
                    margin: auto;
                }
        
                .name {
                    font-size: 25px;
                    margin: 0px;
                }
        
                .sectionName {
                    font-size: 18px;
                    margin: 0px 0px 5px 0;
                }
                .idWidth {
                    width: 50px;
                }
                table thead tr td {
                    font-size: 14px;
                    font-weight: 700;
                }
                table tbody tr td {
                    font-size: 14px;
                }
            </style>
        </head>
        
        <body>
            <div>
                <h1 class="name">Test Cases</h1>
                <hr />
                <div class="table-responsive">
                   ${text}
                </div>
            </div>
        </body>
        
        </html>
        `;
        const buffer = await this.generatePdf(pdfName, content);
        let key;
        const file = UtilsService.createUploadableFile(
            pdfName,
            pdfCommonConfig,
            buffer,
        );
        key = await this.awsS3Service.uploadPdf(file);
        unlink(`${pdfName}.html`, () => { });
        return key;
    }

    async generatePdf(pdfName: string, htmlContent: string) {
        writeFileSync(`${pdfName}.html`, htmlContent);
        const page = await this.getPage();
        const html = readFileSync(`${pdfName}.html`, "utf-8");
        await page.setContent(html, { waitUntil: "domcontentloaded" });
        const pdf = await page.pdf({
            margin: { top: "30px", right: "30px", bottom: "30px", left: "30px" },
            printBackground: true,
            format: "A4",
            preferCSSPageSize: true, // Ensures CSS page size is honored
        });
        return pdf;
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

        let text = "";
        for (let i = 0; i < testSuites.length; i++) {
            text += `<h3 class="sectionName">${i + 1}. ${testSuites[i].name}</h3>`;
            let className = "pending";
            const status =
                testSuites[i].status === TestSuiteStatus.INPROGRESS
                    ? `${testSuites[i].status.charAt(0) +
                    testSuites[i].status.charAt(1).toLowerCase()
                    } ${testSuites[i].status.charAt(2)}${testSuites[i].status
                        .substring(3, testSuites[i].status.length)
                        .toLowerCase()}`
                    : testSuites[i].status.charAt(0) +
                    testSuites[i].status
                        .substring(1, testSuites[i].status.length)
                        .toLowerCase();
            switch (testSuites[i].status) {
                case TestSuiteStatus.INPROGRESS:
                    className = "inProgress";
                    break;
                case TestSuiteStatus.PENDING:
                    className = "pending";
                    break;
                case TestSuiteStatus.COMPLETED:
                    className = "completed";
                    break;
                default:
                    className = "pending";
            }
            text += `<table class="table table table-bordered table-striped table-sm">
                        <thead>
                            <tr>
                                <td scope="col" class="idWidth">Passed</td>
                                <td scope="col" class="idWidth">Failed</td>
                                <td scope="col" class="idWidth">Untested</td>
                                <td scope="col" class="idWidth">Total</td>
                                <td scope="col" class="idWidth">Status</td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td class="idWidth">${testSuites[i].testreport.passed}</td>
                                <td class="idWidth">${testSuites[i].testreport.failed}</td>
                                <td class="idWidth">${testSuites[i].testreport.untested}</td>
                                <td class="idWidth">${testSuites[i].testreport.total}</td>
                                <td class="idWidth ${className}">${status}</td>
                            </tr>
                        </tbody>
                    </table>`;
        }

        const content = `
        <!DOCTYPE html>
        <html>
        
        <head>
            <title>Test Case PDF</title>
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/css/bootstrap.min.css"
                integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">
            <script src="https://code.jquery.com/jquery-3.2.1.slim.min.js"
                integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN"
                crossorigin="anonymous"></script>
            <script src="https://cdn.jsdelivr.net/npm/popper.js@1.12.9/dist/umd/popper.min.js"
                integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q"
                crossorigin="anonymous"></script>
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/js/bootstrap.min.js"
                integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl"
                crossorigin="anonymous"></script>
            <style>
                * {
                    font-family: 'Roboto', sans-serif;
                }
        
                html,
                body {
                    margin: auto;
                }
        
                .name {
                    font-size: 25px;
                    margin: 0px;
                }
        
                .sectionName {
                    font-size: 18px;
                    margin: 0px 0px 5px 0;
                }
                .idWidth {
                    width: 100px;
                }
                table thead tr td {
                    font-size: 14px;
                    font-weight: 700;
                }
                table tbody tr td {
                    font-size: 14px;
                }
                .pending {
                    color: #3498db;
                }
                .inProgress {
                    color: #f1c40f;
                }
                .completed {
                    color: #07bc0c;
                }
            </style>
        </head>
        
        <body>
            <div>
                <h1 class="name">Test Runs</h1>
                <hr />
                <div class="table-responsive">
                    ${text}
                </div>
            </div>
        </body>
        
        </html>
        `;
        const buffer = await this.generatePdf(pdfName, content);
        let key;
        const file = UtilsService.createUploadableFile(
            pdfName,
            pdfCommonConfig,
            buffer,
        );
        key = await this.awsS3Service.uploadPdf(file);
        unlink(`${pdfName}.html`, () => { });
        return key;
    }

    /**
     * Internal method to generate test suite result pdf
     * and forward it to aws service to store in s3
     */
    async generateTestSuiteResultPdf(
        project: ProjectEntity,
        testSuite: TestSuiteEntity,
        testCaseResultsObject,
    ) {
        const { pdfConfig } = this.appConfigService;
        const pdfCommonConfig = pdfConfig?.common;
        const pdfTestSuiteResultConfig = pdfConfig?.testSuiteResult;
        const projectName = project.name.replace(/\s/g, "_");
        const pdfName = `${projectName}_`.concat(pdfTestSuiteResultConfig.fileName);
        const month = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
        ];
        const statusTestRun =
            testSuite.status === TestSuiteStatus.INPROGRESS
                ? `${testSuite.status.charAt(0) +
                testSuite.status.charAt(1).toLowerCase()
                } ${testSuite.status.charAt(2)}${testSuite.status
                    .substring(3, testSuite.status.length)
                    .toLowerCase()}`
                : testSuite.status.charAt(0) +
                testSuite.status.substring(1, testSuite.status.length).toLowerCase();
        let statusClassName = "pending";
        switch (testSuite.status) {
            case TestSuiteStatus.INPROGRESS:
                statusClassName = "inProgress";
                break;
            case TestSuiteStatus.PENDING:
                statusClassName = "pending";
                break;
            case TestSuiteStatus.COMPLETED:
                statusClassName = "completed";
                break;
            default:
                statusClassName = "pending";
        }
        const { passed, failed, untested, blocked, total } = testSuite.testreport;
        const passedResultPercentage = Math.ceil((passed * 100) / total);
        const failedResultPercentage = Math.ceil((failed * 100) / total);
        const blocekdResultPercentage = Math.ceil((blocked * 100) / total);
        const untestedResultPercentage = Math.ceil((untested * 100) / total);
        let sectionCount = 1;
        let text = "";
        for (const sectionName in testCaseResultsObject) {
            const testCaseResults = testCaseResultsObject[sectionName];
            text += `<h3 class="sectionNameOther">${sectionCount}. ${sectionName}</h3>
                    <table class="table table table-bordered table-striped table-sm">
                    <thead>
                        <tr>
                            <td scope="col" class="idWidth">ID</td>
                            <td scope="col" class="title">Title</td>
                            <td scope="col" class="status">Status</td>
                        </tr>
                    </thead>
                    <tbody>`;
            for (let i = 0; i < testCaseResults.length; i++) {
                let className = "";
                switch (testCaseResults[i].status) {
                    case TestCaseResultStatus.PASSED:
                        className = "passed";
                        break;
                    case TestCaseResultStatus.FAILED:
                        className = "failed";
                        break;
                    case TestCaseResultStatus.BLOCKED:
                        className = "blocked";
                        break;
                    case TestCaseResultStatus.UNTESTED:
                        className = "untested";
                        break;
                    default:
                        className = "untested";
                        break;
                }
                text += `<tr>
                            <td class="idWidth">${testCaseResults[i].testCaseId}</td>
                            <td class="title">${testCaseResults[i].testCaseTitle}</td>
                            <td class="status ${className}">${testCaseResults[i].status}</td>
                        </tr>`;
            }
            text += `</tbody></table>`;
            sectionCount += 1;
        }

        const content = `
                            <!DOCTYPE html>
                            <html>
                            
                            <head>
                                <title>Test Case PDF</title>
                                <link rel="preconnect" href="https://fonts.googleapis.com">
                                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                                <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
                                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/css/bootstrap.min.css"
                                    integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">
                                <script src="https://code.jquery.com/jquery-3.2.1.slim.min.js"
                                    integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN"
                                    crossorigin="anonymous"></script>
                                <script src="https://cdn.jsdelivr.net/npm/popper.js@1.12.9/dist/umd/popper.min.js"
                                    integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q"
                                    crossorigin="anonymous"></script>
                                <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/js/bootstrap.min.js"
                                    integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl"
                                    crossorigin="anonymous"></script>
                                <style>
                                    * {
                                        font-family: 'Roboto', sans-serif;
                                    }
                            
                                    html,
                                    body {
                                        margin: auto;
                                    }
                            
                                    .name {
                                        font-size: 25px;
                                        margin: 0px;
                                    }
                            
                                    .sectionName {
                                        font-size: 16px;
                                        margin: 0px 0px 5px 0;
                                    }
                                    .sectionNameOther {
                                        font-size: 18px;
                                        margin: 0px 0px 5px 0;
                                    }
                            
                                    .idWidth {
                                        width: 50px;
                                    }
                            
                                    .title {
                                        width: 350px;
                                    }
                            
                                    .status {
                                        width: 100px;
                                    }
                            
                                    table thead tr td {
                                        font-size: 14px;
                                        font-weight: 700;
                                    }
                            
                                    table tbody tr td {
                                        font-size: 14px;
                                    }
                            
                                    .pending {
                                        color: #3498db;
                                    }
                            
                                    .inProgress {
                                        color: #f1c40f;
                                    }
                            
                                    .completed {
                                        color: #07bc0c;
                                    }
                            
                                    .untested {
                                        color: #3498db;
                                    }
                            
                                    .passed {
                                        color: #07bc0c;
                                    }
                            
                                    .failed {
                                        color: #e74c3c;
                                    }

                                    .blocked {
                                        color: #000000;
                                    }
                                </style>
                            </head>
                            
                            <body>
                                <div>
                                    <h1 class="name">${testSuite.name}</h1>
                                    <hr />
                                    <div class="table-responsive">
                                        <h3 class="sectionName">Created On: ${month[testSuite.createdAt.getMonth()]
            } ${testSuite.createdAt.getDate()}, ${testSuite.createdAt.getFullYear()}</h3>
                                        <h3 class="sectionName">Status: <span class=${statusClassName}>${statusTestRun}</span></h3>
                                        <table class="table table table-bordered table-striped table-sm">
                                            <thead>
                                                <tr>
                                                    <td scope="col" class="text-center">Passed</td>
                                                    <td scope="col" class="text-center">Failed</td>
                                                    <td scope="col" class="text-center">Untested</td>
                                                    <td scope="col" class="text-center">Blocked</td>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td class="text-center">${passedResultPercentage}% (${passed}/${total})</td>
                                                    <td class="text-center">${failedResultPercentage}% (${failed}/${total})</td>
                                                    <td class="text-center">${untestedResultPercentage}% (${untested}/${total})</td>
                                                    <td class="text-center">${blocekdResultPercentage}% (${blocked}/${total})</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                        ${text}
                                    </div>
                                </div>
                            </body>
                            
                            </html>
        `;

        const buffer = await this.generatePdf(pdfName, content);
        let key;
        const file = UtilsService.createUploadableFile(
            pdfName,
            pdfCommonConfig,
            buffer,
        );
        key = await this.awsS3Service.uploadPdf(file);
        unlink(`${pdfName}.html`, () => { });
        return key;
    }

    /**
     * Internal method to generate invoice pdf and
     * pass it to aws s3 service to store
     */
    // async generatePaidInvoicePdf(
    //     invoice: InvoiceEntity,
    //     paymentMethod,
    //     currentLoggedInUser: UserEntity
    // ): Promise<string> {
    //     const { pdfConfig } = this.configService;
    //     const pdfCommonConfig = pdfConfig?.common;
    //     const pdfPaymentSuccessInvoiceConfig = pdfConfig?.paymentSuccessInvoice;
    //     const pdfName = `${invoice.id}.pdf`;
    //     const writableStream = createWriteStream(pdfName);
    //     const margins = {
    //         left: pdfCommonConfig.marginLeft,
    //         right: pdfCommonConfig.marginRight,
    //         top: pdfCommonConfig.marginTop,
    //         bottom: pdfCommonConfig.marginBottom
    //     }
    //     const pdf = new PDF({
    //         bufferPages: true,
    //         margins
    //     });
    //     const pageHeight = Math.floor(pdf.page.height);
    //     const pageWidth = Math.floor(pdf.page.width);
    //     const textHeight = Math.floor(pageHeight / pdfPaymentSuccessInvoiceConfig.textHeight);
    //     const borderHeight = pageHeight - margins.top - margins.bottom;
    //     const borderWidth = pageWidth - margins.left - margins.right;
    //     const titleHeight = margins.top + pdfPaymentSuccessInvoiceConfig.titleHeight;
    //     const titleLeftMargin = margins.left + pdfPaymentSuccessInvoiceConfig.titleLeftMargin;
    //     const titleStart = margins.top + pdfPaymentSuccessInvoiceConfig.titleStart;
    //     const invoiceHeight = titleHeight + pdfPaymentSuccessInvoiceConfig.invoiceHeight;
    //     const invoiceStart = titleHeight + pdfPaymentSuccessInvoiceConfig.invoiceStart;
    //     const billingAddressHeight = invoiceHeight + pdfPaymentSuccessInvoiceConfig.billingAddressHeight;
    //     const billingAddressStart = invoiceHeight + pdfPaymentSuccessInvoiceConfig.billingAddressStart;
    //     const purchaseDetailsHeight = billingAddressHeight + pdfPaymentSuccessInvoiceConfig.invoiceHeight;
    //     const purchaseDetailsStart = billingAddressHeight + pdfPaymentSuccessInvoiceConfig.invoiceStart;
    //     const purchaseDetailsLeftMargin = margins.left + pdfPaymentSuccessInvoiceConfig.purchaseDetailsLeftMargin;
    //     const headingsHeight = purchaseDetailsHeight + pdfPaymentSuccessInvoiceConfig.headingsHeight;
    //     const headingsStart = purchaseDetailsHeight + pdfPaymentSuccessInvoiceConfig.headingsStart;
    //     const quantityLeftMargin = margins.left + pdfPaymentSuccessInvoiceConfig.quantityLeftMargin;
    //     const quantityWdith = pdfPaymentSuccessInvoiceConfig.quantityWdith;
    //     const descriptionStart = quantityLeftMargin + quantityWdith;
    //     const descriptionWidth = pdfPaymentSuccessInvoiceConfig.descriptionWidth;
    //     const amountStart =  descriptionStart + descriptionWidth;
    //     const detailsHeight = headingsHeight + pdfPaymentSuccessInvoiceConfig.detailsHeight;
    //     const detailsStart = headingsHeight + pdfPaymentSuccessInvoiceConfig.detailsStart;
    //     const taxHeight = detailsHeight + pdfPaymentSuccessInvoiceConfig.taxHeight;
    //     const taxStart = detailsHeight + pdfPaymentSuccessInvoiceConfig.taxStart;
    //     const totalHeight = taxHeight + pdfPaymentSuccessInvoiceConfig.totalHeight;
    //     const totalStart = taxHeight + pdfPaymentSuccessInvoiceConfig.totalStart;
    //     const policyHeight = totalHeight + pdfPaymentSuccessInvoiceConfig.policyHeight;
    //     const policyStart = totalHeight + pdfPaymentSuccessInvoiceConfig.policyStart;
    //     const endStart = policyHeight + pdfPaymentSuccessInvoiceConfig.endStart;
    //     const endLeftMargin = margins.left + pdfPaymentSuccessInvoiceConfig.endLeftMargin;
    //     const contactLink = pdfCommonConfig.contactLink;
    //     const policyLine1 = pdfPaymentSuccessInvoiceConfig.policyLine1;
    //     const policyLine2 = pdfPaymentSuccessInvoiceConfig.policyLine2;
    //     const policyLine3 = pdfPaymentSuccessInvoiceConfig.policyLine3;
    //     const policyLine4 = pdfPaymentSuccessInvoiceConfig.policyLine4;
    //     const policyLine5 = pdfPaymentSuccessInvoiceConfig.policyLine5;
    //     const policyLine6 = pdfPaymentSuccessInvoiceConfig.policyLine6;
    //     const cardLast4digits = paymentMethod?.last4;
    //     const lineWidth = pdfPaymentSuccessInvoiceConfig.lineWidth;
    //     const policyLine1Start = margins.left + pdfPaymentSuccessInvoiceConfig.policyLine1Start;
    //     const policyLine2Start = margins.left + pdfPaymentSuccessInvoiceConfig.policyLine2Start;
    //     const policyLine3Start = margins.left + pdfPaymentSuccessInvoiceConfig.policyLine3Start;
    //     const policyLine4Start = margins.left + pdfPaymentSuccessInvoiceConfig.policyLine4Start;
    //     const policyLine5Start = margins.left + pdfPaymentSuccessInvoiceConfig.policyLine5Start;
    //     const policyLine6Start = margins.left + pdfPaymentSuccessInvoiceConfig.policyLine6Start;
    //     const { city, address1, address2, state, postalCode, country } = currentLoggedInUser;
    //     const addressCheck1 = address1 && address2 && city && state && postalCode && country;
    //     const addressCheck2 = address1 && city && state && postalCode && country;
    //     const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    //     pdf.pipe(writableStream);
    //     pdf.rect(margins.left, margins.top, borderWidth, borderHeight)
    //         .stroke(`#${pdfPaymentSuccessInvoiceConfig.fillColor4}`);

    //     pdf.font('Times-Roman')
    //         .fontSize(pdfPaymentSuccessInvoiceConfig.fontSize1)
    //         .fillColor(`#${pdfPaymentSuccessInvoiceConfig.fillColor2}`)
    //         .text("TestBox", titleLeftMargin, titleStart);

    //     pdf.lineWidth(lineWidth)
    //         .moveTo(margins.left, titleHeight)
    //         .lineTo(margins.left + borderWidth, titleHeight)
    //         .fillAndStroke(`#${pdfPaymentSuccessInvoiceConfig.fillColor4}`);

    //     pdf.font('Times-Roman')
    //         .fontSize(pdfPaymentSuccessInvoiceConfig.fontSize2)
    //         .fillColor(`#${pdfPaymentSuccessInvoiceConfig.fillColor3}`)
    //         .text("Invoice/Receipt", titleLeftMargin, invoiceStart)
    //         .fontSize(pdfPaymentSuccessInvoiceConfig.fontSize3)
    //         .fillColor(`#${pdfPaymentSuccessInvoiceConfig.fillColor1}`)
    //         .text(`Invoice ID: `, titleLeftMargin, invoiceStart + 20)
    //         .fillColor(`#${pdfPaymentSuccessInvoiceConfig.fillColor3}`)
    //         .text(` ${invoice.id}`, titleLeftMargin + 50, invoiceStart + 20);

    //     pdf.lineWidth(lineWidth)
    //         .moveTo(margins.left, invoiceHeight)
    //         .lineTo(margins.left + borderWidth, invoiceHeight)
    //         .fillAndStroke(`#${pdfPaymentSuccessInvoiceConfig.fillColor4}`);

    //     pdf.font('Times-Roman')
    //         .fontSize(pdfPaymentSuccessInvoiceConfig.fontSize3)
    //         .fillColor(`#${pdfPaymentSuccessInvoiceConfig.fillColor1}`)
    //         .text(`Billed from:`, titleLeftMargin, billingAddressStart)
    //         .text(`TestBox, Inc.`, titleLeftMargin, billingAddressStart + 20)
    //         .text(`${pdfCommonConfig.testBoxAddressLine1}`, titleLeftMargin, billingAddressStart + 35)
    //         .text(`${pdfCommonConfig.testBoxAddressLine2}`, titleLeftMargin, billingAddressStart + 50)
    //         .text(`${pdfCommonConfig.testBoxAddressCity}, ${pdfCommonConfig.testBoxAddressState} ${pdfCommonConfig.testBoxAddressPostalCode}`, titleLeftMargin, billingAddressStart + 65)
    //         .text(`${pdfCommonConfig.testBoxAddressCountry}`, titleLeftMargin, billingAddressStart + 80);

    //     pdf.font('Times-Roman')
    //         .fontSize(pdfPaymentSuccessInvoiceConfig.fontSize3)
    //         .fillColor(`#${pdfPaymentSuccessInvoiceConfig.fillColor1}`)
    //         .text(`Billed to:`, titleLeftMargin + Math.floor(borderWidth / 2), billingAddressStart)
    //         .text(`${currentLoggedInUser.firstName}`, titleLeftMargin + Math.floor(borderWidth / 2), billingAddressStart + 20);

    //     let y = billingAddressStart + 35;
    //     if (addressCheck1) {
    //         pdf.font('Times-Roman')
    //             .fontSize(pdfPaymentSuccessInvoiceConfig.fontSize3)
    //             .fillColor(`#${pdfPaymentSuccessInvoiceConfig.fillColor1}`)
    //             .text(`${address1}`, titleLeftMargin + Math.floor(borderWidth / 2), y, {
    //                 height: textHeight,
    //                 ellipsis: true
    //             })
    //             .text(`${address2}`, titleLeftMargin + Math.floor(borderWidth / 2), y + 15, {
    //                 height: textHeight,
    //                 ellipsis: true
    //             })
    //             .text(`${city}, ${state} ${postalCode}`, titleLeftMargin + Math.floor(borderWidth / 2), y + 30, {
    //                 height: textHeight,
    //                 ellipsis: true
    //             })
    //             .text(`${country}`, titleLeftMargin + Math.floor(borderWidth / 2), y + 45, {
    //                 height: textHeight,
    //                 ellipsis: true
    //             });
    //         y += 65;
    //     } else if (addressCheck2) {
    //         pdf.font('Times-Roman')
    //             .fontSize(pdfPaymentSuccessInvoiceConfig.fontSize3)
    //             .fillColor(`#${pdfPaymentSuccessInvoiceConfig.fillColor1}`)
    //             .text(`${address1}`, titleLeftMargin + Math.floor(borderWidth / 2), y, {
    //                 height: textHeight,
    //                 ellipsis: true
    //             })
    //             .text(`${city}, ${state} ${postalCode}`, titleLeftMargin + Math.floor(borderWidth / 2), y + 15, {
    //                 height: textHeight,
    //                 ellipsis: true
    //             })
    //             .text(`${country}`, titleLeftMargin + Math.floor(borderWidth / 2), y + 30, {
    //                 height: textHeight,
    //                 ellipsis: true
    //             });
    //         y += 50;
    //     }
    //     pdf.font('Times-Roman')
    //         .fontSize(pdfPaymentSuccessInvoiceConfig.fontSize3)
    //         .fillColor(`#${pdfPaymentSuccessInvoiceConfig.fillColor1}`)
    //         .text(`Email ID: ${currentLoggedInUser.email}`, titleLeftMargin + Math.floor(borderWidth / 2), y + 10, {
    //             height: textHeight,
    //             ellipsis: true
    //         });

    //     pdf.lineWidth(lineWidth)
    //         .moveTo(margins.left + Math.floor(borderWidth / 2), invoiceHeight)
    //         .lineTo(margins.left + Math.floor(borderWidth / 2), billingAddressHeight)
    //         .fillAndStroke(`#${pdfPaymentSuccessInvoiceConfig.fillColor4}`);

    //     pdf.lineWidth(lineWidth)
    //         .moveTo(margins.left, billingAddressHeight)
    //         .lineTo(margins.left + borderWidth, billingAddressHeight)
    //         .fillAndStroke(`#${pdfPaymentSuccessInvoiceConfig.fillColor4}`);

    //     pdf.lineWidth(lineWidth)
    //         .moveTo(margins.left + Math.floor(borderWidth / 3), billingAddressHeight)
    //         .lineTo(margins.left + Math.floor(borderWidth / 3), purchaseDetailsHeight)
    //         .fillAndStroke(`#${pdfPaymentSuccessInvoiceConfig.fillColor4}`);

    //     pdf.lineWidth(lineWidth)
    //         .moveTo(margins.left + Math.floor(borderWidth / 3) + Math.floor(borderWidth / 3), billingAddressHeight)
    //         .lineTo(margins.left + Math.floor(borderWidth / 3) + Math.floor(borderWidth / 3), purchaseDetailsHeight)
    //         .fillAndStroke(`#${pdfPaymentSuccessInvoiceConfig.fillColor4}`);

    //     pdf.lineWidth(lineWidth)
    //         .moveTo(margins.left, purchaseDetailsHeight)
    //         .lineTo(margins.left + borderWidth, purchaseDetailsHeight)
    //         .fillAndStroke(`#${pdfPaymentSuccessInvoiceConfig.fillColor4}`);

    //     pdf.font('Times-Roman')
    //         .fontSize(pdfPaymentSuccessInvoiceConfig.fontSize3)
    //         .fillColor(`#${pdfPaymentSuccessInvoiceConfig.fillColor1}`)
    //         .text(`Purchase Date`, purchaseDetailsLeftMargin, purchaseDetailsStart)
    //         .text(`${month[invoice.periodStart.getMonth()]} ${invoice.periodStart.getDate()}, ${invoice.periodStart.getFullYear()}`, purchaseDetailsLeftMargin, purchaseDetailsStart + 15);

    //     pdf.font('Times-Roman')
    //         .fontSize(pdfPaymentSuccessInvoiceConfig.fontSize3)
    //         .fillColor(`#${pdfPaymentSuccessInvoiceConfig.fillColor1}`)
    //         .text(`Payment Method`, Math.floor(borderWidth / 3) + purchaseDetailsLeftMargin, purchaseDetailsStart)
    //         .text(`Card ending with ${cardLast4digits ? cardLast4digits : "-"}`, Math.floor(borderWidth / 3) + purchaseDetailsLeftMargin - 10, purchaseDetailsStart + 15);

    //     pdf.font('Times-Roman')
    //         .fontSize(pdfPaymentSuccessInvoiceConfig.fontSize3)
    //         .fillColor(`#${pdfPaymentSuccessInvoiceConfig.fillColor1}`)
    //         .text(`Payment Status`, Math.floor(borderWidth / 3) + Math.floor(borderWidth / 3) + purchaseDetailsLeftMargin, purchaseDetailsStart)
    //         .text(`${invoice.status === InvoiceStatus.paid ? "Paid": "Failed"}`, Math.floor(borderWidth / 3) + Math.floor(borderWidth / 3) + purchaseDetailsLeftMargin + 20, purchaseDetailsStart + 15);

    //     pdf.lineWidth(lineWidth)
    //         .moveTo(margins.left, headingsHeight)
    //         .lineTo(margins.left + borderWidth, headingsHeight)
    //         .fillAndStroke(`#${pdfPaymentSuccessInvoiceConfig.fillColor4}`);

    //     pdf.font('Times-Roman')
    //         .fontSize(pdfPaymentSuccessInvoiceConfig.fontSize3)
    //         .fillColor(`#${pdfPaymentSuccessInvoiceConfig.fillColor3}`)
    //         .text(`Qty`, quantityLeftMargin, headingsStart)
    //         .text(`Description`, descriptionStart, headingsStart)
    //         .text(`Amount`, amountStart, headingsStart);

    //     pdf.font('Times-Roman')
    //         .fontSize(pdfPaymentSuccessInvoiceConfig.fontSize3)
    //         .fillColor(`#${pdfPaymentSuccessInvoiceConfig.fillColor1}`)
    //         .text(`1`, quantityLeftMargin, detailsStart);

    //     pdf.font('Times-Roman')
    //         .fontSize(pdfPaymentSuccessInvoiceConfig.fontSize3)
    //         .fillColor(`#${pdfPaymentSuccessInvoiceConfig.fillColor1}`)
    //         .text(`${UtilsService.upperCase(invoice.currency)} $${invoice.amount/100}`, amountStart, detailsStart);

    //     pdf.font('Times-Roman')
    //         .fontSize(pdfPaymentSuccessInvoiceConfig.fontSize3)
    //         .fillColor(`#${pdfPaymentSuccessInvoiceConfig.fillColor1}`)
    //         .text(`TestBox 30-days Subscription, Standard License`, descriptionStart, detailsStart)
    //         .text(`${invoice.amount === 0 ? "Free Trial" : "Active Paid Plan"}`, descriptionStart, detailsStart + 25)
    //         .text(`Date of signup: ${month[currentLoggedInUser.createdAt.getMonth()]} ${currentLoggedInUser.createdAt.getDate()}, ${currentLoggedInUser.createdAt.getFullYear()}`, descriptionStart, detailsStart + 40)
    //         .text(`Date of next payment: ${month[invoice.periodEnd.getMonth()]} ${invoice.periodEnd.getDate()}, ${invoice.periodEnd.getFullYear()}`, descriptionStart, detailsStart + 55)
    //         .text(`Period: ${Math.ceil((invoice.periodEnd.getTime() - invoice.periodStart.getTime()) / 86400000)}`, descriptionStart, detailsStart + 70)
    //         .text(`Payment amount(including tax): ${UtilsService.upperCase(invoice.currency)} $${invoice.amount/100}`, descriptionStart, detailsStart + 85);

    //     pdf.lineWidth(lineWidth)
    //         .moveTo(margins.left, detailsHeight)
    //         .lineTo(margins.left + borderWidth, detailsHeight)
    //         .fillAndStroke(`#${pdfPaymentSuccessInvoiceConfig.fillColor4}`);

    //     pdf.font('Times-Roman')
    //         .fontSize(pdfPaymentSuccessInvoiceConfig.fontSize3)
    //         .fillColor(`#${pdfPaymentSuccessInvoiceConfig.fillColor1}`)
    //         .text(`18% Tax:`, descriptionStart, taxStart)
    //         .text(`${UtilsService.upperCase(invoice.currency)} $${0}`, amountStart, taxStart);

    //     pdf.lineWidth(lineWidth)
    //         .moveTo(margins.left, taxHeight)
    //         .lineTo(margins.left + borderWidth, taxHeight)
    //         .fillAndStroke(`#${pdfPaymentSuccessInvoiceConfig.fillColor4}`);

    //     pdf.font('Times-Roman')
    //         .fontSize(pdfPaymentSuccessInvoiceConfig.fontSize3)
    //         .fillColor(`#${pdfPaymentSuccessInvoiceConfig.fillColor3}`)
    //         .text(`TOTAL`, descriptionStart, totalStart)
    //         .fillColor(`#${pdfPaymentSuccessInvoiceConfig.fillColor1}`)
    //         .text(`${UtilsService.upperCase(invoice.currency)} $${invoice.amount/100}`, amountStart, totalStart);

    //     pdf.lineWidth(lineWidth)
    //         .moveTo(margins.left, totalHeight)
    //         .lineTo(margins.left + borderWidth, totalHeight)
    //         .fillAndStroke(`#${pdfPaymentSuccessInvoiceConfig.fillColor4}`);

    //     pdf.font('Times-Roman')
    //         .fontSize(pdfPaymentSuccessInvoiceConfig.fontSize3)
    //         .fillColor(`#${pdfPaymentSuccessInvoiceConfig.fillColor1}`)
    //         .text(`${policyLine1}`, policyLine1Start, policyStart)
    //         .text(`${policyLine2}`, policyLine2Start, policyStart + 15)
    //         .text(`${policyLine3}`, policyLine3Start, policyStart + 30)
    //         .text(`${policyLine4}`, policyLine4Start, policyStart + 45)
    //         .text(`${policyLine5}`, policyLine5Start, policyStart + 75)
    //         .text(`${policyLine6}`, policyLine6Start, policyStart + 90);

    //     pdf.lineWidth(lineWidth)
    //         .moveTo(margins.left, policyHeight)
    //         .lineTo(margins.left + borderWidth, policyHeight)
    //         .fillAndStroke(`#${pdfPaymentSuccessInvoiceConfig.fillColor4}`);

    //     pdf.font('Times-Roman')
    //         .fontSize(pdfPaymentSuccessInvoiceConfig.fontSize3)
    //         .fillColor(`#${pdfPaymentSuccessInvoiceConfig.fillColor1}`)
    //         .text(`Thank you for your business!`, endLeftMargin, endStart)
    //         .fillColor(`#${pdfPaymentSuccessInvoiceConfig.fillColor2}`)
    //         .text("Click here to contact us.", endLeftMargin + 10, endStart + 15, {
    //             link: contactLink,
    //             underline: true
    //         });

    //     pdf.end();
    //     let key;
    //     const readableStream = createReadStream(pdfName);
    //     const file = UtilsService.createUploadableFile(pdfName, pdfCommonConfig, readableStream)
    //     key = await this.awsS3Service.uploadPdf(file);
    //     unlink(pdfName, () => {});
    //     return key;
    // }
}
