import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional } from "class-validator";
import { MilestoneEntity } from "../../milestone/milestone.entity";
import { TestSuiteStatus } from "../../../common/enums/test-suite-status";
import { UserEntity } from "../../../service-users/user/user.entity";
import { AbstractDto } from "../../../common/dto/AbstractDto";
import { TestSuiteEntity } from "../test-suite.entity";

export class TestSuiteDto extends AbstractDto {
  @IsNotEmpty({ message: "Name can not empty" })
  @ApiProperty({ type: String })
  name: string;

  @IsNotEmpty({ message: "Description can not empty" })
  @ApiProperty({ type: String })
  @IsOptional()
  description: string;

  @ApiProperty()
  status: () => TestSuiteStatus;

  assignedTo: UserEntity;

  user: UserEntity;

  milestoneId: MilestoneEntity;

  constructor(testSuite: TestSuiteEntity) {
    super(testSuite);
    this.name = testSuite.name;
    this.description = testSuite.description;
    this.status = testSuite.status;
    this.user = testSuite.user ? testSuite.user : null;
    this.assignedTo = testSuite.assignedTo ? testSuite.assignedTo : null;
    this.milestoneId = testSuite.milestoneId ? testSuite.milestoneId : null;
  }
}
