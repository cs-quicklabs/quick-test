import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { OrgSubscriptionStatus } from "../../../common/enums/org-subscription-status";

export class UpdateOrganizationStatusDto {
  @IsEnum(OrgSubscriptionStatus, {
    message: "subscriptionStatus must be a valid OrgSubscriptionStatus",
  })
  @IsOptional()
  @ApiProperty({ enum: OrgSubscriptionStatus })
  subscriptionStatus: OrgSubscriptionStatus;
}
