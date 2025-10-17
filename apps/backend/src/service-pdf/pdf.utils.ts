import { jsPDF } from 'jspdf';
import { TestCaseResultStatus } from "src/common/enums/test-case-result-status";
import { TestSuiteStatus } from "src/common/enums/test-suite-status";
import { TestSuiteEntity } from "src/service-organization/test-suite/test-suite.entity";
import { ProjectEntity } from "src/service-organization/project/project.entity";
import { UtilsService } from "src/_helpers/utils.service";

interface TestCase {
    testcaseId: string;
    title: string;
    executionPriority: string;
}

interface TestCaseResult {
    testCaseId: string;
    testCaseTitle: string;
    status: TestCaseResultStatus;
}

const initializePDF = (): jsPDF => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'normal');
    return doc;
};

const formatTestSuiteStatus = (status: TestSuiteStatus): string => {
    if (status === TestSuiteStatus.INPROGRESS) {
        return 'In Progress';
    }
    return UtilsService.titleCase(status.toLowerCase());
};

export const generateTestResultPdf = (testSuite: TestSuiteEntity, testCaseResultsObject: Record<string, TestCaseResult[]>): Buffer => {
    const doc = initializePDF();
    let yPos = 12;

    // Title
    doc.setFontSize(18);
    doc.text(testSuite.name, 20, yPos);
    // tighter bottom margin for title
    yPos += 3;

    // Horizontal line
    doc.line(20, yPos, 190, yPos);
    // tighter spacing after the divider
    yPos += 5;

    // Created On
    const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    doc.setFontSize(12);
    doc.text(`Created On: ${month[testSuite.createdAt.getMonth()]} ${testSuite.createdAt.getDate()}, ${testSuite.createdAt.getFullYear()}`, 20, yPos);
    // tighter spacing after created on
    yPos += 5;

    // Status
    const statusText = formatTestSuiteStatus(testSuite.status);
    
    doc.text(`Status: ${statusText}`, 20, yPos);
    // tighter spacing under status line
    yPos += 5;

    // Summary table
    const { passed, failed, untested, blocked, total } = testSuite.testreport;
    const passedPercentage = Math.ceil((passed * 100) / total);
    const failedPercentage = Math.ceil((failed * 100) / total);
    const blockedPercentage = Math.ceil((blocked * 100) / total);
    const untestedPercentage = Math.ceil((untested * 100) / total);

    // Summary table headers
    doc.setFontSize(10);
    const summaryHeaders = ['Passed', 'Failed', 'Untested', 'Blocked'];
    const summaryData = [
        `${passedPercentage}% (${passed}/${total})`,
        `${failedPercentage}% (${failed}/${total})`,
        `${untestedPercentage}% (${untested}/${total})`,
        `${blockedPercentage}% (${blocked}/${total})`
    ];

    const tableWidth = 150;
    const cellWidth = tableWidth / 4;
    const tableStartX = 20;

    // Header row
    for (let i = 0; i < summaryHeaders.length; i++) {
        const x = tableStartX + (i * cellWidth);
        doc.rect(x, yPos, cellWidth, 8);
        doc.text(summaryHeaders[i], x + 2, yPos + 6);
    }
    yPos += 8;

    // Data row
    for (let i = 0; i < summaryData.length; i++) {
        const x = tableStartX + (i * cellWidth);
        doc.rect(x, yPos, cellWidth, 8);
        doc.text(summaryData[i], x + 2, yPos + 6);
    }
    yPos += 20;

    // Test case results by section
    let sectionCount = 1;
    for (const sectionName in testCaseResultsObject) {
        const testCaseResults = testCaseResultsObject[sectionName];
        
        // Check if we need a new page for section header and at least first row
        if (yPos > 240) {
            doc.addPage();
            yPos = 20;
        }

        // Section header
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`${sectionCount}. ${sectionName}`, 20, yPos);
        // tighter bottom margin for section title
        yPos += 3;

        // Table headers
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setDrawColor(128, 128, 128); // Set border color to gray
        const headers = ['ID', 'Title', 'Status'];
        const columnWidths = [15, 125, 25];
        let currentX = 20;

        for (let i = 0; i < headers.length; i++) {
            doc.rect(currentX, yPos, columnWidths[i], 6);
            if (i === 0) { // Center align ID column
                const headerTextWidth = doc.getTextWidth(headers[i]);
                const headerCenterX = currentX + (columnWidths[i] - headerTextWidth) / 2;
                doc.text(headers[i], headerCenterX, yPos + 4);
            } else {
                doc.text(headers[i], currentX + 2, yPos + 4);
            }
            currentX += columnWidths[i];
        }
        doc.setFont('helvetica', 'normal');
        yPos += 6;

        // Table data
        let rowNumber = 1; // start numbering from 1 per section
        for (const result of testCaseResults) {
            // Check if we need a new page
            if (yPos > 270) {
                doc.addPage();
                yPos = 20;
                
                // Re-add table headers on new page
                doc.setFontSize(9);
                doc.setFont('helvetica', 'bold');
                doc.setDrawColor(128, 128, 128); // Set border color to gray
                let headerX = 20;
                for (let i = 0; i < headers.length; i++) {
                    doc.rect(headerX, yPos, columnWidths[i], 6);
                    if ((headers[0] === '#' && (i === 0 || i === 2)) || (headers[0] === 'ID' && i === 0)) { // Center align # and Priority columns, or ID column
                        const headerTextWidth = doc.getTextWidth(headers[i]);
                        const headerCenterX = headerX + (columnWidths[i] - headerTextWidth) / 2;
                        doc.text(headers[i], headerCenterX, yPos + 4);
                    } else {
                        doc.text(headers[i], headerX + 2, yPos + 4);
                    }
                    headerX += columnWidths[i];
                }
                doc.setFont('helvetica', 'normal');
                yPos += 6;
            }

            currentX = 20;
            
            // Calculate row height based on title text
            const cleanTitleText = result.testCaseTitle.replace(/_/g, ' ');
            const titleLines = doc.splitTextToSize(cleanTitleText, columnWidths[1] - 4);
            const rowHeight = Math.max(6, titleLines.length * 5);
            
            // ID
            doc.rect(currentX, yPos, columnWidths[0], rowHeight);
            const resultIdText = rowNumber.toString();
            const resultIdTextWidth = doc.getTextWidth(resultIdText);
            const resultIdCenterX = currentX + (columnWidths[0] - resultIdTextWidth) / 2;
            doc.text(resultIdText, resultIdCenterX, yPos + 4);
            currentX += columnWidths[0];
            
            // Title
            doc.rect(currentX, yPos, columnWidths[1], rowHeight);
            doc.text(titleLines, currentX + 2, yPos + 4);
            currentX += columnWidths[1];
            
            // Status (color-coded similar to Tailwind 700 shades)
            doc.rect(currentX, yPos, columnWidths[2], rowHeight);
            // map enum/string to rgb for four statuses only
            const toLower = String(result.status).toLowerCase();
            if (toLower === 'passed') {
                // text-green-700 #15803d
                doc.setTextColor(21, 128, 61);
            } else if (toLower === 'failed') {
                // text-red-700 #b91c1c
                doc.setTextColor(185, 28, 28);
            } else if (toLower === 'blocked') {
                // text-yellow-700 #a16207
                doc.setTextColor(161, 98, 7);
            } else if (toLower === 'untested') {
                // text-gray-700 #374151 for visibility
                doc.setTextColor(55, 65, 81);
            }
            doc.text(result.status, currentX + 2, yPos + 4);
            // reset to black for subsequent cells
            doc.setTextColor(0, 0, 0);
            
            yPos += rowHeight;
            rowNumber++;
        }
        
        yPos += 7;
        sectionCount++;
    }

    return Buffer.from(doc.output('arraybuffer'));
};

export const generateTestCasesPdf = (testCasesObject: Record<string, TestCase[]>, project: ProjectEntity): Buffer => {
    const doc = initializePDF();
    let yPos = 12;
    let testCasesCount = 0;

    const testCaseName = project?.name ?? 'Test Cases';

    // Title
    doc.setFontSize(18);
    const titleWidth = doc.getTextWidth(testCaseName);
    doc.text(testCaseName, 20, yPos);
    
    // Count total test cases
    for (const sectionName in testCasesObject) {
        testCasesCount += testCasesObject[sectionName].length;
    }
    
    // Add test case count on same line, but ensure no overlap
    doc.setFontSize(10);
    doc.text(`( ${testCasesCount} test cases )`, 25 + titleWidth, yPos);
    yPos += 3;

    // Horizontal line
    doc.line(20, yPos, 190, yPos);
    yPos += 8;

    let sectionCount = 1;
    for (const sectionName in testCasesObject) {
        const testCases = testCasesObject[sectionName];
        
        // Check if we need a new page for section header and at least first row
        if (yPos > 240) {
            doc.addPage();
            yPos = 20;
        }

        // Section header
        doc.setFontSize(12);
        doc.text(`${sectionCount}. ${sectionName}`, 20, yPos);
        yPos +=2;

        // Table headers
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setDrawColor(128, 128, 128); // Set border color to gray
        const headers = ['#', 'Title', 'Priority'];
        const columnWidths = [15, 135, 25];
        let currentX = 20;

        for (let i = 0; i < headers.length; i++) {
            doc.rect(currentX, yPos, columnWidths[i], 6);
            if (i === 0 || i === 2) { // Center align # and Priority columns
                const headerTextWidth = doc.getTextWidth(headers[i]);
                const headerCenterX = currentX + (columnWidths[i] - headerTextWidth) / 2;
                doc.text(headers[i], headerCenterX, yPos + 4);
            } else {
                doc.text(headers[i], currentX + 2, yPos + 4);
            }
            currentX += columnWidths[i];
        }
        doc.setFont('helvetica', 'normal');
        yPos += 6;

        // Table data
        for (const testCase of testCases) {
            // Check if we need a new page
            if (yPos > 270) {
                doc.addPage();
                yPos = 20;
                
                // Re-add table headers on new page
                doc.setFontSize(9);
                doc.setFont('helvetica', 'bold');
                doc.setDrawColor(128, 128, 128); // Set border color to gray
                let headerX = 20;
                for (let i = 0; i < headers.length; i++) {
                    doc.rect(headerX, yPos, columnWidths[i], 6);
                    if ((headers[0] === '#' && (i === 0 || i === 2)) || (headers[0] === 'ID' && i === 0)) { // Center align # and Priority columns, or ID column
                        const headerTextWidth = doc.getTextWidth(headers[i]);
                        const headerCenterX = headerX + (columnWidths[i] - headerTextWidth) / 2;
                        doc.text(headers[i], headerCenterX, yPos + 4);
                    } else {
                        doc.text(headers[i], headerX + 2, yPos + 4);
                    }
                    headerX += columnWidths[i];
                }
                doc.setFont('helvetica', 'normal');
                yPos += 6;
            }

            currentX = 20;
            
            // Calculate row height based on title text
            const cleanTitleText = testCase.title.replace(/_/g, ' ');
            const titleLines = doc.splitTextToSize(cleanTitleText, columnWidths[1] - 4);
            const rowHeight = Math.max(6, titleLines.length * 5);
            
            // ID
            doc.rect(currentX, yPos, columnWidths[0], rowHeight);
            const idText = testCase.testcaseId.toString();
            const idTextWidth = doc.getTextWidth(idText);
            const idCenterX = currentX + (columnWidths[0] - idTextWidth) / 2;
            doc.text(idText, idCenterX, yPos + 4);
            currentX += columnWidths[0];
            
            // Title
            doc.rect(currentX, yPos, columnWidths[1], rowHeight);
            doc.text(titleLines, currentX + 2, yPos + 4);
            currentX += columnWidths[1];
            
            // Priority
            doc.rect(currentX, yPos, columnWidths[2], rowHeight);
            const priorityText = testCase.executionPriority.toString();
            const priorityTextWidth = doc.getTextWidth(priorityText);
            const priorityCenterX = currentX + (columnWidths[2] - priorityTextWidth) / 2;
            doc.text(priorityText, priorityCenterX, yPos + 4);
            
            yPos += rowHeight;
        }
        
        yPos += 7;
        sectionCount++;
    }

    return Buffer.from(doc.output('arraybuffer'));
};

export const generateTestSuitesPdf = (testSuites: TestSuiteEntity[]): Buffer => {
    const doc = initializePDF();
    let yPos = 20;

    // Title
    doc.setFontSize(18);
    doc.text('Test Runs', 20, yPos);
    yPos += 10;

    // Horizontal line
    doc.line(20, yPos, 190, yPos);
    yPos += 6;

    for (let i = 0; i < testSuites.length; i++) {
        const testSuite = testSuites[i];
        
        // Check if we need a new page
        if (yPos > 240) {
            doc.addPage();
            yPos = 20;
        }

        // Test suite name
        doc.setFontSize(12);
        doc.text(`${i + 1}. ${testSuite.name}`, 20, yPos);
        yPos += 6;

        // Table headers
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setDrawColor(128, 128, 128); // Set border color to gray
        const headers = ['Passed', 'Failed', 'Untested', 'Total', 'Status'];
        const columnWidths = [30, 30, 30, 30, 30];
        let currentX = 20;

        for (let j = 0; j < headers.length; j++) {
            doc.rect(currentX, yPos, columnWidths[j], 8);
            doc.text(headers[j], currentX + 2, yPos + 6);
            currentX += columnWidths[j];
        }
        doc.setFont('helvetica', 'normal');
        yPos += 6;

        // Data row
        currentX = 20;
        const { passed, failed, untested, total } = testSuite.testreport;
        
        // Format status
        const status = formatTestSuiteStatus(testSuite.status);

        const data = [passed.toString(), failed.toString(), untested.toString(), total.toString(), status];
        
        for (let j = 0; j < data.length; j++) {
            doc.rect(currentX, yPos, columnWidths[j], 8);
            doc.text(data[j], currentX + 2, yPos + 6);
            currentX += columnWidths[j];
        }
        
        yPos += 7;
    }

    return Buffer.from(doc.output('arraybuffer'));
};