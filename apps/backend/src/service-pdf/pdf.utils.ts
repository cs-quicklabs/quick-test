import { TestCaseResultStatus } from "src/common/enums/test-case-result-status";
import { TestSuiteStatus } from "src/common/enums/test-suite-status";
import { TestSuiteEntity } from "src/service-organization/test-suite/test-suite.entity";


export const getContentFromHtml = (testSuite: TestSuiteEntity, testCaseResultsObject) => {
    const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December",];
    const statusTestRun =
        testSuite.status === TestSuiteStatus.INPROGRESS
            ? `${testSuite.status.charAt(0) + testSuite.status.charAt(1).toLowerCase()} ${testSuite.status.charAt(2)}${testSuite.status.substring(3, testSuite.status.length).toLowerCase()}`
            : testSuite.status.charAt(0) + testSuite.status.substring(1, testSuite.status.length).toLowerCase();
    let statusClassName = testSuite?.status?.toLocaleLowerCase();
    const { passed, failed, untested, blocked, total } = testSuite.testreport;
    const passedResultPercentage = Math.ceil((passed * 100) / total);
    const failedResultPercentage = Math.ceil((failed * 100) / total);
    const blocekdResultPercentage = Math.ceil((blocked * 100) / total);
    const untestedResultPercentage = Math.ceil((untested * 100) / total);

    let text = "";
    let sectionCount = 1;
    for (const sectionName in testCaseResultsObject) {
        const testCaseResults = testCaseResultsObject[sectionName];
        text += `<h3 class="sectionNameOther">${sectionCount}. ${sectionName}</h3>
                        <table class="table table-bordered table-striped table-sm">
                        <thead>
                            <tr>
                                <td scope="col" class="idWidth"><b>ID</b></td>
                                <td scope="col" class="title"><b>Title</b></td>
                                <td scope="col" class="status"><b>Status</b></td>
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

    return `<!DOCTYPE html>
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
                            font-size: 14px;
                            margin: 0px;
                        }

                        .sectionNameOther {
                            font-size: 12px;
                            margin: 10px 0;
                        }

                        table {
                            width: 100%;
                            border-collapse: collapse;
                            page-break-inside: avoid;
                            margin-bottom: 28px;
                        }

                        td, th {
                            word-wrap: break-word;
                            border: 1px solid #ddd;
                            padding: 8px;
                        }

                        .table-responsive {
                            margin-bottom: 28px;
                            font-size: 10px;
                        }

                        .page-break {
                            page-break-before: always;
                            page-break-after: always;
                            page-break-inside: avoid;
                        }

                                    .pending {
                                        color: #3498db;
                                    }
                            
                                    .inprogress {
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
                                        <table class="table table-bordered table-striped table-sm">
                                            <thead>
                                                <tr>
                                                    <td scope="col" class="text-center"><b>Passed</b></td>
                                                    <td scope="col" class="text-center"><b>Failed</b></td>
                                                    <td scope="col" class="text-center"><b>Untested</b></td>
                                                    <td scope="col" class="text-center"><b>Blocked</b></td>
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
    `
}