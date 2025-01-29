import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from "@nestjs/common";
import { FindOptionsWhere, Repository } from "typeorm";
import { ModuleRef } from "@nestjs/core";
import { InjectRepository } from "@nestjs/typeorm";
import { UtilsService } from "../../_helpers/utils.service";
import { PageMetaDto } from "../../common/dto/PageMetaDto";
import { UserEntity } from "../../service-users/user/user.entity";
import { ValidatorService } from "../../shared/services/validator.service";
import { TestCaseService } from "../test-case/test-case.service";
import { TestSuiteEntity } from "./test-suite.entity";
import { CreateTestSuiteDto } from "./dto/CreateTestSuiteDto";
import { TestSuitesPageDto } from "./dto/TestSuitesPageDto";
import { TestCaseResultService } from "./test-case-result/test-case-result.service";
import { TestcasesResultsPageDto } from "./test-case-result/dto/TestCasesResultsPageDto";
import { TestCaseResultStatus } from "../../common/enums/test-case-result-status";
import { TestSuiteStatus } from "../../common/enums/test-suite-status";
import { TestSuitePageOptionsDto } from "./dto/TestSuitePageOptionDto";
import { TestCaseResultPageOptionsDto } from "./test-case-result/dto/TestCaseResultPageOptionDto";
import { CreateTestSuiteReportDto } from "./test-report/dto/CreateTestSuiteReportDto";
import { EditTestSuiteDto } from "./dto/EditTestSuiteDto";
import { TestSuiteListDto } from "./dto/TestSuiteListDto";
import { TestSuiteDto } from "./dto/TestSuiteDto";
import { SectionService } from "../test-case/section/section.service";
import { TestSuiteTodoListDto } from "./dto/TestSuiteTodoListDto";
import { UserAssignedTestCasesDto } from "../../service-users/user/dto/UserAssignedTestCasesDto";
import { MilestoneService } from "../milestone/milestone.service";
import { ActivityService } from "../project/activity/activity.service";
import { ActivityPageOptionsDto } from "../project/activity/dto/ActivityPageOptionsDto";
import { Order } from "../../common/enums/order";
import { TestSuiteDetailDto } from "./dto/TestSuiteDetailDto";
import { CreateFilteredTestSuiteDto } from "./dto/CreateFilteredTestSuiteDto";
import { ProjectEntity } from "../project/project.entity";
import { PdfService } from "../../service-pdf/pdf.service";
import { AwsS3Service } from "../../shared/services/aws-s3.service";
import { TestCaseResultEntity } from "./test-case-result/test-case-result.entity";
import { AppConfigService } from "../../shared/services/app.config.service";
import { TestCaseEntity } from "../test-case/test-case.entity";
import { UserReadService } from "../../service-users/user/services/read.service";
import { ProjectReadService } from "../project/services/read.service";
import { TestSuiteReportEntity } from "./test-report/test-suite-report.entity";
import Constants from "../../common/constants/Constants";

@Injectable()
export class TestSuiteService {
  public projectReadService: ProjectReadService;

  public testCaseResultService: TestCaseResultService;

  public testCaseService: TestCaseService;

  public sectionService: SectionService;

  public userReadService: UserReadService;

  public milestoneService: MilestoneService;

  public activityService: ActivityService;

  constructor(
    @InjectRepository(TestCaseResultEntity)
    public readonly testCaseResultRepository: Repository<TestCaseResultEntity>,
    @InjectRepository(TestSuiteReportEntity)
    public readonly testSuiteReportRepository: Repository<TestSuiteReportEntity>,
    @InjectRepository(TestSuiteEntity)
    public readonly testSuiteRepository: Repository<TestSuiteEntity>,
    @InjectRepository(TestCaseEntity)
    public readonly testCaseRepository: Repository<TestCaseEntity>,
    public readonly validatorService: ValidatorService,
    public readonly pdfService: PdfService,
    public readonly awsS3Service: AwsS3Service,
    public readonly appConfigService: AppConfigService,
    public readonly moduleRef: ModuleRef,
  ) {}

  onModuleInit(): void {
    this.projectReadService = this.moduleRef.get(ProjectReadService, {
      strict: false,
    });
    this.testCaseResultService = this.moduleRef.get(TestCaseResultService, {
      strict: false,
    });
    this.testCaseService = this.moduleRef.get(TestCaseService, {
      strict: false,
    });
    this.sectionService = this.moduleRef.get(SectionService, {
      strict: false,
    });
    this.userReadService = this.moduleRef.get(UserReadService, {
      strict: false,
    });
    this.milestoneService = this.moduleRef.get(MilestoneService, {
      strict: false,
    });
    this.activityService = this.moduleRef.get(ActivityService, {
      strict: false,
    });
  }

  /**
   * Find single testCase
   */
  findOne(
    findData: FindOptionsWhere<TestSuiteEntity>,
  ): Promise<TestSuiteEntity> {
    return this.testSuiteRepository.findOneBy(findData);
  }

  /**
   * Create Test Suite
   */
  async createTestSuite(
    createTestSuiteDto: CreateTestSuiteDto,
    project: ProjectEntity,
    user: UserEntity,
  ): Promise<TestSuiteEntity> {
    if (!project) throw new NotFoundException("translations.RECORD_NOT_FOUND");
    createTestSuiteDto.name = UtilsService.titleCase(createTestSuiteDto.name);
    const testSuite = this.testSuiteRepository.create(createTestSuiteDto);
    const testCases = await this.testCaseService.getTestCasesSortedBySection(
      project.id,
    );
    const testCaseSize = testCases.length;
    if (!testCaseSize)
      throw new NotFoundException("translations.RECORD_NOT_FOUND");
    let ind = -1;
    for (let i = 0; i < testCaseSize; i++) {
      if (testCases[i].section?.name === "Unassigned") ind = i;
      else break;
    }
    const testCasesSorted: TestCaseEntity[] = testCases.slice(
      ind + 1,
      testCases.length,
    );
    testCasesSorted.push(...testCases.slice(0, ind + 1));

    testSuite.project = project;
    testSuite.user = user;
    if (createTestSuiteDto.assignTo) {
      await this.assignUserTestSuite(
        testSuite,
        createTestSuiteDto.assignTo,
        user.organization.id,
      );
    }
    if (createTestSuiteDto.milestone) {
      await this.milestoneInTestSuite(testSuite, createTestSuiteDto.milestone);
    }
    const testSuiteData = await this.testSuiteRepository.save(testSuite);
    await this.postCreateTestSuiteHandle(
      testSuiteData,
      project,
      user,
      testCaseSize,
      testCasesSorted,
    );
    return testSuiteData;
  }

  /**
   * Internal method to handle post test suite
   * creation tasks
   */
  async postCreateTestSuiteHandle(
    testSuiteData: TestSuiteEntity,
    project: ProjectEntity,
    user: UserEntity,
    testCaseSize: number,
    testCasesSorted: TestCaseEntity[],
  ) {
    await this.activityService.createTestSuiteActivity(
      "Created",
      testSuiteData,
      project,
      user,
    );
    await this.createTestSuiteReport(
      {
        passed: 0,
        failed: 0,
        blocked: 0,
        retest: 0,
        untested: testCaseSize,
        total: testCaseSize,
      },
      testSuiteData,
    );
    for (let i = 0; i < testCaseSize; i++) {
      await this.testCaseResultService.createTestCaseResult(
        { status: TestCaseResultStatus.UNTESTED, comment: null, image: null },
        testSuiteData,
        testCasesSorted[i],
      );
    }
  }

  /**
   * Internal method to create Test Suite with filtered
   *  sections and test cases
   */
  async createFilteredTestSuite(
    createFilteredTestSuiteDto: CreateFilteredTestSuiteDto,
    project: ProjectEntity,
    currentLoggedInUser: UserEntity,
  ): Promise<TestSuiteEntity> {
    createFilteredTestSuiteDto.name = UtilsService.titleCase(
      createFilteredTestSuiteDto.name,
    );
    const testSuite = this.testSuiteRepository.create(
      createFilteredTestSuiteDto,
    );
    const testCases = await this.testCaseService.getTestCasesByIds(
      project,
      createFilteredTestSuiteDto.testCaseIds,
    );
    testSuite.project = project;
    testSuite.user = currentLoggedInUser;
    if (createFilteredTestSuiteDto.assignTo) {
      await this.assignUserTestSuite(
        testSuite,
        createFilteredTestSuiteDto.assignTo,
        currentLoggedInUser.organization.id,
      );
    }
    if (createFilteredTestSuiteDto.milestone) {
      await this.milestoneInTestSuite(
        testSuite,
        createFilteredTestSuiteDto.milestone,
      );
    }
    const testSuiteData = await this.testSuiteRepository.save(testSuite);

    await this.postCreateTestSuiteHandle(
      testSuiteData,
      project,
      currentLoggedInUser,
      testCases.length,
      testCases,
    );
    return testSuiteData;
  }

  /**
   * Internal method to find the assigned user for test suites
   */
  async assignUserTestSuite(
    testSuite: TestSuiteEntity,
    userId: string,
    organizationId: string,
  ): Promise<boolean> {
    const assignedUser = await this.userReadService.findUserById(
      userId,
      "organization",
    );
    if (!assignedUser)
      throw new NotFoundException("translations.RECORD_NOT_FOUND");
    if (assignedUser.organization.id !== organizationId) {
      throw new BadRequestException("translations.ACCESS_DENIED");
    }
    testSuite.assigned_to = assignedUser.id;
    testSuite.assignedTo = assignedUser;
    return true;
  }

  /**
   * Internal method to find the assigned user for test suites
   */
  async milestoneInTestSuite(
    testSuite: TestSuiteEntity,
    milestoneId: string,
  ): Promise<boolean> {
    const milestone = await this.milestoneService.findMilestoneById(
      milestoneId,
      "project",
    );
    if (!milestone)
      throw new NotFoundException("translations.RECORD_NOT_FOUND");
    testSuite.milestone_id = milestone.id;
    testSuite.milestoneId = milestone;
    return true;
  }

  /**
   * Create Test Suite Report
   */

  async createTestSuiteReport(
    createTestSuiteReportDto: CreateTestSuiteReportDto,
    testSuite: TestSuiteEntity,
  ): Promise<boolean> {
    const testSuiteReport = await this.testSuiteReportRepository.create(
      createTestSuiteReportDto,
    );
    testSuiteReport.testsuite = testSuite;
    await this.testSuiteReportRepository.save(testSuiteReport);
    return true;
  }

  /**
   * Edit Test Suite Report
   */

  async editTestSuiteReport(
    testSuiteId: string,
    user: UserEntity,
  ): Promise<boolean> {
    const testSuiteReport = await this.testSuiteReportRepository
      .createQueryBuilder("testSuiteReport")
      .leftJoinAndSelect("testSuiteReport.testsuite", "testsuite")
      .where("testSuiteReport.test_suite_id = :testSuiteId", {
        testSuiteId,
      })
      .getOne();
    if (!testSuiteReport)
      throw new NotFoundException("translations.RECORD_NOT_FOUND");
    let testSuite: any = null;
    testSuite = await this.getTestSuiteResultCounts(testSuiteId);

    if (testSuiteReport && testSuite) {
      testSuiteReport.passed = testSuite.passedCount;
      testSuiteReport.failed = testSuite.failedCount;
      testSuiteReport.blocked = testSuite.blockedCount;
      testSuiteReport.retest = testSuite.retestCount;
      testSuiteReport.untested = testSuite.untestedCount;
    }

    const updateReport =
      await this.testSuiteReportRepository.save(testSuiteReport);
    let suiteStatus: TestSuiteStatus = TestSuiteStatus.PENDING;
    let completedAt;
    if (
      updateReport.untested < updateReport.total &&
      updateReport.untested !== 0
    ) {
      suiteStatus = TestSuiteStatus.INPROGRESS;
    } else if (updateReport.untested === 0) {
      suiteStatus = TestSuiteStatus.COMPLETED;
      completedAt = new Date();

      const testSuite = await this.testSuiteRepository
        .createQueryBuilder("testsuite")
        .leftJoinAndSelect("testsuite.project", "project")
        .where("testsuite.id = :testSuiteId", { testSuiteId })
        .getOne();
      await this.activityService.createTestSuiteActivity(
        "Completed",
        testSuite,
        testSuite?.project,
        user,
      );
    }
    await this.testSuiteRepository
      .createQueryBuilder()
      .update(TestSuiteEntity)
      .set({ status: suiteStatus, completedAt })
      .where("id = :id", { id: testSuiteId })
      .execute();
    return true;
  }

  async getTestSuiteResultCounts(testSuiteId: string) {
    const testSuite = await this.testSuiteRepository
      .createQueryBuilder("testsuite")
      .where("testsuite.id = :testSuiteId", { testSuiteId })
      .loadRelationCountAndMap(
        "testsuite.passedCount",
        "testsuite.testresults",
        "testresults",
        (qb) => qb.where("testresults.status = :status", { status: "PASSED" }),
      )
      .loadRelationCountAndMap(
        "testsuite.failedCount",
        "testsuite.testresults",
        "testresults",
        (qb) => qb.where("testresults.status = :status", { status: "FAILED" }),
      )
      .loadRelationCountAndMap(
        "testsuite.blockedCount",
        "testsuite.testresults",
        "testresults",
        (qb) => qb.where("testresults.status = :status", { status: "BLOCKED" }),
      )
      .loadRelationCountAndMap(
        "testsuite.retestCount",
        "testsuite.testresults",
        "testresults",
        (qb) => qb.where("testresults.status = :status", { status: "RETEST" }),
      )
      .loadRelationCountAndMap(
        "testsuite.untestedCount",
        "testsuite.testresults",
        "testresults",
        (qb) =>
          qb.where("testresults.status = :status", { status: "UNTESTED" }),
      )
      .getOne();
    return testSuite;
  }

  /**
   * Edit Test Suite
   */

  async editTestSuite(
    editTestSuiteDto: EditTestSuiteDto,
    testSuiteId: string,
    user: UserEntity,
    testSuiteDeleted: boolean = false,
  ): Promise<TestSuiteEntity> {
    const testSuite = await this.testSuiteRepository
      .createQueryBuilder("testsuite")
      .withDeleted()
      .leftJoinAndSelect("testsuite.user", "user")
      .withDeleted()
      .leftJoinAndSelect("testsuite.assignedTo", "assignedTo")
      .where("testsuite.id = :testSuiteId", { testSuiteId })
      .getOne();
    if (!testSuite)
      throw new NotFoundException("translations.RECORD_NOT_FOUND");
    if (editTestSuiteDto?.name)
      testSuite.name = UtilsService.titleCase(editTestSuiteDto.name);
    if (editTestSuiteDto?.description)
      testSuite.description = editTestSuiteDto.description;
    if (editTestSuiteDto?.status) testSuite.status = editTestSuiteDto.status;

    if (
      editTestSuiteDto?.assignTo &&
      testSuite.assignedTo.id !== editTestSuiteDto?.assignTo
    ) {
      await this.assignUserTestSuite(
        testSuite,
        editTestSuiteDto.assignTo,
        user.organization.id,
      );
    }
    if (editTestSuiteDto?.milestone) {
      await this.milestoneInTestSuite(testSuite, editTestSuiteDto.milestone);
    }
    if (testSuiteDeleted && testSuite.user.id !== user.archivedByUser.id) {
      testSuite.user = user.archivedByUser;
    }
    const testSuiteData = await this.testSuiteRepository.save(testSuite);
    return testSuiteData;
  }

  /**
   * Find all testSuite
   */

  async getTestSuites(
    pageOptionsDto: TestSuitePageOptionsDto,
    projectId: string,
  ): Promise<TestSuitesPageDto> {
    const [testSuites, testSuitesCount] = await this.testSuiteRepository
      .createQueryBuilder("testSuite")
      .where("testSuite.deleted_at IS NULL")
      .leftJoinAndSelect("testSuite.testreport", "testreport")
      .leftJoinAndSelect("testSuite.assignedTo", "assignedTo")
      .leftJoinAndSelect("testSuite.user", "user")
      .where("testSuite.project_id = :projectId", {
        projectId,
      })
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.take)
      .orderBy("testSuite.createdAt", pageOptionsDto.order)
      .getManyAndCount();

    const pageMetaDto = new PageMetaDto({
      pageOptionsDto,
      itemCount: testSuitesCount,
    });
    const testSuiteList = [];
    if (testSuites !== undefined) {
      testSuites.forEach((testsuite) => {
        const data = new TestSuiteListDto(testsuite);
        const { testreport, assignedTo, user, ...rest } = data;
        const result = {
          ...rest,
          testreport: { ...testreport },
          assignedTo: { ...assignedTo?.toDto() },
          user: { ...user?.toDto() },
        };
        testSuiteList.push(result);
      });
    }

    return new TestSuitesPageDto(testSuiteList, pageMetaDto);
  }

  /**
   * Find all testSuite
   */

  async getActivityTestSuites(
    pageOptionsDto: ActivityPageOptionsDto,
    projectId: string,
  ): Promise<any> {
    const date = UtilsService.getPastDate(pageOptionsDto.days);
    const testSuites = await this.testSuiteRepository
      .createQueryBuilder("testSuite")
      .withDeleted()
      .leftJoinAndSelect("testSuite.assignedTo", "assignedTo")
      .leftJoinAndSelect("testSuite.user", "user")
      .where("testSuite.project_id = :projectId", {
        projectId,
      })
      .andWhere("testSuite.createdAt >= :date", {
        date,
      })
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.take)
      .orderBy("testSuite.createdAt", pageOptionsDto.order)
      .getMany();

    const testSuiteList: TestSuiteListDto[] = [];
    testSuites.forEach((testsuite) => {
      testSuiteList.push(new TestSuiteListDto(testsuite));
    });

    return testSuiteList;
  }

  /**
   * Find all Test Result
   */

  async getTestResults(
    pageOptionsDto: TestCaseResultPageOptionsDto,
    testSuiteId: string,
  ): Promise<TestcasesResultsPageDto> {
    const testSuite = await this.testSuiteRepository
      .createQueryBuilder("testsuite")
      .where("testsuite.id = :testSuiteId", { testSuiteId })
      .getOne();
    if (!testSuite)
      throw new NotFoundException("translations.RECORD_NOT_FOUND");
    const queryBuilder = this.testCaseResultRepository
      .createQueryBuilder("test_case_results")
      .leftJoinAndSelect("test_case_results.defect", "defect")
      .where("test_case_results.test_suite_id = :testSuiteId", {
        testSuiteId,
      });
    const [testResults, testSuitesCount] = await queryBuilder
      .orderBy("test_case_results.createdAt", pageOptionsDto.order)
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.take)
      .getManyAndCount();

    const pageMetaDto = new PageMetaDto({
      pageOptionsDto,
      itemCount: testSuitesCount,
    });
    return new TestcasesResultsPageDto(testResults.toDtos(), pageMetaDto);
  }

  /**
   * Find single Test Suite
   */

  async getTestSuiteDetail(testSuiteId: string): Promise<TestSuiteDto> {
    const testSuite = await this.testSuiteRepository
      .createQueryBuilder("testsuite")
      .withDeleted()
      .leftJoinAndSelect("testsuite.user", "user")
      .withDeleted()
      .leftJoinAndSelect("testsuite.assignedTo", "assignedTo")
      .leftJoinAndSelect("testsuite.milestoneId", "milestoneId")
      .where("testsuite.id = :testSuiteId", { testSuiteId })
      .getOne();
    if (!testSuite)
      throw new NotFoundException("translations.RECORD_NOT_FOUND");
    return testSuite.toDto();
  }

  /**
   * Delete Test Suite
   */

  async deleteTestSuite(testSuiteId: string): Promise<boolean> {
    const testSuite = await this.testSuiteRepository.findOne({
      relations: ["testresults"],
      where: {
        id: testSuiteId,
      },
    });
    if (!testSuite)
      throw new NotFoundException("translations.RECORD_NOT_FOUND");
    const testSuitesActivites =
      await this.activityService.getTestSuitesActivitiesByTestSuitesId(
        testSuite.id,
      );
    await this.activityService.deleteActivites(testSuitesActivites);
    await this.testSuiteRepository.remove(testSuite);
    return true;
  }

  /**
   * Internal method to get all test runs with assigned users for a project
   */
  async getTodoList(projectId: string): Promise<TestSuiteTodoListDto> {
    const testSuites = await this.testSuiteRepository
      .createQueryBuilder("testsuite")
      .innerJoin("testsuite.project", "project", "project.id = :projectId", {
        projectId,
      })
      .leftJoinAndSelect("testsuite.assignedTo", "assignedTo")
      .leftJoinAndSelect("testsuite.testreport", "testreport")
      .where("testsuite.assignedTo is NOT NULL")
      .orderBy("testsuite.createdAt")
      .getMany();

    const users: UserAssignedTestCasesDto[] =
      this.addTestCasesToAssignedUsers(testSuites);

    const testSuiteList = [];
    testSuites.forEach((testSuite) => {
      const data = new TestSuiteListDto(testSuite);
      const { assignedTo, testreport, ...rest } = data;
      const result = {
        ...rest,
        assignedTo: { ...assignedTo?.toDto() },
        testreport: { ...testreport },
      };
      testSuiteList.push(result);
    });

    return new TestSuiteTodoListDto(users, testSuiteList);
  }

  /**
   * Internal method to add active and completed test cases
   * for test suites assigned to users
   */
  addTestCasesToAssignedUsers(
    testSuites: TestSuiteEntity[],
  ): UserAssignedTestCasesDto[] {
    try {
      const userAssignedTestCasesDto: any = {};
      testSuites.forEach((testSuite) => {
        if (testSuite.assignedTo) {
          const userId = testSuite.assigned_to;
          const testSuiteActiveTestCases = testSuite.testreport.untested;
          const testSuiteCompletedTestCases =
            testSuite.testreport.total - testSuite.testreport.untested;

          if (!userAssignedTestCasesDto[userId]) {
            userAssignedTestCasesDto[userId] = testSuite.assignedTo?.toDto();
            userAssignedTestCasesDto[userId].totalActiveTestCases = 0;
            userAssignedTestCasesDto[userId].totalCompletedTestCases = 0;
          }
          userAssignedTestCasesDto[userId].totalActiveTestCases +=
            testSuiteActiveTestCases;
          userAssignedTestCasesDto[userId].totalCompletedTestCases +=
            testSuiteCompletedTestCases;
        }
      });

      return Object.values(userAssignedTestCasesDto);
    } catch (error) {
      return error;
    }
  }

  /**
   * Internal method to search test suites
   */
  async searchTestSuites(
    name: string,
    currentLoggedInUser: UserEntity,
  ): Promise<TestSuiteDetailDto[]> {
    name = UtilsService.lowerCase(name);
    const projects = await this.projectReadService.findProjectsByOrganizationId(
      currentLoggedInUser.organization.id,
    );

    const projectIds = projects.map((project) => project.id);

    const testSuites = await this.testSuiteRepository
      .createQueryBuilder("testsuite")
      .innerJoinAndSelect(
        "testsuite.project",
        "project",
        "project.id IN (:...projectIds)",
        {
          projectIds,
        },
      )
      .where("LOWER(testsuite.name) like :name", {
        name: `%${name}%`,
      })
      .orderBy("testsuite.createdAt", Order.DESC)
      .getMany();

    const testSuitesDetails = testSuites.map(
      (testSuite) => new TestSuiteDetailDto(testSuite),
    );
    return testSuitesDetails;
  }

  /**
   * Internal method to get test suite
   */
  async getTestSuite(testSuiteId: string): Promise<TestSuiteDetailDto> {
    const testSuite = await this.testSuiteRepository
      .createQueryBuilder("testsuite")
      .innerJoinAndSelect("testsuite.project", "project")
      .where("testsuite.id = :testSuiteId", {
        testSuiteId,
      })
      .getOne();
    if (!testSuite) {
      return null;
    }
    return new TestSuiteDetailDto(testSuite);
  }

  /**
   * Internal method to add test suites pdf
   */
  async addTestSuitesPdf(
    project: ProjectEntity,
    testSuiteIds: string[],
  ): Promise<string> {
    let testSuites: TestSuiteEntity[];
    if (testSuiteIds.length === 0) {
      testSuites = await this.testSuiteRepository
        .createQueryBuilder("testsuite")
        .leftJoinAndSelect("testsuite.project", "project")
        .leftJoinAndSelect("testsuite.testreport", "testreport")
        .where("project.id = :id", {
          id: project.id,
        })
        .getMany();
    } else {
      testSuites = await this.testSuiteRepository
        .createQueryBuilder("testsuite")
        .innerJoinAndSelect(
          "testsuite.project",
          "project",
          "project.id = :id",
          {
            id: project.id,
          },
        )
        .leftJoinAndSelect("testsuite.testreport", "testreport")
        .where("testsuite.id IN (:...testSuiteIds)", {
          testSuiteIds,
        })
        .getMany();
      if (testSuites.length === 0)
        throw new NotFoundException("translations.RECORD_NOT_FOUND");
    }
    const key = await this.pdfService.generateTestSuitesPdf(
      project,
      testSuites,
    );
    if (!key)
      throw new InternalServerErrorException("translatios.INTERNAL_SERVER");

    const pdfLink = await this.awsS3Service.generateSignedUrl(
      key,
      Constants.AWS_S3_SIGNED_URL_TESTCASE_EXPIRES,
    );
    if (!pdfLink)
      throw new InternalServerErrorException("translatios.INTERNAL_SERVER");
    return pdfLink;
  }

  /**
   * Internal method to add test suite result pdf
   */
  async addTestSuiteResultPdf(
    project: ProjectEntity,
    testSuiteId: string,
  ): Promise<string> {
    const testSuite = await this.testSuiteRepository
      .createQueryBuilder("testsuite")
      .innerJoinAndSelect("testsuite.project", "project", "project.id = :id", {
        id: project.id,
      })
      .leftJoinAndSelect("testsuite.testreport", "testreport")
      .leftJoinAndSelect("testsuite.testresults", "testresults")
      .where("testsuite.id = :testSuiteId", {
        testSuiteId,
      })
      .getOne();
    if (!testSuite)
      throw new NotFoundException("translations.RECORD_NOT_FOUND");
    const testCaseResultsObject = this.groupTestCaseResultBySection(
      testSuite.testresults,
    );
    const key = await this.pdfService.generateTestSuiteResultPdf(
      project,
      testSuite,
      testCaseResultsObject,
    );
    if (!key)
      throw new InternalServerErrorException("translatios.INTERNAL_SERVER");
    const pdfLink = await this.awsS3Service.generateSignedUrl(
      key,
      Constants.AWS_S3_SIGNED_URL_TESTCASE_EXPIRES,
    );
    if (!pdfLink)
      throw new InternalServerErrorException("translatios.INTERNAL_SERVER");
    return pdfLink;
  }

  /**
   * Internal method to group test case result section wise
   */
  groupTestCaseResultBySection(testCaseResults: TestCaseResultEntity[]) {
    const testCaseResultsObject: any = {};
    const testCaseResultsSize = testCaseResults.length;
    for (let i = 0; i < testCaseResultsSize; i++) {
      const section = testCaseResults[i].sectionName;
      if (!testCaseResultsObject[section]) {
        testCaseResultsObject[section] = [];
      }
      testCaseResultsObject[section].push(testCaseResults[i]);
    }
    return testCaseResultsObject;
  }

  async getAssignedTestCaseSuitesByMemberId(memberId: string): Promise<any> {
    const testSuites = await this.testSuiteRepository
      .createQueryBuilder("test_suites")
      .leftJoinAndSelect("test_suites.assignedTo", "assignTo")
      .where("test_suites.assignedTo =:memberId", { memberId })
      .getMany();
    return testSuites;
  }

  async getCreatedTestCaseSuitesByMemberId(memberId: string): Promise<any> {
    const testSuites = await this.testSuiteRepository
      .createQueryBuilder("test_suites")
      .leftJoinAndSelect("test_suites.user", "user")
      .where("test_suites.user_id =:memberId", { memberId })
      .getMany();
    return testSuites;
  }
}
