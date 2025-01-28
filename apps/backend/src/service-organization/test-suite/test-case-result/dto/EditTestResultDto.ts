import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsOptional,
  IsString,
  MaxLength,
  IsNotEmpty,
  IsBoolean,
} from "class-validator";

import { TestCaseResultStatus } from "../../../../common/enums/test-case-result-status";

export class EditTestResultDto {
  //@IsEnum(() => TestCaseResultStatus, { message: "Test result status can be 'PASSED', 'BLOCKED', 'RETEST', 'FAILED' or 'UNTESTED' only" })
  @IsNotEmpty({ message: "Status cannot be empty" })
  @IsOptional()
  @ApiPropertyOptional()
  status: () => TestCaseResultStatus;

  @MaxLength(500, { message: "Comment max size can be 500" })
  @IsString({ message: "Comment should be a string" })
  @IsNotEmpty({ message: "Comment cannot be empty" })
  @IsOptional()
  @ApiPropertyOptional({ type: String })
  comment: string;

  @IsString({ message: "Image should be a string" })
  @IsNotEmpty({ message: "Image cannot be empty" })
  @IsOptional()
  @ApiPropertyOptional({ type: String })
  image: string;

  @IsBoolean({ message: "Add comment jira should be a boolean" })
  @IsNotEmpty({ message: "Add comment jira cannot be empty" })
  @IsOptional()
  @ApiPropertyOptional({ type: Boolean })
  addCommentJira: boolean;
}
