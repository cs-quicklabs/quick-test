import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import { FindOptionsWhere, Repository } from "typeorm";

import { InjectRepository } from "@nestjs/typeorm";
import { PageMetaDto } from "../../../common/dto/PageMetaDto";
import { UtilsService } from "../../../_helpers/utils.service";
import { CreateSectionDto } from "./dto/CreateSectionDto";
import { SectionEntity } from "./section.entity";
import { EditSectionDto } from "./dto/EditSectionDto";
import { SectionPageOptionsDto } from "./dto/SectionPageOptionsDto";
import { SectionDto } from "./dto/SectionDto";
import { SectionPageDto } from "./dto/SectionPageDto";

import { TestCaseService } from "../test-case.service";
import { ProjectEntity } from "../../project/project.entity";
import { ExpectationFailedException } from "../../../exceptions/expectation-failed.exception";

@Injectable()
export class SectionService {
  public testCaseService: TestCaseService;

  constructor(
    @InjectRepository(SectionEntity)
    private readonly _sectionRepository: Repository<SectionEntity>,
    public readonly moduleRef: ModuleRef,
  ) {}

  onModuleInit(): void {
    this.testCaseService = this.moduleRef.get(TestCaseService, {
      strict: false,
    });
  }

  /**
   * Find a section
   */
  findOne(findData: FindOptionsWhere<SectionEntity>): Promise<SectionEntity> {
    if (findData.name) {
      findData.name = UtilsService.properCase(<string>findData.name);
    }
    return this._sectionRepository.findOne({
      relations: ["project"],
      where: findData,
    });
  }

  /**
   * Internal method to Find all sections for a project
   */
  async getAllSections(
    pageOptionsDto: SectionPageOptionsDto,
    projectId: string,
  ): Promise<SectionPageDto> {
    const [sections, itemCount] = await this._sectionRepository
      .createQueryBuilder("section")
      .select(["section.id", "section.name", "section.createdAt"])
      .where("section.project_id = :projectId", { projectId })
      .orderBy("section.createdAt", pageOptionsDto.order)
      .getManyAndCount();

    const pageMetaDto = new PageMetaDto({
      pageOptionsDto,
      itemCount,
    });
    return new SectionPageDto(sections.toDtos(), pageMetaDto);
  }

  /**
   * Internal method to Find all sections
   * for a project with testcases
   */
  async getSectionsWithTestcases(projectId: string): Promise<SectionDto[]> {
    const sections = await this._sectionRepository
      .createQueryBuilder("sections")
      .select()
      .leftJoinAndSelect(
        "sections.testcases",
        "testcases",
        "testcases.deletedAt IS NULL",
      )
      .leftJoinAndSelect("testcases.createdBy", "createdBy")
      .leftJoinAndSelect("testcases.updatedBy", "updatedBy")
      .where("sections.project_id = :projectId", {
        projectId,
      })
      .orderBy("sections.createdAt")
      .addOrderBy("testcases.priority")
      .getMany();

    return sections.toDtos();
  }

  /**
   * Internal method to add new section for a project
   */
  async addSection(
    createSectionDto: CreateSectionDto,
    project: ProjectEntity,
  ): Promise<SectionEntity> {
    createSectionDto.name = UtilsService.titleCase(createSectionDto.name);
    if (createSectionDto.name === "Unassigned") {
      throw new ForbiddenException("translations.DEFAULT_SECTION");
    }
    if (
      project.sections?.length &&
      project.sections[0].name === createSectionDto.name
    ) {
      throw new BadRequestException("translations.DUPLICATE_RECORD");
    }
    const section = this._sectionRepository.create(createSectionDto);
    section.project = project;
    const newSection = await this._sectionRepository.save(section);
    return newSection;
  }

  /**
   * Internal method to update section for project
   */
  async editSection(
    editSectionDto: EditSectionDto,
    section: SectionEntity,
    project: ProjectEntity,
  ): Promise<SectionEntity> {
    if (!section) throw new NotFoundException("translations.RECORD_NOT_FOUND");
    if (section.name === "Unassigned")
      throw new ForbiddenException("translations.DEFAULT_SECTION");
    const updateDoc: any = {};
    if (editSectionDto.name) {
      updateDoc.name = UtilsService.titleCase(editSectionDto.name);
      if (updateDoc.name === "Unassigned")
        throw new ForbiddenException("translations.DEFAULT_SECTION");
      const checkDuplicateSection = await this._sectionRepository
        .createQueryBuilder("section")
        .where("section.name = :name", { name: updateDoc.name })
        .andWhere("section.project_id = :id", { id: project.id })
        .getOne();
      if (checkDuplicateSection)
        throw new BadRequestException("translations.DUPLICATE_RECORD");
      section.name = updateDoc.name;
    }
    if (Object.keys(editSectionDto).includes("description")) {
      updateDoc.description = editSectionDto.description;
      section.description = updateDoc.description;
    }
    const res = await this._sectionRepository.update(
      { id: section.id },
      updateDoc,
    );
    if (!res?.affected)
      throw new ExpectationFailedException("translations.RECORD_UPDATE_FAILED");
    return section;
  }

  /**
   * Internal method to check section
   * exists for a project
   */
  async checkSectionForProject(
    sectionId: string,
    projectId: string,
  ): Promise<SectionEntity> {
    const section = await this._sectionRepository
      .createQueryBuilder("section")
      .where("section.id = :sectionId", { sectionId })
      .andWhere("section.project_id = :projectId", { projectId })
      .getOne();
    if (!section) throw new NotFoundException("translations.RECORD_NOT_FOUND");
    if (section.projectId !== projectId)
      throw new ForbiddenException("translations.ACCESS_DENIED");
    return section;
  }

  /**
   * Internal method to get sections by sections id and project id
   */
  async getSectionsByProjectIdAndSectionId(
    sectionIds: string[],
    projectId: string,
  ): Promise<SectionDto[]> {
    if (!projectId || !sectionIds.length) {
      throw new NotFoundException("translations.RECORD_NOT_FOUND");
    }
    const sections = await this._sectionRepository
      .createQueryBuilder("section")
      .innerJoinAndSelect(
        "section.project",
        "project",
        "project.id = :projectId",
        {
          projectId,
        },
      )
      .leftJoinAndSelect(
        "section.testcases",
        "testcases",
        "testcases.deletedAt is NULL",
      )
      .where("section.id IN (:...sectionIds)", {
        sectionIds,
      })
      .orderBy("section.createdAt")
      .addOrderBy("testcases.priority")
      .getMany();
    if (!sections.length)
      throw new NotFoundException("translations.RECORD_NOT_FOUND");
    return sections.toDtos();
  }

  /**
   * Internal method to get default section
   * for a project
   */
  async getDefaultSection(projectId: string): Promise<SectionEntity> {
    const section = await this._sectionRepository
      .createQueryBuilder("section")
      .where("section.project_id = :projectId", {
        projectId,
      })
      .andWhere("section.name = :name", {
        name: "Unassigned",
      })
      .getOne();
    if (!section) throw new NotFoundException("translations.RECORD_NOT_FOUND");
    return section;
  }

  /**
   * Internal method to add new default section
   * for a project
   */
  async addDefaultSection(
    createSectionDto: CreateSectionDto,
    project: ProjectEntity,
  ): Promise<SectionEntity> {
    const section = this._sectionRepository.create(createSectionDto);
    section.project = project;
    const newSection = await this._sectionRepository.save(section);
    return newSection;
  }

  /**
   * Internal method to delete section
   * for a project
   */
  async deleteSection(section: SectionEntity): Promise<boolean> {
    if (!section) throw new NotFoundException("translations.RECORD_NOT_FOUND");
    if (section.name === "Unassigned")
      throw new ForbiddenException("translations.DEFAULT_SECTION");

    const response = await this.testCaseService.deleteTestCasesBySection(
      section.id,
    );
    if (!response) return false;

    const deletedSection = await this._sectionRepository.softRemove(section);
    if (deletedSection) return true;
    throw new ExpectationFailedException("translations.RECORD_DELETE_FAILED");
  }

  /*
        Re-order Priorities
    */
  async reOrderPriorities(
    sectionId: string,
    testCaseId: string,
    newPosition: number,
  ): Promise<boolean> {
    const section = await this._sectionRepository
      .createQueryBuilder("sections")
      .where("sections.id = :id", { id: sectionId })
      .getOne();

    if (!section) {
      return false;
    }
    const testCases = await this.testCaseService.reOrderPriorities(
      sectionId,
      testCaseId,
      Number(newPosition),
    );
    if (testCases) {
      return true;
    }
    throw new ExpectationFailedException("translations.REORDER_FAILED");
  }
}
