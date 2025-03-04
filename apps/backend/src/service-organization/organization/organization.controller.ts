import {
  Controller,
  Get,
  Post,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
  ValidationPipe,
  UseFilters,
  Body,
  Put,
  Param,
  Req,
  Request,
  Delete,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiResponse,
  ApiTags,
  ApiOkResponse,
} from "@nestjs/swagger";

import { UUIDCheckPipe } from "../../common/pipes/uuid-check.pipe";
import { AuthUser } from "../../decorators/auth-user.decorator";
import { AuthGuard } from "../../guards/auth.guard";
import { OrganizationsPageDto } from "./dto/OrganizationsPageDto";
import { OrganizationsPageOptionsDto } from "./dto/OrganizationsPageOptionsDto";
import { OrganizationService } from "./organization.service";
import { ResponseSuccess } from "../../common/dto/SuccessResponseDto";
import { UserEntity } from "../../service-users/user/user.entity";
import { ExceptionResponseFilter } from "../../common/filters/exception-response.filter";
import { AddOrganizationMemberDto } from "./dto/AddOrganizationMemberDto";
import { AddMultipleMembersOrganizationDto } from "./dto/AddMultipleMembersOrganizationDto";
import { UsersPageDto as MembersPageDto } from "../../service-users/user/dto/UsersPageDto";
import { UsersPageOptionsDto as MembersPageOptionsDto } from "../../service-users/user/dto/UsersPageOptionsDto";
import { UpdateOrganizationMemberDto } from "./dto/UpdateOrganizationMemberDto";
import { OrganizationListDto } from "./dto/OrganizationListDto";
import { ProjectDetailsDto } from "../project/dto/ProjectDetailsDto";
import { ProjectListPageOptionsDto } from "../project/dto/ProjectListPageOptionDto";
import { SearchOptionsDto } from "./dto/SearchOptionsDto";
import { SubscriptionAuthStatus } from "../../decorators/subscription-status.decorator";
import { PermissionsGuard } from "../../guards/permission.guard";
import { Permissions } from "../../decorators/permission.decorator";
import { Permission } from "../../common/constants/permissions";
import { OrgSubscriptionStatus } from "../../common/enums/org-subscription-status";
import { SubscriptionAuthGuard } from "../../guards/org.subscription.guard";
import { UpdateOrganizationStatusDto } from "./dto/UpdateOrganizationStatusDto";
import { AddMemberDto } from "../project/members/dto/addMember.dto";
import { ResponseError } from "../../common/dto/ErrorResponseDto";

@Controller("organizations")
@ApiTags("organizations")
@UseGuards(AuthGuard)
@UseFilters(ExceptionResponseFilter)
@ApiBearerAuth()
export class OrganizationController {
  constructor(private _organizationService: OrganizationService) { }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Get organizations list",
    type: OrganizationsPageDto,
  })
  async getOrganizations(
    @Query(new ValidationPipe({ transform: true }))
    pageOptionsDto: OrganizationsPageOptionsDto,
    @AuthUser() user: UserEntity,
  ): Promise<ResponseSuccess> {
    const organizations = await this._organizationService.getOrganizations(
      pageOptionsDto,
      user,
    );
    return new ResponseSuccess("translations.LIST_ORG", organizations);
  }

  // @todo When a user registers with an Orgnization, Make them admin and add members as Role users thereafter for that Organization
  @Post("/members")
  @UseGuards(SubscriptionAuthGuard, PermissionsGuard)
  @Permissions(Permission.ADD_MEMBERS)
  @SubscriptionAuthStatus(
    OrgSubscriptionStatus.active,
    OrgSubscriptionStatus.freeTrial,
    OrgSubscriptionStatus.cancelAtPeriodEnd,
  )
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Add member to organization",
    type: AddOrganizationMemberDto,
  })
  async addMemberInOrganization(
    @Req() request: Request,
    @Body(new ValidationPipe({ transform: true }))
    addOrganizationMember: AddOrganizationMemberDto,
    @AuthUser() user: UserEntity,
  ): Promise<ResponseSuccess> {
    const lang = request.headers["accept-language"];
    const organizations =
      await this._organizationService.addMemberInOrganization(
        addOrganizationMember,
        user,
        lang,
      );
    return new ResponseSuccess("translations.ADD_MEMBER", organizations);
  }

  @Get("/members")
  @HttpCode(HttpStatus.OK)
  @UseGuards(SubscriptionAuthGuard, PermissionsGuard)
  @Permissions(Permission.GET_MEMBERS)
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Get all members of the organization",
    type: MembersPageDto,
  })
  async getAllMembers(
    @Query(new ValidationPipe({ transform: true }))
    pageOptionsDto: MembersPageOptionsDto,
    @AuthUser() user: UserEntity,
  ): Promise<ResponseSuccess> {
    const organizations = await this._organizationService.getAllMembers(
      pageOptionsDto,
      user,
    );
    return new ResponseSuccess("translations.LIST_MEMBERS", organizations);
  }

  @Get("/archive/members")
  @HttpCode(HttpStatus.OK)
  @UseGuards(SubscriptionAuthGuard, PermissionsGuard)
  @Permissions(Permission.GET_ARCHIVED_USERS)
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Get archived members of the organization",
    type: MembersPageDto,
  })
  async getArchivedMembers(
    @Query(new ValidationPipe({ transform: true }))
    pageOptionsDto: MembersPageOptionsDto,
    @AuthUser() user: UserEntity,
  ): Promise<ResponseSuccess> {
    const organizations = await this._organizationService.getArchivedMembers(
      pageOptionsDto,
      user,
    );
    return new ResponseSuccess(
      "translations.LIST_ARCHIVED_MEMBERS",
      organizations,
    );
  }

  /**
   * Get organization details with all members in it
   */
  @Get("/members/all/:id")
  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @Permissions(Permission.GET_MEMBERS)
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Get organization detail with all members in it",
    type: OrganizationListDto,
  })
  async getOrganization(
    @AuthUser() user: UserEntity,
    @Param("id") projectId: string,
  ): Promise<ResponseSuccess> {
    const organizations = await this._organizationService.getOrganization(
      user,
      projectId,
    );
    return new ResponseSuccess(
      "translations.ORG_DETAILS_WITH_LISTING",
      organizations,
    );
  }

  /**
   * Route for Superadmin to update members info
   */
  @Put("/members/:id")
  @UseGuards(PermissionsGuard)
  @Permissions(Permission.UPDATE_MEMBER)
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Update ogranization member information",
    type: UpdateOrganizationMemberDto,
  })
  async updateMemberInOrganization(
    @Req() request: Request,
    @Body() updateOrganizationMemberDto: UpdateOrganizationMemberDto,
    @Param("id", UUIDCheckPipe) memberId: string,
    @AuthUser() user: UserEntity,
  ): Promise<ResponseSuccess> {
    const lang = request.headers["accept-language"];
    const member = await this._organizationService.updateMemberInOrganization(
      updateOrganizationMemberDto,
      memberId,
      user,
      lang,
    );
    return new ResponseSuccess("translations.MEMBER_UPDATE", member);
  }

  /**
   * Route for Superadmin to update members info
   */
  @Put("/subscription-status")
  @UseGuards(PermissionsGuard)
  @Permissions(Permission.UPDATE_SUBSCRIPTION_STATUS)
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Update ogranization status",
  })
  async updateOrganizationStatus(
    @AuthUser() user: UserEntity,
    @Body() updateOrganizationStatusDto: UpdateOrganizationStatusDto,
  ): Promise<ResponseSuccess> {
    const { organization } = user;
    const status = await this._organizationService.updateOrgSubscriptionStatus(
      organization.id,
      updateOrganizationStatusDto.subscriptionStatus,
    );
    return new ResponseSuccess("", status);
  }

  /**
   * Resend reset password link to member's email
   */
  @Post("/members/:id/send-reset-link")
  @UseGuards(PermissionsGuard)
  @Permissions(Permission.RESET_PASSWORD_LINK)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: "Resend reset password link to member's email",
  })
  async resendResetPasswordLink(
    @Req() request: Request,
    @Param("id", UUIDCheckPipe) memberId: string,
    @AuthUser() user: UserEntity,
  ): Promise<ResponseSuccess> {
    const lang = request.headers["accept-language"];
    await this._organizationService.resendResetPasswordLink(
      memberId,
      user,
      lang,
    );
    return new ResponseSuccess("translations.RESET_PASS_LINK_SENT", {});
  }

  /**
   * Add multiple new members at once
   */
  @Post("/members/multiple")
  @UseGuards(SubscriptionAuthGuard, PermissionsGuard)
  @Permissions(Permission.ADD_MEMBERS)
  @SubscriptionAuthStatus(
    OrgSubscriptionStatus.active,
    OrgSubscriptionStatus.freeTrial,
    OrgSubscriptionStatus.cancelAtPeriodEnd,
  )
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Add multiple new members to the organization",
    type: AddMultipleMembersOrganizationDto,
  })
  async addMultipleMembersInOrganization(
    @Req() request: Request,
    @Body()
    addMultipleMembersOrganizationDto: AddMultipleMembersOrganizationDto,
    @AuthUser() user: UserEntity,
  ): Promise<ResponseSuccess> {
    const lang = request.headers["accept-language"];
    const res =
      await this._organizationService.addMultipleMembersInOrganization(
        addMultipleMembersOrganizationDto,
        user,
        lang,
      );
    return new ResponseSuccess("translations.ADD_MEMBERS", res);
  }

  /**
   * Get all projects in the organization with total active
   * test runs and milestones
   */
  @Get("/projects")
  @UseGuards(SubscriptionAuthGuard, PermissionsGuard)
  @Permissions(Permission.GET_PROJECT_LISTING)
  @SubscriptionAuthStatus(
    OrgSubscriptionStatus.active,
    OrgSubscriptionStatus.freeTrial,
    OrgSubscriptionStatus.cancelAtPeriodEnd,
  )
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      "Get all projects in the organization with total active test runs and milestones",
    type: ProjectDetailsDto,
  })
  async getAllProjects(@AuthUser() user: UserEntity): Promise<ResponseSuccess> {
    const res = await this._organizationService.getAllProjects(user);
    return new ResponseSuccess("translations.PROJECT_LIST_ORG", res);
  }

  /**
   * Get all archived projects in the organization
   */

  @Get("/archive/projects")
  @UseGuards(SubscriptionAuthGuard, PermissionsGuard)
  @Permissions(Permission.LIST_ARCHIVE_PROJECT)
  @SubscriptionAuthStatus(
    OrgSubscriptionStatus.active,
    OrgSubscriptionStatus.freeTrial,
    OrgSubscriptionStatus.cancelAtPeriodEnd,
  )
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Get all archived projects in the organization",
    type: ProjectDetailsDto,
  })
  async getArchivedProjects(
    @AuthUser() user: UserEntity,
  ): Promise<ResponseSuccess> {
    const res = await this._organizationService.getArchivedProjects(user);

    return new ResponseSuccess(
      "translations.ARCHIVED_PROJECT_LIST",
      res.toDtos(),
    );
  }

  /**
   * Get most active projects in the organization with total test changes
   */
  @Get("/active/projects")
  @UseGuards(SubscriptionAuthGuard, PermissionsGuard)
  @Permissions(Permission.GET_MOST_ACTIVE_PROJECTS)
  @SubscriptionAuthStatus(
    OrgSubscriptionStatus.active,
    OrgSubscriptionStatus.freeTrial,
    OrgSubscriptionStatus.cancelAtPeriodEnd,
  )
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      "Get most active projects in the organization with total test changes",
  })
  async getMostActiveProjects(
    @Query(new ValidationPipe({ transform: true }))
    pageOptionsDto: ProjectListPageOptionsDto,
    @AuthUser() user: UserEntity,
  ): Promise<ResponseSuccess> {
    const res = await this._organizationService.getMostActiveProjects(
      pageOptionsDto,
      user,
    );
    return new ResponseSuccess("translations.MOST_ACTIVE_PROJECT", res);
  }

  /**
   * Get TestCase, TestRuns, Milestones and projects search results
   */
  @Get("/search")
  @UseGuards(SubscriptionAuthGuard, PermissionsGuard)
  @Permissions(Permission.GET_SEARCH_RESULTS)
  @SubscriptionAuthStatus(
    OrgSubscriptionStatus.active,
    OrgSubscriptionStatus.freeTrial,
    OrgSubscriptionStatus.cancelAtPeriodEnd,
  )
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      "Get TestCase, TestRuns, Milestones and projects search results",
  })
  async getSearchResults(
    @Query() searchOptionsDto: SearchOptionsDto,
    @AuthUser() user: UserEntity,
  ): Promise<ResponseSuccess> {
    const res = await this._organizationService.getSearchResults(
      searchOptionsDto,
      user,
    );
    return new ResponseSuccess("translations.SEARCH_RESULTS", res);
  }

  /**
   * Get Organization Members
   */
  @Get("/unassigned-members/:projectId")
  @UseGuards(SubscriptionAuthGuard, PermissionsGuard)
  @Permissions(Permission.GET_PROJECT_MEMBER)
  @SubscriptionAuthStatus(
    OrgSubscriptionStatus.active,
    OrgSubscriptionStatus.freeTrial,
    OrgSubscriptionStatus.cancelAtPeriodEnd,
  )
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Get unassigned members",
  })
  async getUnassignedMembers(
    @AuthUser() user: UserEntity,
    @Param("projectId") projectId: string,
  ): Promise<ResponseSuccess> {
    const res = await this._organizationService.getProjectUnAssignedMember(
      user.organization_id,
      projectId,
    );
    return new ResponseSuccess("Organizaton members", res);
  }

  /**
   * Add Organization Members
   */
  @Post("/assign-project-member")
  @UseGuards(SubscriptionAuthGuard, PermissionsGuard)
  @Permissions(Permission.ADD_PROJECT_MEMBER)
  @SubscriptionAuthStatus(
    OrgSubscriptionStatus.active,
    OrgSubscriptionStatus.freeTrial,
    OrgSubscriptionStatus.cancelAtPeriodEnd,
  )
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Save project members",
  })
  async addProjectMember(
    @AuthUser() user: UserEntity,
    @Body() addMemberDto: AddMemberDto,
  ): Promise<ResponseSuccess> {
    const res = await this._organizationService.addProjectMember(
      user.organization_id,
      addMemberDto,
    );
    return new ResponseSuccess("Organizaton members", res);
  }

  @Get("/assigned-members/:projectId")
  @UseGuards(SubscriptionAuthGuard, PermissionsGuard)
  @Permissions(Permission.GET_PROJECT_MEMBER)
  @SubscriptionAuthStatus(
    OrgSubscriptionStatus.active,
    OrgSubscriptionStatus.freeTrial,
    OrgSubscriptionStatus.cancelAtPeriodEnd,
  )
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Get assigned members",
  })
  async getOrganizationUser(
    @AuthUser() user: UserEntity,
    @Param("projectId") projectId: string,
  ): Promise<ResponseSuccess> {
    const res = await this._organizationService.getProjectAssignedMember(
      user.organization_id,
      projectId,
    );
    return new ResponseSuccess("Organizaton members", res);
  }

  @Delete("/project-member/:projectId/:userId")
  @UseGuards(SubscriptionAuthGuard, PermissionsGuard)
  @Permissions(Permission.DELETE_PROJECT_MEMBER)
  @SubscriptionAuthStatus(
    OrgSubscriptionStatus.active,
    OrgSubscriptionStatus.freeTrial,
    OrgSubscriptionStatus.cancelAtPeriodEnd,
  )
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Delete assigned members",
  })
  async RemoveProjectMember(
    @AuthUser() user: UserEntity,
    @Param("projectId") projectId: string,
    @Param("userId") userId: string,
  ): Promise<ResponseSuccess> {
    const deleted = await this._organizationService.projectMemberDelete(
      user.organization_id,
      projectId,
      userId,
    );
    if (!deleted) return new ResponseError("No project found");
    return new ResponseSuccess("project member deleted");
  }
}
