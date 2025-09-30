import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from "@nestjs/common";
import { FindOptionsWhere, Repository } from "typeorm";
import { ModuleRef } from "@nestjs/core";

import { InjectRepository } from "@nestjs/typeorm";
import { PageMetaDto } from "../../../common/dto/PageMetaDto";
import { AwsS3Service } from "../../../shared/services/aws-s3.service";
import { ValidatorService } from "../../../shared/services/validator.service";
import { ProjectsPageDto } from "../dto/ProjectsPageDto";
import { ProjectsPageOptionsDto } from "../dto/ProjectsPageOptionsDto";
import { ProjectEntity } from "../project.entity";
import { UserEntity } from "../../../service-users/user/user.entity";
import { UtilsService } from "../../../_helpers/utils.service";
import { ProjectDetailsDto } from "../dto/ProjectDetailsDto";
import { TestCaseDto } from "../../test-case/dto/TestCaseDto";

import { TestCaseService } from "../../test-case/test-case.service";

import { TestCaseResultService } from "../../test-suite/test-case-result/test-case-result.service";
import { TestSuitePageOptionsDto } from "../../test-suite/dto/TestSuitePageOptionDto";
import { TestSuitesPageDto } from "../../test-suite/dto/TestSuitesPageDto";

import { TestSuiteService } from "../../test-suite/test-suite.service";
import { SectionPageOptionsDto } from "../../test-case/section/dto/SectionPageOptionsDto";
import { SectionPageDto } from "../../test-case/section/dto/SectionPageDto";

import { SectionService } from "../../test-case/section/section.service";
import { SectionDto } from "../../test-case/section/dto/SectionDto";
import { TestSuiteTodoListDto } from "../../test-suite/dto/TestSuiteTodoListDto";

import { MilestoneService } from "../../milestone/milestone.service";
import { MilestoneDto } from "../../milestone/dto/MilestoneDto";
import { MilestoneDetailsDto } from "../../milestone/dto/MilestoneDetailDto";
import { ActivityPageOptionsDto } from "../activity/dto/ActivityPageOptionsDto";
import { TestSuiteListDto } from "../../test-suite/dto/TestSuiteListDto";
import { Order } from "../../../common/enums/order";
import { ProjectListPageOptionsDto } from "../dto/ProjectListPageOptionDto";

import { ActivityService } from "../activity/activity.service";
import { MostActiveProjectDto } from "../dto/MostActiveProjectDto";
import { MostActiveProjectListDto } from "../dto/MostActiveProjectListDto";
import { ProjectDto } from "../dto/ProjectDto";

import { ActivityDto } from "../activity/dto/ActivityDto";
import { TestCaseFilterDto } from "../../test-case/dto/TestCaseFilterDto";
import { ProjectFavoriteDetailDto } from "../dto/ProjectFavoriteDetailDto";
import { TestCaseDetailsDto } from "../../test-case/dto/TestCaseDetailsDto";
import { UserCreateService } from "../../../service-users/user/services/create.service";
import { UserDeleteService } from "../../../service-users/user/services/delete.service";
import { UserReadService } from "../../../service-users/user/services/read.service";
import { ProjectCreateService } from "./create.service";
import { ProjectUpdateService } from "./update.service";
import { RoleId } from "../../../common/enums/role-id";

@Injectable()
export class ProjectReadService {
  public userReadService: UserReadService;

  public userDeleteService: UserDeleteService;

  public userCreateService: UserCreateService;

  public projectCreateService: ProjectCreateService;

  public projectUpdateService: ProjectUpdateService;

  public milestoneService: MilestoneService;

  public activityService: ActivityService;

  public testCaseService: TestCaseService;

  public sectionService: SectionService;

  public testSuiteService: TestSuiteService;

  constructor(
    @InjectRepository(ProjectEntity)
    public readonly projectRepository: Repository<ProjectEntity>,
    public readonly validatorService: ValidatorService,
    public readonly awsS3Service: AwsS3Service,
    public readonly moduleRef: ModuleRef,
    public readonly testCaseResultService: TestCaseResultService,
  ) {}

  onModuleInit(): void {
    this.activityService = this.moduleRef.get(ActivityService, {
      strict: false,
    });
    this.testCaseService = this.moduleRef.get(TestCaseService, {
      strict: false,
    });
    this.sectionService = this.moduleRef.get(SectionService, {
      strict: false,
    });
    this.testSuiteService = this.moduleRef.get(TestSuiteService, {
      strict: false,
    });
    this.milestoneService = this.moduleRef.get(MilestoneService, {
      strict: false,
    });
    this.userCreateService = this.moduleRef.get(UserCreateService, {
      strict: false,
    });
    this.userReadService = this.moduleRef.get(UserReadService, {
      strict: false,
    });
    this.userDeleteService = this.moduleRef.get(UserDeleteService, {
      strict: false,
    });
    this.projectCreateService = this.moduleRef.get(ProjectCreateService, {
      strict: false,
    });
    this.projectUpdateService = this.moduleRef.get(ProjectUpdateService, {
      strict: false,
    });
  }

  /**
   * Find single project
   */
  findOne(findData: FindOptionsWhere<ProjectEntity>): Promise<ProjectEntity> {
    return this.projectRepository.findOneBy(findData);
  }

  /**
   * Find project By Id and name
   */
  async findByProjectByIdOrName(
    options: Partial<{ projectname: string; id: string }>,
  ): Promise<ProjectEntity | undefined> {
    const queryBuilder = this.projectRepository.createQueryBuilder("project");

    if (options.id) {
      queryBuilder.orWhere("project.id = :id", {
        id: options.id,
      });
    }
    if (options.projectname) {
      queryBuilder.orWhere("project.projectname = :projectname", {
        name: options.projectname,
      });
    }

    return queryBuilder.getOne();
  }

  /**
   * Find single project
   */

  async getProject(
    projectId: string,
    currentLoggerInUser: UserEntity,
  ): Promise<ProjectDetailsDto> {
    const project = await this.projectRepository
      .createQueryBuilder("project")
      .leftJoinAndSelect("project.organization", "organization")
      .leftJoinAndSelect("project.testcases", "testcase")
      .where("project.id = :projectId", {
        projectId,
      })
      .andWhere("organization.id = :id", {
        id: currentLoggerInUser?.organization?.id,
      })
      .getOne();
    if (!project) throw new NotFoundException("translations.RECORD_NOT_FOUND");
    return new ProjectDetailsDto(project);
  }

  /**
   * Check project with same name
   */
  async checkProjectWithSameName(
    projectName: string,
    organizationId: string,
  ): Promise<boolean> {
    const checkProjectWithSameName = await this.projectRepository
      .createQueryBuilder("project")
      .leftJoinAndSelect("project.organization", "organization")
      .select("project.id")
      .where("project.name = :name", { name: projectName })
      .andWhere("organization.id = :orgId", {
        orgId: organizationId,
      })
      .getOne();
    if (checkProjectWithSameName)
      throw new ConflictException("translations.DUPLICATE_RECORD");
    return true;
  }

  /**
   * Find all project
   */

  async getProjects(
    pageOptionsDto: ProjectsPageOptionsDto,
    user: UserEntity,
  ): Promise<ProjectsPageDto> {
    const queryBuilder = this.projectRepository.createQueryBuilder("project");
    if (user.roleId !== RoleId.SUPERADMIN) {
      queryBuilder.leftJoinAndSelect("project.organization", "organization");
      queryBuilder.where("organization.id = :organizationId", {
        organizationId: user.organization.id,
      });
    }
    queryBuilder.leftJoinAndSelect("project.testcases", "testcases");
    const [projects, projectsCount] = await queryBuilder
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.take)
      .orderBy("project.updatedAt", pageOptionsDto.order)
      .getManyAndCount();
    const pageMetaDto = new PageMetaDto({
      pageOptionsDto,
      itemCount: projectsCount,
    });
    return new ProjectsPageDto(projects.toDtos(), pageMetaDto);
  }

  /**
   * Find all sections with test cases
   */

  async getSectionsWithTestcases(
    projectId: string,
    currentLoggerInUser: UserEntity,
  ): Promise<SectionDto[]> {
    await this.checkProjectForUser(
      projectId,
      currentLoggerInUser.organization.id,
    );
    return this.sectionService.getSectionsWithTestcases(projectId);
  }

  /**
   * Find all sections with test cases
   */

  async getTestCaseActivityUser(
    projectId: string,
    currentLoggerInUser: UserEntity,
  ): Promise<TestCaseFilterDto> {
    await this.checkProjectForUser(
      projectId,
      currentLoggerInUser.organization.id,
    );
    return this.testCaseService.getTestCaseActivityUser(projectId);
  }

  /**
   * Find single test case
   */

  async getTestCase(
    testCaseId: string,
    projectId: string,
    currentLoggerInUser: UserEntity,
  ): Promise<TestCaseDto> {
    await this.checkProjectForUser(
      projectId,
      currentLoggerInUser.organization.id,
    );
    return this.testCaseService.getTestCase(testCaseId);
  }

  /**
   * Check Project associate with user
   */
  async checkProjectForUser(
    projectId: string,
    organizationId: string,
  ): Promise<ProjectEntity> {
    const project = await this.projectRepository
      .createQueryBuilder("project")
      .leftJoinAndSelect("project.organization", "organization")
      .where("project.id = :projectId", {
        projectId,
      })
      .andWhere("organization.id = :organizationId", {
        organizationId,
      })
      .getOne();
    if (!project) throw new NotFoundException("translations.RECORD_NOT_FOUND");
    if (project.organization?.id !== organizationId) {
      throw new ForbiddenException("translations.ACCESS_DENIED");
    }
    return project;
  }

  /**
   * Find all test suites
   */
  async getTestSuites(
    pageOptionsDto: TestSuitePageOptionsDto,
    projectId: string,
    currentLoggerInUser: UserEntity,
  ): Promise<TestSuitesPageDto> {
    await this.checkProjectForUser(
      projectId,
      currentLoggerInUser.organization.id,
    );
    const testSuites = await this.testSuiteService.getTestSuites(
      pageOptionsDto,
      projectId,
    );
    return testSuites;
  }

  /**
   * Find single test suite
   */

  async getTestSuiteDetail(
    testSuiteId: string,
    projectId: string,
    currentLoggerInUser: UserEntity,
  ): Promise<any> {
    await this.checkProjectForUser(
      projectId,
      currentLoggerInUser.organization.id,
    );
    const testSuites =
      await this.testSuiteService.getTestSuiteDetail(testSuiteId);
    const { user, assignedTo, milestoneId, testresults, ...rest } = testSuites;
    const result = {
      ...rest,
      user: { ...user?.toDto() },
      assignedTo: { ...assignedTo?.toDto() },
      milestoneId: { ...milestoneId?.toDto() },
      testresults: {...testresults?.toDtos() },
    };
    return result;
  }

  /**
   * Find all sections for a project
   */
  async getAllSections(
    pageOptionsDto: SectionPageOptionsDto,
    projectId: string,
    currentLoggedInUser: UserEntity,
  ): Promise<SectionPageDto> {
    await this.checkProjectForUser(
      projectId,
      currentLoggedInUser.organization_id,
    );

    const sections = await this.sectionService.getAllSections(
      pageOptionsDto,
      projectId,
    );

    return sections;
  }

  /**
   * Get all test runs with assigned users for a project
   */
  async getProjectTodo(
    projectId: string,
    currentLoggedInUser: UserEntity,
  ) {
    await this.checkProjectForUser(
      projectId,
      currentLoggedInUser.organization.id,
    );
    const todoList = await this.testSuiteService.getTodoList(projectId);
    return todoList;
  }

  /**
   * Get open Milestones
   */

  async getOpenMilestones(
    projectId: string,
    currentLoggerInUser: UserEntity,
  ): Promise<MilestoneDto[]> {
    await this.checkProjectForUser(
      projectId,
      currentLoggerInUser.organization.id,
    );
    const milestone = await this.milestoneService.getOpenMilestones(projectId);
    return milestone;
  }

  /**
   * Get open Activity Milestones
   */

  async getActivityMilestones(
    projectId: string,
    pageOptionsDto: ActivityPageOptionsDto,
    currentLoggerInUser: UserEntity,
  ): Promise<MilestoneDto[]> {
    await this.checkProjectForUser(
      projectId,
      currentLoggerInUser.organization.id,
    );
    const milestone = await this.milestoneService.getActivityMilestones(
      projectId,
      pageOptionsDto,
    );
    return milestone;
  }

  /**
   * Get All Milestones
   */

  async getAllMilestones(
    projectId: string,
    currentLoggerInUser: UserEntity,
  ) {
    await this.checkProjectForUser(
      projectId,
      currentLoggerInUser.organization.id,
    );
    const milestone = await this.milestoneService.getAllMilestones(projectId);
    return milestone;
  }

  /**
   * Internal Method to get all projects total test runs and milestones
   */
  async getAllProjects(
    currentLoggedInUser: UserEntity,
  ): Promise<ProjectFavoriteDetailDto[]> {
    const queryBuilder = this.projectRepository
      .createQueryBuilder("project")
      .innerJoinAndSelect(
        "project.organization",
        "organization",
        "organization.id = :id",
        {
          id: currentLoggedInUser.organization.id,
        },
      )
      .leftJoinAndSelect(
        "project.testsuites",
        "testsuites",
        "testsuites.deletedAt is NULL",
      )
      .leftJoinAndSelect(
        "project.milestones",
        "milestones",
        "milestones.deletedAt is NULL",
      );

    if (currentLoggedInUser.roleId == RoleId.MEMBER) {
      //queryBuilder.andWhere(`(select count(*) from project_members p where p.project_id = project.id and p.user_id = '${currentLoggedInUser.id}') > 0`)
      queryBuilder.andWhere(
        `EXISTS (SELECT 1 FROM project_members p WHERE p.project_id = project.id AND p.user_id = '${currentLoggedInUser.id}')`,
      );
    }

    const projects = await queryBuilder
      .orderBy("project.createdAt", Order.DESC)
      .getMany();

    if (!projects.length) {
      const res: ProjectFavoriteDetailDto[] = [];
      return res;
    }

    const projectList = await this.projectUpdateService.markFavoriteProject(
      projects,
      currentLoggedInUser,
    );
    return projectList;
  }

  /**
   * Internal method to find archived projects by organization id
   */
  async getArchivedProjects(
    currentLoggedInUser: UserEntity,
  ): Promise<ProjectEntity[]> {
    const archiveProjects = await this.projectRepository
      .createQueryBuilder("project")
      .innerJoinAndSelect(
        "project.organization",
        "organization",
        "organization.id = :id",
        {
          id: currentLoggedInUser.organization.id,
        },
      )
      .withDeleted()
      .leftJoinAndSelect("project.archivedBy", "archivedBy")
      .where("project.deletedAt is not NULL")
      .orderBy("project.createdAt", Order.DESC)
      .getMany();

    return archiveProjects;
  }

  /**
   * Internal method to get most active projects in the organization
   * with total test changes
   */

  async getMostActiveProjects(
    pageOptionsDto: ProjectListPageOptionsDto,
    currentLoggedInUser: UserEntity,
  ): Promise<MostActiveProjectListDto[]> {
    const projectList = await this.findAllProjectsWithTestChanges(
      pageOptionsDto,
      currentLoggedInUser,
    );
    if (!projectList.length) {
      const res: MostActiveProjectListDto[] = [];
      return res;
    }

    projectList.sort((p1, p2) => p2.totalTestChanges - p1.totalTestChanges);

    const maxLength = projectList.length >= 4 ? 4 : projectList.length;
    const projects = projectList.slice(0, maxLength);
    const projectIds = projects.map((project) => project.id);

    const testChangesActivities =
      await this.activityService.getTestCaseChangesActivitiesByProjects(
        projectIds,
        pageOptionsDto,
      );
    const result = [];
    const testChangesActivitiesLength = testChangesActivities.data.length;

    for (let i = 0; i < testChangesActivitiesLength; i++) {
      const testChangesActivity = testChangesActivities.data[i];
      const activeProjects = this.findActiveProjectsFromActivities(
        new Date(testChangesActivity.date),
        testChangesActivity.activities,
      );
      result.push(
        this.projectCreateService.addInactiveProjects(projects, activeProjects),
      );
    }
    return result;
  }

  /**
   * Internal method to find all projects with test changes
   */
  async findAllProjectsWithTestChanges(
    pageOptionsDto: ProjectListPageOptionsDto,
    currentLoggedInUser: UserEntity,
  ): Promise<MostActiveProjectDto[]> {
    const date = UtilsService.getPastDate(pageOptionsDto.days);

    const queryBuilder = this.projectRepository
      .createQueryBuilder("project")
      .innerJoinAndSelect(
        "project.organization",
        "organization",
        "organization.id = :id",
        {
          id: currentLoggedInUser.organization.id,
        },
      );
    if (currentLoggedInUser.roleId == RoleId.MEMBER) {
      queryBuilder.andWhere(
        `(select count(*) from project_members p where p.project_id = project.id and p.user_id = '${currentLoggedInUser.id}') > 0`,
      );
    }
    const projects = await queryBuilder.getMany();

    const projectsList: MostActiveProjectDto[] = [];

    for (let i = 0; i < projects.length; i++) {
      const project: any = projects[i];
      project.totalTestChanges =
        await this.activityService.getProjectsTestChangesCount(
          projects[i].id,
          date,
        );
      projectsList.push(new MostActiveProjectDto(project));
    }
    return projectsList;
  }

  /**
   * Internal method to group projects from test changes activities by date
   */
  findActiveProjectsFromActivities(
    date: Date,
    activities: ActivityDto[],
  ): MostActiveProjectListDto {
    const projectData: any = {};
    projectData.date = date.toDateString();

    const size = activities.length;
    const checkProject = {};

    for (let i = 0; i < size; i++) {
      const { project } = activities[i];
      if (!checkProject[project.id]) {
        checkProject[project.id] = new MostActiveProjectDto(project);
      }
      checkProject[project.id].totalTestChanges += 1;
    }

    projectData.projects = Object.values(checkProject);

    return new MostActiveProjectListDto(projectData.date, projectData.projects);
  }

  /**
   * Get favorite projects for user
   */
  async getFavoriteProjects(
    currentLoggedInUser: UserEntity,
  ): Promise<ProjectDto[]> {
    const projects = await this.projectRepository
      .createQueryBuilder("project")
      .innerJoinAndSelect(
        "project.organization",
        "organization",
        "organization.id = :id",
        {
          id: currentLoggedInUser.organization.id,
        },
      )
      .getMany();

    if (!projects.length) {
      return projects.toDtos();
    }
    const projectIds = projects.map((project) => project.id);

    const favoriteProjects = await this.userReadService.getFavoriteProjects(
      projectIds,
      currentLoggedInUser,
    );

    if (!favoriteProjects) {
      const res: ProjectDto[] = [];
      return res;
    }
    return favoriteProjects.toDtos();
  }

  /**
   * Find single test case by internal test case id
   */
  async getTestCaseByInternalId(
    projectId: string,
    testCaseId: number,
    currentLoggerInUser: UserEntity,
  ): Promise<TestCaseDetailsDto> {
    await this.checkProjectForUser(
      projectId,
      currentLoggerInUser.organization.id,
    );
    return this.testCaseService.getTestCaseByInternalId(projectId, testCaseId);
  }

  /**
   * Internal method to search projects
   */
  async searchProjects(
    name: string,
    organizationId: string,
  ): Promise<ProjectDto[]> {
    name = UtilsService.lowerCase(name);

    const projects = await this.projectRepository
      .createQueryBuilder("project")
      .innerJoinAndSelect(
        "project.organization",
        "organization",
        "organization.id = :organizationId",
        {
          organizationId,
        },
      )
      .where("LOWER(project.name) like :name", {
        name: `%${name}%`,
      })
      .orderBy("project.createdAt", Order.DESC)
      .getMany();

    return projects.toDtos();
  }

  /**
   * Internal method to find projects by organization id
   */
  async findProjectsByOrganizationId(
    organizationId: string,
  ): Promise<ProjectDto[]> {
    const projects = await this.projectRepository
      .createQueryBuilder("project")
      .innerJoinAndSelect(
        "project.organization",
        "organization",
        "organization.id = :organizationId",
        {
          organizationId,
        },
      )
      .orderBy("project.createdAt", Order.DESC)
      .getMany();

    return projects.toDtos();
  }
}
