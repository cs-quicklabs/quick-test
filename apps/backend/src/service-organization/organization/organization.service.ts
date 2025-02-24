import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { Between, FindOptionsWhere, LessThan, Repository } from "typeorm";
import { ModuleRef } from "@nestjs/core";

import { InjectRepository } from "@nestjs/typeorm";
import { ExpectationFailedException } from "../../exceptions/expectation-failed.exception";
import { PageMetaDto } from "../../common/dto/PageMetaDto";
import { AwsS3Service } from "../../shared/services/aws-s3.service";
import { ValidatorService } from "../../shared/services/validator.service";
import { OrganizationsPageDto } from "./dto/OrganizationsPageDto";
import { OrganizationsPageOptionsDto } from "./dto/OrganizationsPageOptionsDto";
import { OrganizationEntity } from "./organization.entity";
import { CreateOrganizationDto } from "./dto/CreateOrganizationDto";
import { UserEntity } from "../../service-users/user/user.entity";
import { UtilsService } from "../../_helpers/utils.service";
import { AddOrganizationMemberDto } from "./dto/AddOrganizationMemberDto";
import { UsersPageOptionsDto as MembersPageOptionsDto } from "../../service-users/user/dto/UsersPageOptionsDto";
import { UsersPageDto as MembersPageDto } from "../../service-users/user/dto/UsersPageDto";
import { UpdateOrganizationMemberDto } from "./dto/UpdateOrganizationMemberDto";
import { AuthService } from "../../service-auth/auth/auth.service";
import { AddMultipleMembersOrganizationDto } from "./dto/AddMultipleMembersOrganizationDto";
import { ProjectFavoriteDetailDto } from "../project/dto/ProjectFavoriteDetailDto";
import { ProjectListPageOptionsDto } from "../project/dto/ProjectListPageOptionDto";
import { MilestoneService } from "../milestone/milestone.service";
import { TestCaseService } from "../test-case/test-case.service";
import { TestSuiteService } from "../test-suite/test-suite.service";
import { SearchOptionsDto } from "./dto/SearchOptionsDto";
import { UserUpdateService } from "../../service-users/user/services/update.service";
import { UserCreateService } from "../../service-users/user/services/create.service";
import { UserReadService } from "../../service-users/user/services/read.service";
import { ProjectReadService } from "../project/services/read.service";
import { OrgSubscriptionStatus } from "../../common/enums/org-subscription-status";
import { FreeTrial } from "../../common/enums/days-enum";
import { RoleId } from "../../common/enums/role-id";
import { ProjectEntity } from "../project/project.entity";
import { AddMemberDto } from "../project/members/dto/addMember.dto";
import { UserDeleteService } from "../../service-users/user/services/delete.service";
import { ProjecMemberEntity } from "../project/members/projectMember.entity";

@Injectable()
export class OrganizationService {
  public userReadService: UserReadService;

  public userUpdateService: UserUpdateService;

  public userCreateService: UserCreateService;

  public userDeleteService: UserDeleteService;

  private authService: AuthService;

  public projectReadService: ProjectReadService;

  private milestoneService: MilestoneService;

  private testCaseService: TestCaseService;

  private testSuiteService: TestSuiteService;

  constructor(
    @InjectRepository(OrganizationEntity)
    public readonly organizationRepository: Repository<OrganizationEntity>,
    @InjectRepository(ProjecMemberEntity)
    public readonly projectMembersRepository: Repository<ProjecMemberEntity>,
    public readonly validatorService: ValidatorService,
    public readonly awsS3Service: AwsS3Service,
    public readonly moduleRef: ModuleRef,
  ) { }

  onModuleInit(): void {
    this.userCreateService = this.moduleRef.get(UserCreateService, {
      strict: false,
    });
    this.userReadService = this.moduleRef.get(UserReadService, {
      strict: false,
    });
    this.userDeleteService = this.moduleRef.get(UserDeleteService, {
      strict: false,
    });
    this.userUpdateService = this.moduleRef.get(UserUpdateService, {
      strict: false,
    });
    this.authService = this.moduleRef.get(AuthService, {
      strict: false,
    });
    this.projectReadService = this.moduleRef.get(ProjectReadService, {
      strict: false,
    });
    this.milestoneService = this.moduleRef.get(MilestoneService, {
      strict: false,
    });
    this.testCaseService = this.moduleRef.get(TestCaseService, {
      strict: false,
    });
    this.testSuiteService = this.moduleRef.get(TestSuiteService, {
      strict: false,
    });
  }

  /**
   * Find single organization
   */
  findOne(
    findData: FindOptionsWhere<OrganizationEntity>,
  ): Promise<OrganizationEntity> {
    return this.organizationRepository.findOneBy(findData);
  }

  async changeOrganizationName(
    organizationId: string,
    newOrganizationName: string,
    currentLoggedInUser: UserEntity,
  ): Promise<boolean> {
    if (currentLoggedInUser.roleId === RoleId.MEMBER) {
      throw new ForbiddenException("translations.NO_UPDATE_PERMISSION");
    }

    const checkUpdate = await this.organizationRepository.update(
      {
        id: organizationId,
      },
      {
        name: newOrganizationName,
      },
    );
    if (!checkUpdate.affected)
      throw new ExpectationFailedException("translations.RECORD_UPDATE_FAILED");
    return true;
  }

  async updateStripeCustomer(
    organizationId: string,
    customerId: string,
  ): Promise<boolean> {
    const checkUpdate = await this.organizationRepository.update(
      {
        id: organizationId,
      },
      {
        customerId,
      },
    );
    if (!checkUpdate.affected)
      throw new ExpectationFailedException("translations.RECORD_UPDATE_FAILED");
    return true;
  }

  async updateOrgSubscriptionStatus(
    organizationId: string,
    subscriptionStatus: OrgSubscriptionStatus,
  ) {
    const checkUpdate = await this.organizationRepository.update(
      {
        id: organizationId,
      },
      {
        subscriptionStatus,
      },
    );
    if (!checkUpdate.affected)
      throw new ExpectationFailedException("translations.RECORD_UPDATE_FAILED");
    return true;
  }

  /**
   * Find organization by name
   */

  async findByOrganizationByIdOrName(
    options: Partial<{ organizationname: string; id: string }>,
  ): Promise<OrganizationEntity | undefined> {
    const queryBuilder =
      this.organizationRepository.createQueryBuilder("organization");

    if (options.id) {
      queryBuilder.orWhere("organization.id = :id", {
        id: options.id,
      });
    }
    if (options.organizationname) {
      queryBuilder.orWhere(
        "organization.organizationname = :organizationname",
        {
          name: options.organizationname,
        },
      );
    }

    return queryBuilder.getOne();
  }

  /**
   * Create organization
   */
  async createOrganization(
    organizationRegisterDto: CreateOrganizationDto,
  ): Promise<OrganizationEntity> {
    const newOrganization: CreateOrganizationDto = organizationRegisterDto;
    newOrganization.name = UtilsService.properCase(
      organizationRegisterDto.name,
    );
    const organization = this.organizationRepository.create(newOrganization);

    const organizationsData =
      await this.organizationRepository.save(organization);
    return organizationsData;
  }

  /*
   * Gets all Organizations for Admin, Gets organization information for a User.
   */
  async getOrganizations(
    pageOptionsDto: OrganizationsPageOptionsDto,
    user: UserEntity,
  ): Promise<OrganizationsPageDto> {
    const queryBuilder =
      this.organizationRepository.createQueryBuilder("organization");

    if (user.roleId !== RoleId.SUPERADMIN) {
      queryBuilder.where("organization.id = :organizationId", {
        organizationId: user.organization.id,
      });
    }
    queryBuilder
      .leftJoinAndSelect("organization.projects", "projects")
      .where("projects.deleted_At is Null");

    const [organizations, organizationsCount] = await queryBuilder
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.take)
      .getManyAndCount();
    const pageMetaDto = new PageMetaDto({
      pageOptionsDto,
      itemCount: organizationsCount,
    });
    return new OrganizationsPageDto(organizations.toDtos(), pageMetaDto);
  }

  /*
   * Lets a Organization add member in their organization
   */
  async addMemberInOrganization(
    addOrganizationMemberDto: AddOrganizationMemberDto,
    currentLoggedInUser: UserEntity,
    lang: string,
  ): Promise<UserEntity> {
    const tempPassword = UtilsService.generateRandomString(8);
    const user = await this.userCreateService.addUserInOrganization(
      addOrganizationMemberDto,
      tempPassword,
      currentLoggedInUser.organization,
      currentLoggedInUser,
      lang,
    );
    if (user) {
      return user;
    }
    throw new ExpectationFailedException("translations.ACTION_FAILED");
  }

  /*
   * Gets all member in any organization, Admin can not call this
   */
  async getAllMembers(
    pageOptionsDto: MembersPageOptionsDto,
    currentLoggedInUser: UserEntity,
  ): Promise<MembersPageDto> {
    const members = await this.userReadService.getAllMemebersInOrganization(
      pageOptionsDto,
      currentLoggedInUser.organization.id,
      currentLoggedInUser,
    );
    return members;
  }

  /*
   * Gets archived member in any organization
   */
  async getArchivedMembers(
    pageOptionsDto: MembersPageOptionsDto,
    currentLoggedInUser: UserEntity,
  ): Promise<MembersPageDto> {
    const members =
      await this.userReadService.getArchivedMemebersInOrganization(
        pageOptionsDto,
        currentLoggedInUser.organization.id,
        currentLoggedInUser,
      );
    return members;
  }

  /**
   * Updates organnization member
   */
  async updateMemberInOrganization(
    updateOrganizationMemberDto: UpdateOrganizationMemberDto,
    memberId: string,
    currentLoggedInUser: UserEntity,
    lang: string,
  ): Promise<UserEntity> {
    const member = await this.userUpdateService.updateMemberInOrganization(
      updateOrganizationMemberDto,
      memberId,
      currentLoggedInUser,
      lang,
    );
    if (member) {
      return member;
    }
    throw new ExpectationFailedException("translations.RECORD_UPDATE_FAILED");
  }

  /**
   * Resend reset password link to the member's email
   */
  async resendResetPasswordLink(
    memberId: string,
    currentLoggedInUser: UserEntity,
    lang: string,
  ): Promise<boolean> {
    const member = await this.userReadService.findOne(
      {
        id: memberId,
      },
      ["organization"],
    );
    if (!member) throw new NotFoundException("translations.RECORD_NOT_FOUND");
    const checkSameOrganization =
      member.organization.id === currentLoggedInUser.organization.id;
    if (!checkSameOrganization)
      throw new ForbiddenException("translations.ACCESS_DENIED");
    await this.authService.sendResetPasswordLink(
      {
        email: member.email,
      },
      lang,
    );
    return true;
  }

  /*
   * Add mulitple members to the organization
   */
  async addMultipleMembersInOrganization(
    addMultipleMembersOrganizationDto: AddMultipleMembersOrganizationDto,
    currentLoggedInUser: UserEntity,
    lang: string,
  ): Promise<any> {
    const members: UserEntity[] = [];
    for (let i = 0; i < addMultipleMembersOrganizationDto.members.length; i++) {
      const tempPassword = UtilsService.generateRandomString(10);
      const user = await this.userCreateService.addUserInOrganization(
        addMultipleMembersOrganizationDto.members[i],
        tempPassword,
        currentLoggedInUser.organization,
        currentLoggedInUser,
        lang,
      );
      if (user) {
        members.push(user);
      }
    }
    return {
      members,
      totalMembersAdded: members.length,
    };
  }

  /**
   *  Get organization details with members list
   */
  async getOrganization(
    currentLoggedInUser: UserEntity,
    projectId: string,
  ): Promise<any> {
    const projectMembers = await this.projectMembersRepository
      .createQueryBuilder("project_member")
      .where('project_member."organization_id" =:organizationId', {
        organizationId: currentLoggedInUser.organization.id,
      })
      .andWhere('project_member."project_id" =:projectId', { projectId })
      .getMany();

    if (!projectMembers)
      throw new NotFoundException("translations.RECORD_NOT_FOUND");

    const userIds = projectMembers.map((members) => members.userId);
    //return new OrganizationListDto(organization);
    const members = await this.userReadService.getAllUsersByIds(userIds);
    return members;
  }

  /**
   * Get all projects in the organization with total active
   * test runs and milestones
   */
  async getAllProjects(
    currentLoggedInUser: UserEntity,
  ): Promise<ProjectFavoriteDetailDto[]> {
    const projects =
      await this.projectReadService.getAllProjects(currentLoggedInUser);
    return projects;
  }

  /**
   * Get archived projects in the organization
   */

  async getArchivedProjects(
    currentLoggedInUser: UserEntity,
  ): Promise<ProjectEntity[]> {
    const projects =
      await this.projectReadService.getArchivedProjects(currentLoggedInUser);
    return projects;
  }

  /**
   * Get most active projects in the organization with total test changes
   */
  async getMostActiveProjects(
    pageOptionsDto: ProjectListPageOptionsDto,
    currentLoggedInUser: UserEntity,
  ) {
    const result = await this.projectReadService.getMostActiveProjects(
      pageOptionsDto,
      currentLoggedInUser,
    );
    return result;
  }

  /**
   * Get TestCase, TestRuns, Milestones and projects search results
   */
  async getSearchResults(
    searchOptionsDto: SearchOptionsDto,
    currentLoggedInUser: UserEntity,
  ): Promise<any> {
    const query = UtilsService.lowerCase(searchOptionsDto.query);
    const res: any = {};

    const projects = await this.projectReadService.searchProjects(
      query,
      currentLoggedInUser?.organization?.id,
    );
    if (projects.length) res.projects = projects;

    const testSuites = await this.testSuiteService.searchTestSuites(
      query,
      currentLoggedInUser,
    );
    if (testSuites.length) res.testSuites = testSuites;

    const milestones = await this.milestoneService.searchMilestones(
      query,
      currentLoggedInUser,
    );
    if (milestones.length) res.milestones = milestones;

    return this.filterExactSearchResults(res, query);
  }

  /**
   * Filter out any exact search results
   */
  filterExactSearchResults(result: any, query: string) {
    let checkExactResults = false;
    const filteredResult: any = {};
    if (result.testCases) {
      const id = Number.parseInt(query, 10);
      const filteredTestCasesById = result.testCases.filter((testCase) => {
        if (testCase.testcaseId === id) {
          checkExactResults = true;
          return true;
        }
        return false;
      });
      const filteredTestCasesByTitle = result.testCases.filter((testCase) => {
        if (UtilsService.lowerCase(testCase.title) === query) {
          checkExactResults = true;
          return true;
        }
        return false;
      });
      filteredResult.testCases = filteredTestCasesById.concat(
        filteredTestCasesByTitle,
      );
    }
    for (const key in result) {
      if (key !== "testCases") {
        filteredResult[key] = result[key].filter((obj) => {
          if (UtilsService.lowerCase(obj.name) === query) {
            checkExactResults = true;
            return true;
          }
          return false;
        });
      }
    }
    if (checkExactResults) return filteredResult;
    return result;
  }

  async findTrialExpiredOrgs() {
    const date = new Date();
    const trialStartDate = date.setDate(
      date.getDate() - Number(FreeTrial.TRIAL_DAYS_PLUS_ONE),
    );
    const trialEndDate = date.setDate(date.getDate() + 1);
    return this.organizationRepository.find({
      where: [
        {
          freeTrialStartDate: LessThan(new Date(trialStartDate)),
          subscriptionStatus: OrgSubscriptionStatus.freeTrial,
        },
        {
          freeTrialStartDate: Between(
            new Date(trialStartDate),
            new Date(trialEndDate),
          ),
          subscriptionStatus: OrgSubscriptionStatus.freeTrial,
        },
      ],
    });
  }

  findUpcomingTrialExpiringOrgs() {
    const date = new Date();
    const upcomingTrialStartDate = date.setDate(
      date.getDate() - Number(FreeTrial.UPCOMING_FREETRIAL_ENDING_PLUS_ONE),
    );
    const UpcomingTrialEndDate = date.setDate(date.getDate() + 1);
    return this.organizationRepository.find({
      where: {
        freeTrialStartDate: Between(
          new Date(upcomingTrialStartDate),
          new Date(UpcomingTrialEndDate),
        ),
        subscriptionStatus: OrgSubscriptionStatus.freeTrial,
      },
    });
  }

  async getProjectUnAssignedMember(
    organizationId: string,
    projectId: string,
  ): Promise<unknown> {
    return await this.userReadService.getProjectUnAssignedMember(
      organizationId,
      projectId,
    );
  }

  async addProjectMember(
    organizationId: string,
    addMemberDto: AddMemberDto,
  ): Promise<unknown> {
    return await this.userCreateService.addProjectMember(
      organizationId,
      addMemberDto,
    );
  }

  async getProjectAssignedMember(
    organizationId: string,
    projectId: string,
  ): Promise<unknown> {
    return await this.userReadService.getProjectAssignedMember(
      organizationId,
      projectId,
    );
  }

  async projectMemberDelete(
    organizationId: string,
    projectId: string,
    userId: string,
  ) {
    return await this.userDeleteService.deleteProjectMember(
      organizationId,
      projectId,
      userId,
    );
  }
}
