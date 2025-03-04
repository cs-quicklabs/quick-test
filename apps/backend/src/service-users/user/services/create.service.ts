import {
  Injectable,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";

import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AwsS3Service } from "../../../shared/services/aws-s3.service";
import { ValidatorService } from "../../../shared/services/validator.service";
import { UserRegisterDto } from "../../../service-auth/auth/dto/UserRegisterDto";
import { UserEntity } from "../user.entity";
import { ProjecMemberEntity } from "../../../service-organization/project/members/projectMember.entity";

import { OrganizationService } from "../../../service-organization/organization/organization.service";
import { OrganizationEntity } from "../../../service-organization/organization/organization.entity";
import { ForgottenPasswordEntity } from "../forgotten-password-reqs.entity";
import { VerificationDto } from "../dto/VerificationDto";
import { UtilsService } from "../../../_helpers/utils.service";
import { RoleType } from "../../../common/enums/role-type";
import { AddOrganizationMemberDto } from "../../../service-organization/organization/dto/AddOrganizationMemberDto";

import { AuthService } from "../../../service-auth/auth/auth.service";

import { AppConfigService } from "../../../shared/services/app.config.service";
import { EmailVerifyTokenEntity } from "../email-verify-token.entity";
import { UserReadService } from "./read.service";
import { ProjectReadService } from "../../../service-organization/project/services/read.service";
import { RoleService } from "../../../service-role/role.service";
import { UserTitle } from "../../../common/enums/user-titles";
import { RoleId } from "../../../common/enums/role-id";
import { AddMemberDto } from "src/service-organization/project/members/dto/addMember.dto";

@Injectable()
export class UserCreateService {
  public authService: AuthService;

  public appConfigService: AppConfigService;

  public userReadService: UserReadService;

  public projectReadService: ProjectReadService;

  constructor(
    private readonly roleService: RoleService,
    @InjectRepository(UserEntity)
    public readonly userRepository: Repository<UserEntity>,
    @InjectRepository(ProjecMemberEntity)
    public readonly projectMemberRepository: Repository<ProjecMemberEntity>,
    public readonly validatorService: ValidatorService,
    public readonly awsS3Service: AwsS3Service,
    private readonly organizationService: OrganizationService,
    public readonly moduleRef: ModuleRef,
    @InjectRepository(ForgottenPasswordEntity)
    public readonly forgottenPasswordRepository: Repository<ForgottenPasswordEntity>,
    @InjectRepository(EmailVerifyTokenEntity)
    private readonly emailVerifyTokenRepository: Repository<EmailVerifyTokenEntity>,
  ) { }

  onModuleInit(): void {
    this.authService = this.moduleRef.get(AuthService, {
      strict: false,
    });
    this.appConfigService = this.moduleRef.get(AppConfigService, {
      strict: false,
    });
    this.userReadService = this.moduleRef.get(UserReadService, {
      strict: false,
    });
    this.projectReadService = this.moduleRef.get(ProjectReadService, {
      strict: false,
    });
  }

  async admin(userRegisterDto: UserRegisterDto): Promise<UserEntity> {
    userRegisterDto.firstName = UtilsService.properCase(
      userRegisterDto.firstName,
    );
    const role = RoleType.SUPERADMIN;
    const check = await this.userRepository
      .createQueryBuilder("roles")
      .where("roles.roleType = :roleType", { role })
      .getOneOrFail();
    if (check) throw new ConflictException("translations.ONE_ADMIN");

    const user = this.userRepository.create(userRegisterDto);
    user.role = await this.roleService.findByRoleType(RoleType.SUPERADMIN);
    const usersData = await this.userRepository.save(user);
    return usersData;
  }

  async createUser(
    userRegisterDto: UserRegisterDto,
    organizationName: string,
    lang: string,
  ): Promise<UserEntity> {
    if (!organizationName)
      throw new BadRequestException("translations.ORGANIZATION_NAME_REQUIRED");
    this.setUserRegisterDtoFields(userRegisterDto);
    const checkUser = await this.userRepository.exists({ where: { email: userRegisterDto.email } });
    if (checkUser) throw new ConflictException("translations.DUPLICATE_EMAIL");
    const organization = await this.organizationService.createOrganization({ name: organizationName });
    const role = await this.roleService.findByRoleType(RoleType.ORGADMIN);
    const user = this.userRepository.create({
      ...userRegisterDto,
      organization: organization,
      role: role,
      title: UserTitle.OWNER
    })
    const usersData = await this.userRepository.save(user);
    await this.authService.sendWelcomeNewUserEmail(user, lang);
    //await this.authService.sendFreeTrialStartMail(user,lang)
    return usersData;
  }

  setUserRegisterDtoFields(userRegisterDto: UserRegisterDto) {
    userRegisterDto.firstName = UtilsService.properCase(
      userRegisterDto.firstName,
    );
    userRegisterDto.email = UtilsService.lowerCase(userRegisterDto.email);
    if (userRegisterDto?.lastName) {
      userRegisterDto.lastName = UtilsService.properCase(
        userRegisterDto.lastName,
      );
    }
    if (userRegisterDto?.title) {
      userRegisterDto.title = UtilsService.properCase(userRegisterDto.title);
    }
    if (userRegisterDto.country) {
      userRegisterDto.country = UtilsService.properCase(
        userRegisterDto.country,
      );
    }
    if (userRegisterDto.state) {
      userRegisterDto.state = UtilsService.properCase(userRegisterDto.state);
    }
    if (userRegisterDto.city) {
      userRegisterDto.city = UtilsService.properCase(userRegisterDto.city);
    }
  }

  async createVerificationToken(email: string): Promise<VerificationDto> {
    const emailLowerCase = email?.trim().toLowerCase();
    let forgottenPasswordData = await this.forgottenPasswordRepository
      .createQueryBuilder("forgottenPasswordRequest")
      .where("forgottenPasswordRequest.email = :email", {
        email: emailLowerCase,
      })
      .getOne();
    if (!forgottenPasswordData) {
      // new token
      forgottenPasswordData = new ForgottenPasswordEntity();
      forgottenPasswordData.email = emailLowerCase;
      forgottenPasswordData.token = UtilsService.generateRandomString(120);
      forgottenPasswordData.timestamp = new Date();
      return this.forgottenPasswordRepository.save(forgottenPasswordData);
    }

    // overwrite existing
    forgottenPasswordData.email = emailLowerCase;
    forgottenPasswordData.token = UtilsService.generateRandomString(120);
    forgottenPasswordData.timestamp = new Date();
    return this.forgottenPasswordRepository.save(forgottenPasswordData);
  }

  /**
   * Internal method to generate email verification token
   */
  async createEmailVerificationToken(email: string): Promise<VerificationDto> {
    const emailLowerCase = email?.trim().toLowerCase();
    let emailVerifyToken = await this.emailVerifyTokenRepository
      .createQueryBuilder("emailVerifyToken")
      .where("emailVerifyToken.email = :email", {
        email: emailLowerCase,
      })
      .getOne();
    if (!emailVerifyToken) {
      // new token
      emailVerifyToken = new EmailVerifyTokenEntity();
      emailVerifyToken.email = emailLowerCase;
      emailVerifyToken.token = UtilsService.generateRandomString(120);
      emailVerifyToken.timestamp = new Date();
      return this.emailVerifyTokenRepository.save(emailVerifyToken);
    }
    // overwrite existing
    emailVerifyToken.email = emailLowerCase;
    emailVerifyToken.token = UtilsService.generateRandomString(120);
    emailVerifyToken.timestamp = new Date();
    return this.emailVerifyTokenRepository.save(emailVerifyToken);
  }

  /**
   * Internal method to add User in Organization
   */
  async addUserInOrganization(
    addOrganizationUserDto: AddOrganizationMemberDto,
    password: string,
    organization: OrganizationEntity,
    currentLoggedInUser: UserEntity,
    lang: string,
  ): Promise<UserEntity> {
    Object.assign(addOrganizationUserDto, { password });
    addOrganizationUserDto.firstName = UtilsService.properCase(
      addOrganizationUserDto.firstName,
    );
    addOrganizationUserDto.email = UtilsService.lowerCase(
      addOrganizationUserDto.email,
    );
    if (addOrganizationUserDto?.lastName) {
      addOrganizationUserDto.lastName = UtilsService.properCase(
        addOrganizationUserDto.lastName,
      );
    }

    const check = await this.userRepository
      .createQueryBuilder("user")
      .where("user.email = :email", { email: addOrganizationUserDto?.email })
      .getOne();
    if (check) throw new ConflictException("translations.DUPLICATE_EMAIL");

    if (currentLoggedInUser.roleId === RoleId.ADMIN) {
      const user = this.userRepository.create(addOrganizationUserDto);
      if (user.roleId !== RoleId.MEMBER) {
        throw new ForbiddenException("translations.NO_ADD_PERMISSION");
      }
      user.role = user.role = await this.roleService.findByRoleType(
        RoleType.MEMBER,
      );
      user.organization = organization;
      const usersData = await this.userRepository.save(user);
      this.authService.sendWelcomeMemberEmail(
        usersData,
        currentLoggedInUser,
        lang,
      );
      return usersData;
    }

    if (currentLoggedInUser.roleId === RoleId.ORGADMIN) {
      const user = this.userRepository.create(addOrganizationUserDto);
      user.organization = organization;
      user.role = await this.roleService.findRoleById(
        addOrganizationUserDto.roleId,
      );
      if (user.roleId === RoleId.ADMIN) {
        user.title = UserTitle.ADMIN;
      }
      const usersData = await this.userRepository.save(user);

      this.authService.sendWelcomeMemberEmail(
        usersData,
        currentLoggedInUser,
        lang,
      );
      return usersData;
    }
  }

  /**
   * Internal method to create favorite project for user
   */
  async createFavoriteProject(
    projectId: string,
    currentLoggedInUser: UserEntity,
  ): Promise<boolean> {
    const project = await this.projectReadService.findOne({
      id: projectId,
    });

    const user = await this.userReadService.findOne(
      {
        id: currentLoggedInUser.id,
      },
      ["favoriteProjects"],
    );

    const checkFavoriteProjectExists = user.favoriteProjects.find(
      (item) => item.id === project.id,
    );

    if (checkFavoriteProjectExists) {
      throw new BadRequestException("translations.DUPLICATE_FAVORITE_PROJECT");
    }

    user.favoriteProjects.push(project);
    await this.userRepository.save(user);

    return true;
  }

  async addProjectMember(organizationId, memberDto: AddMemberDto) {
    try {
      const { projectId, users } = memberDto;

      for (const userId of users) {
        const record = await this.projectMemberRepository.findOne({
          where: { projectId, userId },
        });
        if (record) continue;
        const member = new ProjecMemberEntity({ projectId, userId, organizationId });
        await this.projectMemberRepository.save(member);
      }
    } catch (err) {
      return err;
    }
  }
}
