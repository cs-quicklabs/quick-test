import { Injectable, NotFoundException } from "@nestjs/common";
import { FindOptionsWhere, Repository } from "typeorm";
import { ModuleRef } from "@nestjs/core";
import { InjectRepository } from "@nestjs/typeorm";
import { PageMetaDto } from "../../../common/dto/PageMetaDto";
import { AwsS3Service } from "../../../shared/services/aws-s3.service";
import { ValidatorService } from "../../../shared/services/validator.service";
import { UsersPageDto } from "../dto/UsersPageDto";
import { UsersPageOptionsDto } from "../dto/UsersPageOptionsDto";
import { UserEntity } from "../user.entity";
import { DashboardCountsDto } from "../dto/DashboardCountsDto";
import { AuthService } from "../../../service-auth/auth/auth.service";
import { AppConfigService } from "../../../shared/services/app.config.service";
import { RoleId } from "../../../common/enums/role-id";
import { ProjecMemberEntity } from "../../../service-organization/project/members/projectMember.entity";

@Injectable()
export class UserReadService {
  public authService: AuthService;

  public appConfigService: AppConfigService;

  constructor(
    @InjectRepository(UserEntity)
    public readonly userRepository: Repository<UserEntity>,
    @InjectRepository(ProjecMemberEntity)
    public readonly projectMemberRepository: Repository<ProjecMemberEntity>,
    public readonly validatorService: ValidatorService,
    public readonly awsS3Service: AwsS3Service,
    public readonly moduleRef: ModuleRef,
  ) { }

  onModuleInit(): void {
    this.authService = this.moduleRef.get(AuthService, {
      strict: false,
    });
    this.appConfigService = this.moduleRef.get(AppConfigService, {
      strict: false,
    });
  }

  /**
   * Find single user
   */
  async findOne(
    findData: FindOptionsWhere<UserEntity>,
    relations?: string[],
  ): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      relations,
      where: findData,
    });
    return user;
  }

  /**
   * Find single user by email
   */
  async findUserByEmail(
    email: string,
    relations?: string[],
  ): Promise<UserEntity> {
    const queryBuilder = this.userRepository.createQueryBuilder("user");
    relations?.forEach((relation) => {
      queryBuilder.leftJoinAndSelect(`user.${relation}`, relation);
    });

    const user = await queryBuilder
      .where("user.email = :email", { email })
      .getOne();
    return user;
  }

  /**
   * Find single user by userid
   */
  async findUserById(id: string, relation?: string): Promise<UserEntity> {
    const queryBuilder = this.userRepository.createQueryBuilder("user");
    if (relation) {
      queryBuilder.leftJoinAndSelect(`user.${relation}`, relation);
    }
    const user = await queryBuilder.where("user.id = :id", { id }).getOne();
    return user;
  }

  async getUsers(pageOptionsDto: UsersPageOptionsDto): Promise<UsersPageDto> {
    const queryBuilder = this.userRepository
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.organization", "organization");
    const [users, usersCount] = await queryBuilder
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.take)
      .orderBy("user.updatedAt", pageOptionsDto.order)
      .getManyAndCount();

    const pageMetaDto = new PageMetaDto({
      pageOptionsDto,
      itemCount: usersCount,
    });
    return new UsersPageDto(users.toDtos(), pageMetaDto);
  }

  async getCounts(user: UserEntity): Promise<DashboardCountsDto> {
    const userData = await this.userRepository
      .createQueryBuilder("users")
      .where("users.id = :userId", { userId: user.id })
      .leftJoinAndSelect("users.organization", "organization")
      .leftJoinAndSelect("organization.projects", "projects")
      .leftJoinAndSelect(
        "projects.testcases",
        "testcases",
        "testcases.deletedAt Is NULL",
      )
      .getOne();
    const projectsCount = userData.organization.projects.length;
    let testcasesCount = 0;
    userData.organization.projects.forEach((project) => {
      testcasesCount += project.testcases.length;
    });
    return new DashboardCountsDto({
      projects: projectsCount,
      testCases: testcasesCount,
    });
  }

  /**
   * Internal method to get all members in organization
   */

  async getAllMemebersInOrganization(
    pageOptionsDto: UsersPageOptionsDto,
    organizationId: string,
    currentLoggedInUser: UserEntity,
  ): Promise<UsersPageDto> {
    const queryBuilder = await this.userRepository
      .createQueryBuilder("members")
      .leftJoinAndSelect("members.organization", "organization")
      .where(
        "members.organization_id = :orgId and members.id <> :userId and members.archived_by IS NULL",
        {
          orgId: organizationId,
          userId: currentLoggedInUser.id,
        },
      );

    const [members, membersCount] = await queryBuilder
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.take)
      .orderBy("members.updatedAt", pageOptionsDto.order)
      .getManyAndCount();

    const pageMetaDto = new PageMetaDto({
      pageOptionsDto,
      itemCount: membersCount,
    });
    return new UsersPageDto(members.toDtos(), pageMetaDto);
  }

  /**
   * Internal method to get archived members in organization
   */

  async getArchivedMemebersInOrganization(
    pageOptionsDto: UsersPageOptionsDto,
    organizationId: string,
    currentLoggedInUser: UserEntity,
  ): Promise<UsersPageDto> {
    const queryBuilder = await this.userRepository
      .createQueryBuilder("members")
      .leftJoinAndSelect("members.organization", "organization")
      .withDeleted()
      .where(
        "organization.id = :orgId and members.id <> :userId and members.archived_by IS NOT NULL",
        {
          orgId: organizationId,
          userId: currentLoggedInUser.id,
        },
      );

    const [members, membersCount] = await queryBuilder
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.take)
      .orderBy("members.updatedAt", pageOptionsDto.order)
      .getManyAndCount();

    const pageMetaDto = new PageMetaDto({
      pageOptionsDto,
      itemCount: membersCount,
    });
    return new UsersPageDto(members.toDtos(), pageMetaDto);
  }

  /**
   * Internal method to get favorites projects of users
   * in an organization
   */
  async getFavoriteProjects(
    projectIds: string[],
    currentLoggedInUser: UserEntity,
  ) {
    if (!projectIds.length)
      throw new NotFoundException("translations.RECORD_NOT_FOUND");
    const user = await this.userRepository
      .createQueryBuilder("users")
      .innerJoinAndSelect(
        "users.favoriteProjects",
        "favoriteProject",
        "users.id =:userId AND favoriteProject.id IN (:...projectIds)",
        {
          userId: currentLoggedInUser.id,
          projectIds,
        },
      )
      .getMany();
    if (user[0] && user[0].favoriteProjects) {
      return user[0].favoriteProjects;
    }
  }

  /**
   * Internal method to get organization admin by organization id
   */
  async getOrgAdminByOrgId(organizationId: string): Promise<UserEntity> {
    const admin = await this.userRepository
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.organization", "organization")
      .where("organization.id = :organizationId", {
        organizationId,
      })
      .andWhere("user.roleId = :roleId", {
        roleId: RoleId.ORGADMIN,
      })
      .getOne();

    if (!admin) {
      return null;
    }
    return admin;
  }

  async getProjectUnAssignedMember(organizationId, projectId) {
    try {
      return await this.userRepository
        .createQueryBuilder("user")
        .select(["user.id", "user.firstName", "user.lastName", "user.email"])
        .where({ organization_id: organizationId, roleId: RoleId.MEMBER })
        .andWhere(
          `(select count(*) from project_members p where p.project_id = '${projectId}' and user.id = p.user_id) <= 0`,
        )
        .getMany();
    } catch (err) {
      return err;
    }
  }

  async getProjectAssignedMember(organizationId, projectId) {
    try {
      return await this.userRepository
        .createQueryBuilder("user")
        .select(["user.id", "user.firstName", "user.lastName", "user.email"])
        .where({ organization_id: organizationId, roleId: RoleId.MEMBER })
        .andWhere(
          `(select count(*) from project_members p where p.project_id = '${projectId}' and user.id = p.user_id) > 0`,
        )
        .getMany();
    } catch (err) {
      return err;
    }
  }

  async checkProjectAccess(projectId, userId) {
    try {
      const project = await this.projectMemberRepository.findOne({
        where: { projectId, userId },
      });
      return !!project;
    } catch (err) {
      return false;
    }
  }

  async getAllUsersByIds(membersIds) {
    try {
      const Users = await this.userRepository
        .createQueryBuilder("members")
        .where("members.id IN (:...membersIds)", { membersIds })
        .getMany();
      return Users;
    } catch (error) {
      return false;
    }
  }

  async getUserToAssignedOnProjects(
    userId: string,
    orgId: string,
  ): Promise<any> {
    return await this.projectMemberRepository
      .createQueryBuilder("project_member")
      .select()
      .where(
        "project_member.user_id =:userId and project_member.organization_id =:orgId",
        { userId: userId, orgId: orgId },
      )
      .getMany();
  }

  // internal use
  async deleteUserToAssignedOnProjects(projectMembers): Promise<any> {
    for (const projectMember of projectMembers) {
      await this.projectMemberRepository.remove(projectMember);
    }
  }
}
