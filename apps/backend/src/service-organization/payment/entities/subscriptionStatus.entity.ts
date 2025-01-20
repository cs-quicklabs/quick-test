import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { AbstractEntity } from "../../../common/abstract.entity";
import { SubscriptionStatusDto } from "../dto/SubscriptionStatusDto";

@Entity({
  name: "subscription_status",
})
export class SubscriptionStatusEntity extends AbstractEntity<SubscriptionStatusDto> {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  customerId: string;

  @Column()
  orgId: string;

  @Column()
  subscriptionId: string;

  @Column({ type: Boolean })
  is_cancelled: boolean;

  @Column({ type: Boolean })
  is_active: boolean;

  dtoClass = SubscriptionStatusDto;
}
