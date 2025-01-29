import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
  InternalServerErrorException,
} from "@nestjs/common";
import { FindOptionsWhere, Repository } from "typeorm";
import { ModuleRef } from "@nestjs/core";
import { InjectRepository } from "@nestjs/typeorm";
import { PageMetaDto } from "../../common/dto/PageMetaDto";
import { AwsS3Service } from "../../shared/services/aws-s3.service";
import { AppConfigService } from "../../shared/services/app.config.service";
import { ValidatorService } from "../../shared/services/validator.service";
import { TestCaseEntity } from "./test-case.entity";
import { CreateTestCaseDto } from "./dto/CreateTestCaseDto";
import { EditTestCaseDto } from "./dto/EditTestCaseDto";
import { TestCaseDto } from "./dto/TestCaseDto";
import { TestCaseDetailsDto } from "./dto/TestCaseDetailsDto";
import { UserEntity } from "../../service-users/user/user.entity";
import { TestSuiteService } from "../test-suite/test-suite.service";
import { UtilsService } from "../../_helpers/utils.service";
import { SectionService } from "./section/section.service";
import { TestCasesPageDto } from "./dto/TestCasesPageDto";
import { TestCasesPageOptionsDto } from "./dto/TestCasesPageOptionsDto";
import { TestCaseFilterDto } from "./dto/TestCaseFilterDto";
import { Order } from "../../common/enums/order";
import { PdfService } from "../../service-pdf/pdf.service";
import { ProjectEntity } from "../project/project.entity";
import { SectionEntity } from "./section/section.entity";
import { DefectEntity } from "../defect/defect.entity";
import { ProjectReadService } from "../project/services/read.service";
import Constants from "../../common/constants/Constants";

@Injectable()
export class TestCaseService {
  public projectReadService: ProjectReadService;

  public testSuiteService: TestSuiteService;

  public sectionService: SectionService;

  constructor(
    @InjectRepository(TestCaseEntity)
    private readonly testCaseRepository: Repository<TestCaseEntity>,
    public readonly validatorService: ValidatorService,
    public readonly awsS3Service: AwsS3Service,
    public readonly pdfService: PdfService,
    public readonly appConfigService: AppConfigService,
    public readonly moduleRef: ModuleRef,
  ) {}

  onModuleInit(): void {
    this.projectReadService = this.moduleRef.get(ProjectReadService, {
      strict: false,
    });
    this.testSuiteService = this.moduleRef.get(TestSuiteService, {
      strict: false,
    });
    this.sectionService = this.moduleRef.get(SectionService, {
      strict: false,
    });
  }

  /**
   * Find single testCase
   */

  findOne(findData: FindOptionsWhere<TestCaseEntity>): Promise<TestCaseEntity> {
    return this.testCaseRepository.findOne({
      relations: ["section", "project", "defect"],
      where: findData,
    });
  }

  async findByTestCaseByIdOrName(
    options: Partial<{ testCaseTitle: string; id: string }>,
  ): Promise<TestCaseEntity | undefined> {
    const queryBuilder = this.testCaseRepository.createQueryBuilder("testCase");

    if (options.id) {
      queryBuilder.orWhere("testCase.id = :id", {
        id: options.id,
      });
    }
    if (options.testCaseTitle) {
      queryBuilder.orWhere("testCase.testCaseTitle = :testCaseTitle", {
        title: options.testCaseTitle,
      });
    }

    return queryBuilder.getOne();
  }

  /**
   * Create Test Case
   */

  async createTestCase(
    createTestCaseDto: CreateTestCaseDto,
    project: ProjectEntity,
    sectionId: string,
    user: UserEntity,
    projectId: string,
  ): Promise<TestCaseEntity> {
    if (!project) throw new NotFoundException("translations.RECORD_NOT_FOUND");
    createTestCaseDto.title = UtilsService.titleCase(createTestCaseDto.title);
    const testCaseId = null;
    await this.checkTestCaseWithSameTitle(
      testCaseId,
      createTestCaseDto.title,
      project.id,
      sectionId,
    );
    const queryBuilder = this.testCaseRepository
      .createQueryBuilder("testCase")
      .withDeleted()
      .where("testCase.project_id = :projectId", {
        projectId,
      });

    const lastTestCase = await queryBuilder
      .select("testCase.testcaseId")
      .orderBy("testCase.created_at", "DESC")
      .limit(1)
      .getOne();

    const testCase = this.testCaseRepository.create(createTestCaseDto);
    if (!lastTestCase) {
      testCase.testcaseId === 1;
    } else {
      testCase.testcaseId = lastTestCase.testcaseId + 1;
    }
    testCase.project = project;
    testCase.createdBy = user;
    if (sectionId && UtilsService.checkUuid(sectionId)) {
      testCase.section = await this.sectionService.checkSectionForProject(
        sectionId,
        project.id,
      );
    } else
      testCase.section = await this.sectionService.getDefaultSection(
        project.id,
      );
    // Setting Priority
    const currentHighestPriority = await this.getHighestPrioritisedTestCase(
      testCase.section.id,
    );
    testCase.priority = currentHighestPriority.priority + 1;
    const testCasesData = await this.testCaseRepository.save(testCase);
    return testCasesData;
  }

  async getHighestPrioritisedTestCase(
    sectionId: string,
  ): Promise<{ priority: number }> {
    const result = await this.testCaseRepository
      .createQueryBuilder("testcase")
      .select("MAX(testcase.priority)", "priority")
      .where("testcase.section_id = :sectionId", { sectionId })
      .getRawOne();
    return result;
  }

  /**
   * Edit Test Case
   */
  async editTestCase(
    editTestCaseDto: EditTestCaseDto,
    testCaseId: string,
    project: ProjectEntity,
    sectionId: string,
    user: UserEntity,
    deletedTestCase: boolean = false,
  ): Promise<TestCaseDto> {
    const testCase = await this.testCaseRepository
      .createQueryBuilder("testcase")
      .leftJoinAndSelect("testcase.section", "section")
      .where("testcase.id = :testCaseId", { testCaseId })
      .getOne();
    if (!testCase) throw new NotFoundException("translations.RECORD_NOT_FOUND");
    if (editTestCaseDto?.title) {
      editTestCaseDto.title = UtilsService.titleCase(editTestCaseDto.title);
      testCase.title = editTestCaseDto.title;
      await this.checkTestCaseWithSameTitle(
        testCaseId,
        editTestCaseDto.title,
        project.id,
        sectionId,
      );
    }
    testCase.updatedBy = user;
    if (editTestCaseDto?.expectedResults)
      testCase.expectedResults = editTestCaseDto.expectedResults;
    if (editTestCaseDto?.preconditions)
      testCase.preconditions = editTestCaseDto.preconditions;
    if (editTestCaseDto?.steps) testCase.steps = editTestCaseDto.steps;
    if (editTestCaseDto?.executionPriority)
      testCase.executionPriority = editTestCaseDto.executionPriority;

    if (
      sectionId &&
      UtilsService.checkUuid(sectionId) &&
      testCase.section?.id !== sectionId
    ) {
      const section = await this.sectionService.checkSectionForProject(
        sectionId,
        project.id,
      );
      testCase.section = section;
      // Setting Priority
      const currentHighestPriority =
        await this.getHighestPrioritisedTestCase(sectionId);
      testCase.priority = currentHighestPriority.priority + 1;
    }
    if (
      deletedTestCase &&
      user.id &&
      UtilsService.checkUuid(user.id) &&
      testCase.created_by_id !== user.id
    ) {
      testCase.createdBy = user;
    }
    const testCasesData = await this.testCaseRepository.save(testCase);
    return testCasesData.toDto();
  }

  /**
   * Edit Multiple Test Cases
   */
  async editMultipleTestCases(
    editTestCaseDto: EditTestCaseDto,
    testCaseIds: string[],
    project: ProjectEntity,
    sectionId: string,
    user: UserEntity,
  ): Promise<boolean> {
    const testCases = await this.testCaseRepository
      .createQueryBuilder("testcase")
      .leftJoinAndSelect("testcase.section", "section")
      .where("testcase.id In (:...testCaseIds)", { testCaseIds })
      .getMany();
    const testCaseSize = testCases.length;
    if (!testCaseSize)
      throw new BadRequestException("translations.RECORD_UPDATE_FAILED");
    let section: SectionEntity;
    let priority = 0;
    if (sectionId && UtilsService.checkUuid(sectionId)) {
      section = await this.sectionService.checkSectionForProject(
        sectionId,
        project.id,
      );
      const currentHighestPriority =
        await this.getHighestPrioritisedTestCase(sectionId);
      priority = currentHighestPriority.priority + 1;
    }
    this.setTestCasesFromEditTestCaseDto(
      testCases,
      editTestCaseDto,
      section,
      priority,
      user,
    );
    const res = await this.testCaseRepository.save(testCases);
    if (!res.length)
      throw new BadRequestException("translations.RECORD_UPDATE_FAILED");
    return true;
  }

  setTestCasesFromEditTestCaseDto(
    testCases: TestCaseEntity[],
    editTestCaseDto: EditTestCaseDto,
    section: SectionEntity,
    priority: number,
    user: UserEntity,
  ) {
    testCases.forEach((testCase) => {
      testCase.updatedBy = user;
      if (editTestCaseDto?.expectedResults) {
        testCase.expectedResults = editTestCaseDto.expectedResults;
      }
      if (editTestCaseDto?.preconditions) {
        testCase.preconditions = editTestCaseDto.preconditions;
      }
      if (editTestCaseDto?.steps) {
        testCase.steps = editTestCaseDto.steps;
      }
      if (editTestCaseDto?.executionPriority) {
        testCase.executionPriority = editTestCaseDto.executionPriority;
      }
      if (section && testCase.section?.id !== section.id) {
        testCase.section = section;
        testCase.priority = priority;
        priority += 1;
      }
    });
  }

  /**
   * Check Test case with same title
   */

  async checkTestCaseWithSameTitle(
    testCaseId: any,
    title: string,
    projectId: string,
    sectionId: string,
  ): Promise<boolean> {
    const queryBuilder = await this.testCaseRepository
      .createQueryBuilder("testcase")
      .leftJoinAndSelect("testcase.project", "project")
      .leftJoinAndSelect("testcase.section", "section")
      .select("testcase.id")
      .where("project.id = :projectId", {
        projectId,
      })
      .andWhere("section.id = :sectionId", {
        sectionId,
      });

    if (testCaseId !== null) {
      queryBuilder.andWhere("testcase.id != :id", { id: testCaseId });
    }
    const checkTestCaseWithSameTitle = await queryBuilder
      .andWhere("testcase.title = :title", {
        title,
      })
      .getOne();
    if (checkTestCaseWithSameTitle)
      throw new ConflictException("translations.DUPLICATE_RECORD");
    return true;
  }

  /**
   * Get all test cases
   */

  async getTestCases(
    pageOptionsDto: TestCasesPageOptionsDto,
    projectId: string,
  ): Promise<TestCasesPageDto> {
    const queryBuilder = this.testCaseRepository
      .createQueryBuilder("testCase")
      .leftJoinAndSelect("testCase.project", "project")
      .where("project.id = :projectId", {
        projectId,
      })
      .leftJoinAndSelect("testCase.section", "section");

    const [testCases, testCasesCount] = await queryBuilder
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.take)
      .orderBy("testCase.createdAt", pageOptionsDto.order)
      .getManyAndCount();

    const pageMetaDto = new PageMetaDto({
      pageOptionsDto,
      itemCount: testCasesCount,
    });
    return new TestCasesPageDto(testCases.toDtos(), pageMetaDto);
  }

  /**
   * Get all test cases Activity User
   */

  async getTestCaseActivityUser(projectId: string): Promise<TestCaseFilterDto> {
    const testcases = await this.testCaseRepository
      .createQueryBuilder("testCase")
      .leftJoinAndSelect("testCase.project", "project")
      .where("project.id = :projectId", {
        projectId,
      })
      .leftJoinAndSelect("testCase.createdBy", "createdBy")
      .leftJoinAndSelect("testCase.updatedBy", "updatedBy")
      .getMany();
    const checkUpdatedBy: any = {};
    const checkCreatedBy: any = {};
    const updatedBy = [];
    const createdBy = [];
    const testCaseSize = testcases.length;
    for (let i = 0; i < testCaseSize; i++) {
      const testCaseUpdatedBy = testcases[i].updatedBy;
      const testCaseCreatedBy = testcases[i].createdBy;
      if (testCaseUpdatedBy && !checkUpdatedBy[testCaseUpdatedBy.id]) {
        updatedBy.push(testCaseUpdatedBy);
        checkUpdatedBy[testCaseUpdatedBy.id] = true;
      }
      if (testCaseCreatedBy && !checkCreatedBy[testCaseCreatedBy.id]) {
        createdBy.push(testCaseCreatedBy);
        checkCreatedBy[testCaseCreatedBy.id] = true;
      }
    }
    return new TestCaseFilterDto(updatedBy.toDtos(), createdBy.toDtos());
  }

  /**
   * Find single testCase
   */

  async getTestCase(testCaseId: string): Promise<TestCaseDto> {
    const testCase = await this.testCaseRepository
      .createQueryBuilder("testcase")
      .leftJoinAndSelect("testcase.section", "section")
      .leftJoinAndSelect("testcase.defect", "defect")
      .where("testcase.id = :testCaseId", { testCaseId })
      .getOne();
    if (!testCase) throw new NotFoundException("translations.RECORD_NOT_FOUND");
    return new TestCaseDetailsDto(testCase);
  }

  /**
   * Find single testCase detail by internal test case id
   */
  async getTestCaseByInternalId(
    projectId: string,
    testCaseId: number,
  ): Promise<TestCaseDetailsDto> {
    const testCase = await this.testCaseRepository.findOne({
      relations: ["project", "section"],
      where: {
        testcaseId: testCaseId,
      },
    });
    if (!testCase || testCase.project.id !== projectId) {
      throw new NotFoundException("translations.RECORD_NOT_FOUND");
    }
    return new TestCaseDetailsDto(testCase);
  }

  async deleteTestCase(testCaseId: string): Promise<boolean> {
    const testCase = await this.testCaseRepository.findOne({
      relations: ["project"],
      where: {
        id: testCaseId,
      },
    });
    if (!testCase) throw new NotFoundException("translations.RECORD_NOT_FOUND");
    // reset priority before deleting testcase
    const testCases = await this.testCaseRepository
      .createQueryBuilder("testcases")
      .innerJoin("testcases.section", "section", "section.id = :sectionId", {
        sectionId: testCase.sectionId,
      })
      .where("testcases.priority > :priority", {
        priority: testCase.priority,
      })
      .getMany();
    for (let i = 0; i < testCases.length; i++) {
      const newPriority = testCase.priority + i;
      testCases[i].priority = newPriority;
    }
    await this.testCaseRepository.save(testCases);

    await this.testCaseRepository.remove(testCase);
    return true;
  }

  async reOrderPriorities(
    sectionId: string,
    testCaseId: string,
    newPosition: number,
  ): Promise<TestCaseEntity[]> {
    const testCase = await this.testCaseRepository.findOne({
      where: {
        id: testCaseId,
      },
    });
    if (!testCase || testCase.sectionId !== sectionId) {
      throw new ForbiddenException("translations.SECTION_TESTCASE_MISMATCH");
    }
    const allTestCases = await this.testCaseRepository.findBy({ sectionId });
    const { priority } = await this.getHighestPrioritisedTestCase(sectionId);
    if (priority < newPosition)
      throw new BadRequestException("translations.INVALID_ORDER");
    let currentPosition = 0;
    for (let i = 0; i < allTestCases.length; i++) {
      if (allTestCases[i].id === testCaseId) {
        currentPosition = i + 1;
      }
    }
    const newOrderOfTestCases = this.rearrangePriorities(
      allTestCases,
      currentPosition - 1,
      newPosition - 1,
    );
    await this.testCaseRepository.save(allTestCases);
    return newOrderOfTestCases;
  }

  rearrangePriorities(
    testCases: TestCaseEntity[],
    oldPositionIndex: number,
    newPositionIndex: number,
  ): TestCaseEntity[] {
    while (oldPositionIndex < 0) {
      oldPositionIndex += testCases.length;
    }
    while (newPositionIndex < 0) {
      newPositionIndex += testCases.length;
    }
    if (newPositionIndex >= testCases.length) {
      let k = newPositionIndex - testCases.length;
      while (k-- + 1) {
        testCases.push(undefined);
      }
    }
    testCases.splice(
      newPositionIndex,
      0,
      testCases.splice(oldPositionIndex, 1)[0],
    );
    for (let i = 0; i < testCases.length; i++) {
      testCases[i].priority = i + 1;
    }
    return testCases;
  }

  /**
   * Internal method to search Test cases
   */
  async searchTestCases(
    title: string,
    id: number,
    currentLoggedInUser: UserEntity,
  ): Promise<TestCaseDetailsDto[]> {
    if (!title && !id) {
      const res: TestCaseDetailsDto[] = [];
      return res;
    }
    const projects = await this.projectReadService.findProjectsByOrganizationId(
      currentLoggedInUser.organization.id,
    );

    const projectIds = projects.map((project) => project.id);

    let queryBuilder = await this.testCaseRepository
      .createQueryBuilder("testcase")
      .innerJoinAndSelect(
        "testcase.project",
        "project",
        "project.id IN (:...projectIds)",
        {
          projectIds,
        },
      );
    if (title) {
      title = UtilsService.lowerCase(title);
      queryBuilder = await queryBuilder.where(
        "LOWER(testcase.title) like :title",
        {
          title: `%${title}%`,
        },
      );
    }
    if (id) {
      queryBuilder = await queryBuilder.orWhere(
        "CAST(testcase.testcaseId AS VARCHAR(30)) like :id",
        {
          id: `%${id}%`,
        },
      );
    }
    const testCases = await queryBuilder
      .orderBy("testcase.createdAt", Order.DESC)
      .getMany();
    const testCasesDetials = testCases.map(
      (testCase) => new TestCaseDetailsDto(testCase),
    );
    return testCasesDetials;
  }

  /**
   * Internal method to delete test cases of a section
   */
  async deleteTestCasesBySection(sectionId: string): Promise<boolean> {
    const testCases = await this.testCaseRepository
      .createQueryBuilder("testcase")
      .where("testcase.section_id = :sectionId", { sectionId })
      .getMany();
    if (!testCases.length) return true;
    const res = await this.testCaseRepository.softRemove(testCases);
    if (!res.length) return false;
    return true;
  }

  /**
   * Internal method to get test cases by ids
   */
  async getTestCasesByIds(
    project: ProjectEntity,
    testCaseIds: string[],
  ): Promise<TestCaseEntity[]> {
    const testCases = await this.testCaseRepository
      .createQueryBuilder("testcase")
      .innerJoinAndSelect("testcase.project", "project", "project.id = :id", {
        id: project.id,
      })
      .leftJoinAndSelect("testcase.section", "section")
      .where("testcase.id IN (:...testCaseIds)", {
        testCaseIds,
      })
      .orderBy("section.createdAt", "ASC")
      .addOrderBy("testcase.priority")
      .getMany();

    if (testCases.length === 0)
      throw new NotFoundException("translations.RECORD_NOT_FOUND");

    return testCases;
  }

  /**
   * Internal method to add test cases pdf
   */
  async addTestCasesPdf(
    project: ProjectEntity,
    testCaseIds: string[],
  ): Promise<string> {
    const testCases = await this.getTestCasesByIds(project, testCaseIds);
    const testCasesBySection = this.groupTestCasesBySection(testCases);
    const key = await this.pdfService.generateTestCasesPdf(
      project,
      testCasesBySection,
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
   * Internal method to group testcases section wise
   */
  groupTestCasesBySection(testCases: TestCaseEntity[]) {
    const testCasesObject: any = {};
    const unassignedTestCases = [];
    const testCasesSize = testCases.length;
    for (let i = 0; i < testCasesSize; i++) {
      const section = testCases[i].section.name;
      if (section === "Unassigned") {
        unassignedTestCases.push(testCases[i]);
        continue;
      }
      if (!testCasesObject[section]) {
        testCasesObject[section] = [];
      }
      testCasesObject[section].push(testCases[i]);
    }
    if (unassignedTestCases.length > 0) {
      testCasesObject.Unassigned = unassignedTestCases;
    }
    return testCasesObject;
  }

  /**
   * Internal method to get all testcases
   * for a project sorted by section
   */
  async getTestCasesSortedBySection(
    projectId: string,
  ): Promise<TestCaseEntity[]> {
    const testCases = await this.testCaseRepository
      .createQueryBuilder("testcase")
      .leftJoinAndSelect(
        "testcase.section",
        "section",
        "section.deletedAt is NULL",
      )
      .leftJoinAndSelect("testcase.createdBy", "createdBy")
      .leftJoinAndSelect("testcase.updatedBy", "updatedBy")
      .where("testcase.project_id = :projectId", {
        projectId,
      })
      .orderBy("section.createdAt")
      .addOrderBy("testcase.priority")
      .getMany();
    if (!testCases.length)
      throw new NotFoundException("translations.RECORD_NOT_FOUND");
    return testCases;
  }

  /**
   * Add defect reference in testcase
   */
  async addJiraReference(
    defect: DefectEntity,
    testCaseId: string,
    organizationId: string,
  ): Promise<boolean> {
    const testCase = await this.testCaseRepository
      .createQueryBuilder("testcase")
      .leftJoinAndSelect("testcase.project", "project")
      .where("testcase.id = :id", { id: testCaseId })
      .getOne();
    if (!testCase) throw new NotFoundException("translations.RECORD_NOT_FOUND");
    await this.projectReadService.checkProjectForUser(
      testCase?.project?.id,
      organizationId,
    );
    testCase.defect = defect;
    await this.testCaseRepository.save(testCase);
    return true;
  }

  async getTestCasesByUserId(userId: any): Promise<any> {
    const testCasses = await this.testCaseRepository
      .createQueryBuilder("test_cases")
      .leftJoinAndSelect("test_cases.createdBy", "user")
      .leftJoinAndSelect("test_cases.project", "project")
      .leftJoinAndSelect("test_cases.section", "section")
      .where("test_cases.created_by_id = :userId", { userId })
      .getMany();

    return testCasses;
  }

  async getEditTestCasesByUserId(userId: any): Promise<any> {
    const testCasses = await this.testCaseRepository
      .createQueryBuilder("test_cases")
      .leftJoinAndSelect("test_cases.updatedBy", "user")
      .leftJoinAndSelect("test_cases.project", "project")
      .leftJoinAndSelect("test_cases.section", "section")
      .where("test_cases.updated_by_id = :userId", { userId })
      .getMany();
    return testCasses;
  }
}
