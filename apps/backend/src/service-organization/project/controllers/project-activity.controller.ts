import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
  ValidationPipe,
  UseFilters,
  Param,
} from "@nestjs/common";
import { ApiBearerAuth, ApiResponse, ApiTags } from "@nestjs/swagger";

import { AuthUser } from "../../../decorators/auth-user.decorator";
import { UserEntity } from "../../../service-users/user/user.entity";
import { AuthGuard } from "../../../guards/auth.guard";
import { ProjectReadService } from "../services/read.service";
import { ResponseSuccess } from "../../../common/dto/SuccessResponseDto";
import { UUIDCheckPipe } from "../../../common/pipes/uuid-check.pipe";
import { ExceptionResponseFilter } from "../../../common/filters/exception-response.filter";
import { MilestoneDto } from "../../milestone/dto/MilestoneDto";
import { ActivityDto } from "../activity/dto/ActivityDto";
import { ActivityPageOptionsDto } from "../activity/dto/ActivityPageOptionsDto";
import { ActivityService } from "../activity/activity.service";
import { SubscriptionAuthStatus } from "../../../decorators/subscription-status.decorator";
import { PermissionsGuard } from "../../../guards/permission.guard";
import { Permissions } from "../../../decorators/permission.decorator";
import { Permission } from "../../../common/constants/permissions";
import { OrgSubscriptionStatus } from "../../../common/enums/org-subscription-status";
import { SubscriptionAuthGuard } from "../../../guards/org.subscription.guard";
import { ProjectAuthGuard } from "../../../guards/projectAuth.guard";

@Controller("projects")
@ApiTags("projects")
@UseFilters(ExceptionResponseFilter)
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class ActivityRelatedProjectController {
  constructor(
    private _projectReadService: ProjectReadService,
    private activityService: ActivityService,
  ) {}
  
  /*
   *  Get All open milestones for Activity
   */
  @Get("/:id/activity/milestones")
  @UseGuards(SubscriptionAuthGuard, PermissionsGuard, ProjectAuthGuard)
  @Permissions(Permission.GET_ACTIVITY_MILESTONES)
  @SubscriptionAuthStatus(
    OrgSubscriptionStatus.active,
    OrgSubscriptionStatus.freeTrial,
    OrgSubscriptionStatus.cancelAtPeriodEnd,
  )
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: "get all open milestones of a project",
    type: MilestoneDto,
  })
  async getActivityMilestones(
    @Param("id", UUIDCheckPipe) projectId: string,
    @Query(
      new ValidationPipe({
        transform: true,
      }),
    )
    pageOptionsDto: ActivityPageOptionsDto,
    @AuthUser() user: UserEntity,
  ): Promise<ResponseSuccess> {
    const milestones = await this._projectReadService.getActivityMilestones(
      projectId,
      pageOptionsDto,
      user,
    );
    return new ResponseSuccess(
      "translations.OPEN_ACTIVITIES_MILESTONES",
      milestones,
    );
  }

  /**
   * Get all activities for a project
   */
  @Get("/:id/activities")
  @UseGuards(SubscriptionAuthGuard, PermissionsGuard, ProjectAuthGuard)
  @Permissions(Permission.GET_PROJECT_ACTIVITIES)
  @SubscriptionAuthStatus(
    OrgSubscriptionStatus.active,
    OrgSubscriptionStatus.freeTrial,
    OrgSubscriptionStatus.cancelAtPeriodEnd,
  )
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    type: ActivityDto,
    description: "Get all activities for a project",
  })
  async getProjectActivities(
    @Param("id", UUIDCheckPipe) projectId: string,
    @Query(
      new ValidationPipe({
        transform: true,
      }),
    )
    pageOptionsDto: ActivityPageOptionsDto,
    @AuthUser() user: UserEntity,
  ): Promise<ResponseSuccess> {
    const activities = await this.activityService.getProjectActivities(
      projectId,
      pageOptionsDto,
      user,
    );
    return new ResponseSuccess(
      "translations.ACTIVITIES_TESTSUITE_MILESTONE",
      activities,
    );
  }

  /**
   * Get test case result activities for a project
   */
  @Get("/:id/activities/test-results")
  @UseGuards(SubscriptionAuthGuard, PermissionsGuard, ProjectAuthGuard)
  @Permissions(Permission.GET_TESTCASE_RESULT_ACTIVITIES)
  @SubscriptionAuthStatus(
    OrgSubscriptionStatus.active,
    OrgSubscriptionStatus.freeTrial,
    OrgSubscriptionStatus.cancelAtPeriodEnd,
  )
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    type: ActivityDto,
    description: "Get test case result activities for a project",
  })
  async getTestCaseResultActivities(
    @Param("id", UUIDCheckPipe) projectId: string,
    @Query(
      new ValidationPipe({
        transform: true,
      }),
    )
    pageOptionsDto: ActivityPageOptionsDto,
    @AuthUser() user: UserEntity,
  ): Promise<ResponseSuccess> {
    const activities = await this.activityService.getTestCaseResultActivities(
      projectId,
      pageOptionsDto,
      user,
    );
    return new ResponseSuccess(
      "translations.ACTIVITY_TESTCASE_RESULTS",
      activities,
    );
  }

  /**
   * Get all testcase changes activities for a project
   */
  @Get("/:id/activities/test-changes")
  @UseGuards(SubscriptionAuthGuard, PermissionsGuard, ProjectAuthGuard)
  @Permissions(Permission.GET_TESTCASE_CHANGES_ACTIVITIES)
  @SubscriptionAuthStatus(
    OrgSubscriptionStatus.active,
    OrgSubscriptionStatus.freeTrial,
    OrgSubscriptionStatus.cancelAtPeriodEnd,
  )
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    type: ActivityDto,
    description: "Get all testcase changes activities for a project",
  })
  async getTestCaseChangesActivities(
    @Param("id", UUIDCheckPipe) projectId: string,
    @Query(
      new ValidationPipe({
        transform: true,
      }),
    )
    pageOptionsDto: ActivityPageOptionsDto,
    @AuthUser() user: UserEntity,
  ): Promise<ResponseSuccess> {
    const activities =
      await this.activityService.getAllTestCaseChangesActivities(
        projectId,
        pageOptionsDto,
        user,
      );
    return new ResponseSuccess(
      "translations.ACTIVITY_TESTCASE_CHANGES",
      activities,
    );
  }
}
