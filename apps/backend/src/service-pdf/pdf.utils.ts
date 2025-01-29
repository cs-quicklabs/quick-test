import { TestCaseResultStatus } from "src/common/enums/test-case-result-status";
import { TestSuiteStatus } from "src/common/enums/test-suite-status";
import { TestSuiteEntity } from "src/service-organization/test-suite/test-suite.entity";


export const getTestResultFromHtml = (testSuite: TestSuiteEntity, testCaseResultsObject) => {
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

export const getTestCasesFromHtml = (testCasesObject) => {
    let text = "";
    let sectionCount = 1;
    for (const sectionName in testCasesObject) {
        const testCases = testCasesObject[sectionName];
        text += `<h3 class="sectionName">${sectionCount}. ${sectionName}</h3>`;
        text += `<table class="table table-bordered table-striped table-sm">
                        <thead>
                            <tr>
                                <td class="idWidth" scope="col"><b>ID</b></td>
                                <td scope="col"><b>Title</b></td>
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
}

export const getTestSuitesFromHtml = (testSuites: TestSuiteEntity[]) => {
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
        text += `<table class="table table-bordered table-striped table-sm">
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
                <h1 class="name">Test Runs</h1>
                <hr />
                <div class="table-responsive">
                    ${text}
                </div>
            </div>
        </body>
        </html>
        `;
}