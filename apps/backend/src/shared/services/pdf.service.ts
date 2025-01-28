import { unlink } from "fs";
import { Injectable } from "@nestjs/common";
import { AwsS3Service } from "./aws-s3.service";
import { AppConfigService } from "./app.config.service";
import { ProjectEntity } from "../../service-organization/project/project.entity";
import { TestSuiteEntity } from "../../service-organization/test-suite/test-suite.entity";
import { TestCaseResultStatus } from "../../common/enums/test-case-result-status";
import { TestSuiteStatus } from "../../common/enums/test-suite-status";
import { UtilsService } from "../../_helpers/utils.service";
import * as htmlToPdf from 'html-pdf';

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
        const buffer = await this.generatePdf(content);
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
        const buffer = await this.generatePdf(content);
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
                    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
                    <style>
                        * {
                            font-family: 'Roboto', sans-serif;
                        }

                        body {
                            margin: 0;
                            padding: 0;
                        }

                        .name {
                            font-size: 25px;
                            margin: 0px;
                        }

                        .sectionNameOther {
                            font-size: 18px;
                            margin: 10px 0;
                        }

                        table {
                            width: 100%;
                            border-collapse: collapse;
                            page-break-inside: avoid;
                            margin-bottom: 40px;
                        }

                        td, th {
                            word-wrap: break-word;
                            border: 1px solid #ddd;
                            padding: 8px;
                        }

                        .table-responsive {
                            margin-bottom: 40px;
                        }

                        .page-break {
                            page-break-before: always;
                            page-break-after: always;
                            page-break-inside: avoid;
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
                                        <h3 class="sectionNameOther">Created On: ${month[testSuite.createdAt.getMonth()]} ${testSuite.createdAt.getDate()}, ${testSuite.createdAt.getFullYear()}</h3>
                                        <h3 class="sectionNameOther">Status: <span class=${statusClassName}>${statusTestRun}</span></h3>
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

        const buffer = await this.generatePdf(content);
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
}
