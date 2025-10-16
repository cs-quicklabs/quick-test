import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";

import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AwsS3Service } from "../../../shared/services/aws-s3.service";
import { ValidatorService } from "../../../shared/services/validator.service";
import { UserEntity } from "../user.entity";

import { AuthService } from "../../../service-auth/auth/auth.service";
import { ProjectReadService } from "../../../service-organization/project/services/read.service";

import { AppConfigService } from "../../../shared/services/app.config.service";
import { UserReadService } from "./read.service";
import { ProjecMemberEntity } from "../../../service-organization/project/members/projectMember.entity";
import { TestCaseService } from "./../../../service-organization/test-case/test-case.service";
import { TestSuiteService } from "./../../../service-organization/test-suite/test-suite.service";
import { ActivityService } from "../../../service-organization/project/activity/activity.service";

@Injectable()
export class UserDeleteService {
  public authService: AuthService;

  public projectReadService: ProjectReadService;

  public appConfigService: AppConfigService;

  public userReadService: UserReadService;

  public testCaseService: TestCaseService;

  public testSuitesService: TestSuiteService;

  public activityService: ActivityService;

  constructor(
    @InjectRepository(UserEntity)
    public readonly userRepository: Repository<UserEntity>,
    @InjectRepository(ProjecMemberEntity)
    public readonly projectMemberRepository: Repository<ProjecMemberEntity>,
    public readonly validatorService: ValidatorService,
    public readonly awsS3Service: AwsS3Service,
    public readonly moduleRef: ModuleRef,
  ) {}

  onModuleInit(): void {
    this.authService = this.moduleRef.get(AuthService, {
      strict: false,
    });
    this.projectReadService = this.moduleRef.get(ProjectReadService, {
      strict: false,
    });
    this.appConfigService = this.moduleRef.get(AppConfigService, {
      strict: false,
    });
    this.userReadService = this.moduleRef.get(UserReadService, {
      strict: false,
    });
    this.testCaseService = this.moduleRef.get(TestCaseService, {
      strict: false,
    });

    this.testSuitesService = this.moduleRef.get(TestSuiteService, {
      strict: false,
    });

    this.activityService = this.moduleRef.get(ActivityService, {
      strict: false,
    });
  }

  /**
   * Internal method to delete favorite project for user
   */
  async deleteFavoriteProject(
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
    if (!checkFavoriteProjectExists) return true;

    user.favoriteProjects = user.favoriteProjects.filter(
      (favoriteProject) => favoriteProject.id !== projectId,
    );
    await this.userRepository.save(user);
    return true;
  }

  /* Archive a user */

  async archiveUser(
    userId: string,
    currentLoggedInUser: UserEntity,
  ): Promise<boolean> {
    const user = await this.userReadService.findOne({ id: userId });
    if (!user) throw new NotFoundException("translations.RECORD_NOT_FOUND");
    const checkSameOrganization =
      user.organization_id === currentLoggedInUser.organization_id;
    if (!checkSameOrganization || user.roleId < currentLoggedInUser.roleId)
      throw new ForbiddenException("translations.NO_UPDATE_PERMISSION");

    user.archived_by = currentLoggedInUser.id;
    //user.deletedAt = new Date();
    await this.userRepository.save(user);
    await this.userRepository.softRemove(user);
    return true;
  }

  /* Delete a user */

  async deleteUser(
    userId: string,
    currentLoggedInUser: UserEntity,
  ): Promise<boolean> {
    const user = await this.userRepository.findOne({
      relations: ["archivedByUser", "organization"],
      where: {
        id: userId,
      },
      withDeleted: true,
    });

    if (!user) {
      throw new NotFoundException("translations.RECORD_NOT_FOUND");
    }
    const checkSameOrganization =
      user.organization_id === currentLoggedInUser.organization_id;

    if (!checkSameOrganization || user.roleId < currentLoggedInUser.roleId) {
      throw new ForbiddenException("translations.NO_UPDATE_PERMISSION");
    }

    const getUserActivities =
      await this.activityService.getUserActivitiesByUserId(user.id);

    // update testCase
    // update test suites
    // remove from member_projects
    // update activities

    const membersTestCases = await this.testCaseService.getTestCasesByUserId(
      user.id,
    );
    for (const memberTestCase of membersTestCases) {
      await this.testCaseService.editTestCase(
        memberTestCase,
        memberTestCase.id,
        memberTestCase.project.id,
        memberTestCase.section.id,
        user.archivedByUser,
        true,
      );
    }

    const editMemberTestCases =
      await this.testCaseService.getEditTestCasesByUserId(user.id);

    for (const updatedmemberTestCase of editMemberTestCases) {
      await this.testCaseService.editTestCase(
        updatedmemberTestCase,
        updatedmemberTestCase.id,
        updatedmemberTestCase.project.id,
        updatedmemberTestCase.section.id,
        user.archivedByUser,
      );
    }

    const memberAssignedTestSuites =
      await this.testSuitesService.getAssignedTestCaseSuitesByMemberId(user.id);

    for (const memberAssignedTestSuite of memberAssignedTestSuites) {
      delete memberAssignedTestSuite.assignedTo;
      memberAssignedTestSuite.assignTo = user.archivedByUser.id;
      await this.testSuitesService.editTestSuite(
        memberAssignedTestSuite,
        memberAssignedTestSuite.id,
        user,
      );
    }

    const memberCreatedTestSuites =
      await this.testSuitesService.getCreatedTestCaseSuitesByMemberId(user.id);
    for (const memberCreatedTestSuite of memberCreatedTestSuites) {
      await this.testSuitesService.editTestSuite(
        memberCreatedTestSuite,
        memberCreatedTestSuite.id,
        user,
        true,
      );
    }

    const memberAssignedOnProjects =
      await this.userReadService.getUserToAssignedOnProjects(
        user.id,
        user.organization.id,
      );
    if (memberAssignedOnProjects) {
      await this.userReadService.deleteUserToAssignedOnProjects(
        memberAssignedOnProjects,
      );
    }

    if (getUserActivities) {
      for (const userActivity of getUserActivities) {
        userActivity.userId = user.archivedByUser.id;
      }
      await this.activityService.updateUserActivtiesByUserId(getUserActivities);
    }
    await this.userRepository.remove(user);
    return true;
  }

  /* Delete project Member */

  async deleteProjectMember(
    organizationId: string,
    projectId: string,
    userId: string,
  ): Promise<boolean> {
    try {
      const member = await this.projectMemberRepository.findOne({
        where: { userId, projectId, organizationId },
      });
      if (!member) return false;
      await this.projectMemberRepository.delete({
        userId,
        projectId,
        organizationId,
      });
      return true;
    } catch (err) {
      return err;
    }
  }
}
