import { Injectable } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PageMetaDto } from "../../../common/dto/PageMetaDto";
import { ActivityEntityType } from "../../../common/enums/activity-entity";
import { ActivityDto } from "./dto/ActivityDto";
import { MilestoneService } from "../../milestone/milestone.service";
import { ProjectReadService } from "../services/read.service";
import { TestSuiteService } from "../../test-suite/test-suite.service";
import { TestCaseResultService } from "../../test-suite/test-case-result/test-case-result.service";
import { TestCaseService } from "../../test-case/test-case.service";
import { ActivityPageOptionsDto } from "./dto/ActivityPageOptionsDto";
import { UserEntity } from "../../../service-users/user/user.entity";
import { UtilsService } from "../../../_helpers/utils.service";
import { ActivityDetailDto } from "./dto/ActivityDetailDto";
import { ActivityListDto } from "./dto/ActivityListDto";
import { ActivityEntity } from "./activity.entity";
import { Order } from "../../../common/enums/order";
import { TestCaseResultStatus } from "../../../common/enums/test-case-result-status";
import { ActivityListPageDto } from "./dto/ActivityListPageDto";
import { TestSuiteEntity } from "../../test-suite/test-suite.entity";
import { ProjectEntity } from "../project.entity";
import { TestCaseResultEntity } from "../../test-suite/test-case-result/test-case-result.entity";
import { MilestoneEntity } from "../../milestone/milestone.entity";
import { ActivityAction } from "../../../common/enums/activity-action";

@Injectable()
export class ActivityService {
  public milestoneService: MilestoneService;

  public projectReadService: ProjectReadService;

  public testSuiteService: TestSuiteService;

  public testCaseResultService: TestCaseResultService;

  public testCaseService: TestCaseService;

  constructor(
    @InjectRepository(ActivityEntity)
    private readonly activityRepository: Repository<ActivityEntity>,
    public readonly moduleRef: ModuleRef,
  ) {}

  onModuleInit(): void {
    this.milestoneService = this.moduleRef.get(MilestoneService, {
      strict: false,
    });
    this.projectReadService = this.moduleRef.get(ProjectReadService, {
      strict: false,
    });
    this.testSuiteService = this.moduleRef.get(TestSuiteService, {
      strict: false,
    });
    this.testCaseResultService = this.moduleRef.get(TestCaseResultService, {
      strict: false,
    });
    this.testCaseService = this.moduleRef.get(TestCaseService, {
      strict: false,
    });
  }

  /**
   * Get milestone and test runs activities for a project
   */
  async getProjectActivities(
    projectId: string,
    pageOptionsDto: ActivityPageOptionsDto,
    currentLoggedInUser: UserEntity,
  ): Promise<ActivityListDto> {
    await this.projectReadService.checkProjectForUser(
      projectId,
      currentLoggedInUser.organization.id,
    );
    const date = UtilsService.getPastDate(pageOptionsDto.days);

    const activities = await this.activityRepository
      .createQueryBuilder("activity")
      .innerJoinAndSelect(
        "activity.project",
        "project",
        "activity.projectId = :projectId",
        {
          projectId,
        },
      )
      .withDeleted()
      .leftJoinAndSelect("activity.user", "user")
      .leftJoinAndSelect(
        "activity.testSuite",
        "testSuite",
        "testSuite.deletedAt Is NULL",
      )
      .leftJoinAndSelect(
        "activity.milestone",
        "milestone",
        "milestone.deletedAt Is NULL",
      )
      .where("activity.entity != :entity", {
        entity: ActivityEntityType.TESTCASERESULT,
      })
      .andWhere("activity.createdAt >= :date", {
        date,
      })
      .orderBy("activity.createdAt", Order.DESC)
      .getMany();

    const result = this.groupActivitiesByDate(activities);
    return result;
  }

  /**
   * Internal method to group activities by date
   */
  groupActivitiesByDate(activities: ActivityEntity[]): ActivityListDto {
    const size = activities.length;
    const activityList = [];

    for (let i = 0; i < size; i++) {
      const activityDetail = [];
      const date = activities[i].createdAt.toDateString();

      while (true && i < size) {
        const sameActivityDate = activities[i].createdAt.toDateString();
        if (date === sameActivityDate) {
          activityDetail.push(activities[i].toDto());
          i += 1;
        } else {
          i -= 1;
          break;
        }
      }
      activityList.push(new ActivityDetailDto(date, activityDetail));
    }
    return new ActivityListDto(activityList);
  }

  /**
   * Get test case result activities for a project
   */

  async getTestCaseResultActivities(
    projectId: string,
    pageOptionsDto: ActivityPageOptionsDto,
    currentLoggedInUser: UserEntity,
  ): Promise<ActivityListDto> {
    await this.projectReadService.checkProjectForUser(
      projectId,
      currentLoggedInUser.organization.id,
    );
    const date = UtilsService.getPastDate(pageOptionsDto.days);

    const activities = await this.activityRepository
      .createQueryBuilder("activity")
      .innerJoinAndSelect(
        "activity.project",
        "project",
        "activity.projectId = :projectId",
        {
          projectId,
        },
      )
      .innerJoinAndSelect(
        "activity.testCaseResult",
        "testCaseResult",
        "testCaseResult.deletedAt Is NULL",
      )
      .withDeleted()
      .leftJoinAndSelect("activity.user", "user")
      .where("activity.entity = :entity", {
        entity: ActivityEntityType.TESTCASERESULT,
      })
      .andWhere("activity.createdAt >= :date", {
        date,
      })
      .orderBy("activity.createdAt", Order.ASC)
      .getMany();

    const activityList = this.groupActivitiesByDate(activities);

    const result = [];
    const activityListLength = activityList.data.length;

    for (let i = 0; i < activityListLength; i++) {
      const activityDetail = this.removeDuplicateTestCaseResultActivities(
        new Date(activityList.data[i].date),
        activityList.data[i].activities,
      );
      if (activityDetail) {
        result.push(activityDetail);
      }
    }
    return new ActivityListDto(result);
  }

  /**
   * Internal method to remove duplicate test case result activities
   */
  removeDuplicateTestCaseResultActivities(
    date: Date,
    activities: ActivityDto[],
  ): ActivityDetailDto {
    const activityDetail = [];
    const activitiesLength = activities.length;
    const checkIdExists: any = {};
    const dateString = date.toDateString();

    for (let j = activitiesLength - 1; j >= 0; j--) {
      const activity = activities[j];
      const testCaseResultId = activity.testCaseResult.id;
      const checkStatus = activity.status.match(
        /PASSED|FAILED|UNTESTED|BLOCKED/,
      );
      if (!checkIdExists[testCaseResultId] && checkStatus) {
        activityDetail.push(activity);
        checkIdExists[testCaseResultId] = 1;
      }
    }
    if (activityDetail.length) {
      return new ActivityDetailDto(dateString, activityDetail.reverse());
    }
  }

  /**
   * Creates a new milestone activity
   */
  async createMilestoneActivity(
    status: string,
    milestone: MilestoneEntity,
    project: ProjectEntity,
    currentLoggedInUser: UserEntity,
  ): Promise<ActivityDto> {
    const activity = this.activityRepository.create({ status });
    activity.name = milestone?.name;
    activity.entity = ActivityEntityType.MILESTONE;
    activity.project = project;
    activity.user = currentLoggedInUser;
    activity.milestone = milestone;
    const updatedActivity = await this.activityRepository.save(activity);
    return updatedActivity.toDto();
  }

  /**
   * Creates a new test suite activity
   */
  async createTestSuiteActivity(
    status: string,
    testSuite: TestSuiteEntity,
    project: ProjectEntity,
    currentLoggedInUser: UserEntity,
  ): Promise<ActivityDto> {
    const activity = this.activityRepository.create({ status });
    activity.name = testSuite?.name;
    activity.entity = ActivityEntityType.TESTRUN;
    activity.project = project;
    activity.user = currentLoggedInUser;
    activity.testSuite = testSuite;
    const updatedActivity = await this.activityRepository.save(activity);
    return updatedActivity.toDto();
  }

  /**
   * Creates a new test case result activity
   */
  async createTestCaseResultActivity(
    status: string,
    action: ActivityAction,
    testCaseResult: TestCaseResultEntity,
    testSuite: TestSuiteEntity,
    project: ProjectEntity,
    currentLoggedInUser: UserEntity,
  ): Promise<ActivityDto> {
    const activity = this.activityRepository.create({ status, action });
    activity.name = testCaseResult?.testCaseTitle;
    activity.entity = ActivityEntityType.TESTCASERESULT;
    activity.testCaseResult = testCaseResult;
    activity.testSuite = testSuite;
    activity.project = project;
    activity.user = currentLoggedInUser;
    const updatedActivity = await this.activityRepository.save(activity);
    return updatedActivity.toDto();
  }

  /**
   * Get all testcase changes activities for a project
   */
  async getAllTestCaseChangesActivities(
    projectId: string,
    pageOptionsDto: ActivityPageOptionsDto,
    currentLoggedInUser: UserEntity,
  ): Promise<ActivityListPageDto> {
    await this.projectReadService.checkProjectForUser(
      projectId,
      currentLoggedInUser.organization.id,
    );

    const requiredStatus = [
      TestCaseResultStatus.PASSED,
      TestCaseResultStatus.FAILED,
      TestCaseResultStatus.UNTESTED,
      TestCaseResultStatus.BLOCKED,
    ];

    const [activities, itemCount] = await this.activityRepository
      .createQueryBuilder("activity")
      .innerJoinAndSelect(
        "activity.project",
        "project",
        "activity.projectId = :projectId",
        {
          projectId,
        },
      )
      .innerJoinAndSelect(
        "activity.testCaseResult",
        "testCaseResult",
        "testCaseResult.deletedAt Is NULL",
      )
      .withDeleted()
      .leftJoinAndSelect("activity.user", "user")
      .where("activity.entity = :entity", {
        entity: ActivityEntityType.TESTCASERESULT,
      })
      .andWhere("activity.status IN (:...requiredStatus)", {
        requiredStatus,
      })
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.take)
      .orderBy("activity.createdAt", Order.DESC)
      .getManyAndCount();

    const result = this.groupActivitiesByDate(activities);

    return new ActivityListPageDto(
      result,
      new PageMetaDto({
        pageOptionsDto,
        itemCount,
      }),
    );
  }

  /**
   * Internal method to get testcase changes activities for projects
   */
  async getTestCaseChangesActivitiesByProjects(
    projectIds: string[],
    pageOptionsDto: ActivityPageOptionsDto,
  ): Promise<ActivityListDto> {
    const date = UtilsService.getPastDate(pageOptionsDto.days);

    const requiredStatus = [
      TestCaseResultStatus.PASSED,
      TestCaseResultStatus.FAILED,
      TestCaseResultStatus.UNTESTED,
      TestCaseResultStatus.BLOCKED,
    ];

    const activities = await this.activityRepository
      .createQueryBuilder("activity")
      .innerJoinAndSelect(
        "activity.project",
        "project",
        "activity.projectId IN (:...projectIds)",
        {
          projectIds,
        },
      )
      .innerJoinAndSelect(
        "activity.testCaseResult",
        "testCaseResult",
        "testCaseResult.deletedAt Is NULL",
      )
      .where("activity.entity = :entity", {
        entity: ActivityEntityType.TESTCASERESULT,
      })
      .andWhere("activity.status IN (:...requiredStatus)", {
        requiredStatus,
      })
      .andWhere("activity.createdAt >= :date", {
        date,
      })
      .orderBy("activity.createdAt", Order.ASC)
      .getMany();

    const result = this.groupActivitiesByDate(activities);
    return result;
  }

  /**
   * Internal method to get project test changes count
   */
  async getProjectsTestChangesCount(
    projectId: string,
    date: Date,
  ): Promise<number> {
    const requiredStatus = [
      TestCaseResultStatus.PASSED,
      TestCaseResultStatus.FAILED,
      TestCaseResultStatus.UNTESTED,
      TestCaseResultStatus.BLOCKED,
    ];

    const count = await this.activityRepository
      .createQueryBuilder("activity")
      .innerJoinAndSelect(
        "activity.project",
        "project",
        "project.deletedAt is Null AND project.id = :projectId",
        {
          projectId,
        },
      )
      .innerJoinAndSelect(
        "activity.testCaseResult",
        "testCaseResult",
        "testCaseResult.deletedAt Is NULL",
      )
      .where("activity.entity = :entity", {
        entity: ActivityEntityType.TESTCASERESULT,
      })
      .andWhere("activity.status In (:...requiredStatus)", {
        requiredStatus,
      })
      .andWhere("activity.createdAt >= :date", {
        date,
      })
      .getCount();
    return count;
  }

  async getUserActivitiesByUserId(userId: string): Promise<any> {
    return await this.activityRepository
      .createQueryBuilder("user_activities")
      .select()
      .where("user_activities.user_id =:userId", { userId })
      .getMany();
  }

  async updateUserActivtiesByUserId(updateActivites: any): Promise<boolean> {
    const updatedActivities =
      await this.activityRepository.save(updateActivites);
    if (updatedActivities) {
      return true;
    }
    return false;
  }

  async getTestSuitesActivitiesByTestSuitesId(
    testSuiteId: string,
  ): Promise<any> {
    return await this.activityRepository
      .createQueryBuilder("testSuites_activity")
      .select()
      .where("testSuites_activity.test_suite_id =:testSuiteId", { testSuiteId })
      .getMany();
  }

  async deleteActivites(activites: any): Promise<boolean> {
    const deletedActivites = await this.activityRepository.remove(activites);
    if (deletedActivites) {
      return true;
    }
    return false;
  }
}
