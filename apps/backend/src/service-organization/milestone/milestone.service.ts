import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { FindOptionsWhere, Repository } from "typeorm";
import { ModuleRef } from "@nestjs/core";

import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "../../service-users/user/user.entity";
import { ValidatorService } from "../../shared/services/validator.service";
import { CreateMilestoneDto } from "./dto/CreateMilestoneDto";
import { UtilsService } from "../../_helpers/utils.service";
import { MilestoneEntity } from "./milestone.entity";
import { UpdateMilesoneStatusDto } from "./dto/UpdateMilestoneStatusDto";
import { MilestoneStatus } from "../../common/enums/milestone-status";
import { MilestoneDto } from "./dto/MilestoneDto";
import { MilestoneDetailsDto } from "./dto/MilestoneDetailDto";
import { EditMilestoneDto } from "./dto/EditMilestoneDto";
import { ActivityService } from "../project/activity/activity.service";
import { ActivityPageOptionsDto } from "../project/activity/dto/ActivityPageOptionsDto";
import { Order } from "../../common/enums/order";
import { ProjectEntity } from "../project/project.entity";
import { ProjectReadService } from "../project/services/read.service";

@Injectable()
export class MilestoneService {
  public activityService: ActivityService;

  public projectReadService: ProjectReadService;

  constructor(
    @InjectRepository(MilestoneEntity)
    public readonly milestoneRepository: Repository<MilestoneEntity>,
    public readonly validatorService: ValidatorService,
    public readonly moduleRef: ModuleRef,
  ) {}

  onModuleInit(): void {
    this.activityService = this.moduleRef.get(ActivityService, {
      strict: false,
    });
    this.projectReadService = this.moduleRef.get(ProjectReadService, {
      strict: false,
    });
  }

  /**
   * Internal method to Find single user
   */
  async findOne(
    findData: FindOptionsWhere<UserEntity>,
    relations?: string[],
  ): Promise<MilestoneEntity> {
    const milestone = await this.milestoneRepository.findOne({
      relations,
      where: findData,
    });
    return milestone;
  }

  /**
   * Find single milestone by id
   */
  async findMilestoneById(
    id: string,
    relation?: string,
  ): Promise<MilestoneEntity> {
    const queryBuilder =
      this.milestoneRepository.createQueryBuilder("milestone");
    if (relation) {
      queryBuilder.leftJoinAndSelect(`milestone.${relation}`, relation);
    }
    const milestone = await queryBuilder
      .where("milestone.id = :id", { id })
      .getOne();
    return milestone;
  }

  /**
   * Create a Milestone
   */

  async createMilestone(
    createMilestoneDto: CreateMilestoneDto,
    project: ProjectEntity,
    user: UserEntity,
  ): Promise<MilestoneEntity> {
    createMilestoneDto.name = UtilsService.titleCase(createMilestoneDto.name);
    const milestone = this.milestoneRepository.create(createMilestoneDto);
    milestone.project = project;
    const saveMilestone = await this.milestoneRepository.save(milestone);
    await this.activityService.createMilestoneActivity(
      "Created",
      milestone,
      project,
      user,
    );
    return saveMilestone;
  }

  /**
   * Internal method to delete section
   * for a project
   */
  async deleteMilestone(milestoneId: string): Promise<boolean> {
    const milestone = await this.milestoneRepository.findOne({
      relations: ["testsuites", "activities"],
      where: { id: milestoneId },
    });
    if (!milestone)
      throw new NotFoundException("translations.RECORD_NOT_FOUND");
    for (const activity of milestone.activities) {
      await this.activityService.deleteActivites(activity);
    }
    await this.milestoneRepository.remove(milestone);
    return true;
  }

  /*
   * Update Milestone status completed
   */
  async updateMilestoneStatus(
    updateMilesoneStatusDto: UpdateMilesoneStatusDto,
    milestoneId: string,
    currentLoggedInUser: UserEntity,
  ): Promise<MilestoneEntity> {
    const milestone = await this.milestoneRepository
      .createQueryBuilder("milestone")
      .leftJoinAndSelect("milestone.project", "project")
      .where("milestone.id = :milestoneId", { milestoneId })
      .getOne();
    if (!milestone)
      throw new NotFoundException("translations.RECORD_NOT_FOUND");

    if (updateMilesoneStatusDto.status !== MilestoneStatus.COMPLETED) {
      throw new BadRequestException("translations.MILESTONE_STATUS_INCORRECT");
    }
    milestone.completedAt = new Date();
    milestone.status = updateMilesoneStatusDto.status;
    const updatedMilestone = await this.milestoneRepository.save(milestone);
    await this.activityService.createMilestoneActivity(
      "COMPLETED",
      updatedMilestone,
      milestone.project,
      currentLoggedInUser,
    );
    return updatedMilestone;
  }

  /*
   * Update Milestone status completed
   */
  async editMilestone(
    editMilestoneDto: EditMilestoneDto,
    milestoneId: string,
  ): Promise<MilestoneEntity> {
    const milestone = await this.milestoneRepository.findOneBy({
      id: milestoneId,
    });
    if (!milestone)
      throw new NotFoundException("translations.RECORD_NOT_FOUND");
    if (editMilestoneDto.name) {
      milestone.name = UtilsService.titleCase(editMilestoneDto.name);
    }
    if (editMilestoneDto.description) {
      milestone.description = editMilestoneDto.description;
    }
    if (editMilestoneDto.status) {
      milestone.status = editMilestoneDto.status;
    }
    if (editMilestoneDto.startDate) {
      milestone.startDate = editMilestoneDto.startDate;
    }
    if (editMilestoneDto.endDate) {
      milestone.endDate = editMilestoneDto.endDate;
    }
    const updatedMilestone = await this.milestoneRepository.save(milestone);
    return updatedMilestone;
  }

  /**
   * Get all open milestone of a project
   */

  async getOpenMilestones(projectId: string): Promise<MilestoneDto[]> {
    const project = await this.projectReadService.findOne({ id: projectId });
    if (!project) throw new NotFoundException("translations.RECORD_NOT_FOUND");
    const milestone = await this.milestoneRepository
      .createQueryBuilder("milestone")
      .where("milestone.project_id = :projectId", {
        projectId,
      })
      .andWhere("milestone.status != :status", {
        status: MilestoneStatus.COMPLETED,
      })
      .orderBy("milestone.createdAt", Order.DESC)
      .getMany();

    return milestone.toDtos();
  }

  /**
   * Get not completed activity milestones of a project
   */

  async getActivityMilestones(
    projectId: string,
    pageOptionsDto: ActivityPageOptionsDto,
  ): Promise<MilestoneDto[]> {
    const date = UtilsService.getPastDate(pageOptionsDto.days);
    const project = await this.projectReadService.findOne({ id: projectId });
    if (!project) throw new NotFoundException("translations.RECORD_NOT_FOUND");
    const milestone = await this.milestoneRepository
      .createQueryBuilder("milestone")
      .where("milestone.project_id = :projectId", {
        projectId,
      })
      .andWhere("milestone.status != :status", {
        status: MilestoneStatus.COMPLETED,
      })
      .andWhere("milestone.createdAt >= :date", {
        date,
      })
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.take)
      .orderBy("milestone.createdAt", Order.DESC)
      .getMany();

    return milestone.toDtos();
  }

  /**
   * Get all milestone of a project
   */

  async getAllMilestones(projectId: string) {
    const project = await this.projectReadService.findOne({ id: projectId });
    if (!project) throw new NotFoundException("translations.RECORD_NOT_FOUND");
    const milestones = await this.milestoneRepository
      .createQueryBuilder("milestone")
      .where("milestone.project_id = :projectId", {
        projectId,
      })
      .leftJoinAndSelect("milestone.testsuites", "testsuites")
      .leftJoinAndSelect("testsuites.testreport", "testreport")
      .orderBy("milestone.createdAt", Order.DESC)
      .getMany();

    return milestones;
  }

  /**
   * Get milestone detail of a project
   */

  async milestoneDetail(milestoneId: string): Promise<MilestoneDetailsDto> {
    const milestone = await this.milestoneRepository
      .createQueryBuilder("milestone")
      .where("milestone.id = :milestoneId", {
        milestoneId,
      })
      .leftJoinAndSelect("milestone.testsuites", "testsuites")
      .leftJoinAndSelect("testsuites.testreport", "testreport")
      .getOne();

    return new MilestoneDetailsDto(milestone);
  }

  /**
   * Internal method to search milestones
   */
  async searchMilestones(
    name: string,
    currentLoggedInUser: UserEntity,
  ): Promise<MilestoneDetailsDto[]> {
    name = UtilsService.lowerCase(name);
    const projects = await this.projectReadService.findProjectsByOrganizationId(
      currentLoggedInUser.organization.id,
    );

    const projectIds = projects.map((project) => project.id);

    const milestones = await this.milestoneRepository
      .createQueryBuilder("milestones")
      .innerJoinAndSelect(
        "milestones.project",
        "project",
        "project.id IN (:...projectIds)",
        {
          projectIds,
        },
      )
      .where("LOWER(milestones.name) like :name", {
        name: `%${name}%`,
      })
      .orderBy("milestones.createdAt", Order.DESC)
      .getMany();
    const milestonesDetails = milestones.map(
      (milestone) => new MilestoneDetailsDto(milestone),
    );
    return milestonesDetails;
  }
}
