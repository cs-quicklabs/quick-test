import { Injectable } from "@nestjs/common";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { DataSource, EntitySubscriberInterface, Repository } from "typeorm";
import { UserEntity } from "./user.entity";

@Injectable()
export class UserSubscriber implements EntitySubscriberInterface {
  constructor(
    @InjectDataSource() readonly connection: DataSource,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {
    this.connection.subscribers.push(this);
  }

  /**
   * Indicates that this subscriber only listen to User events.
   */
  listenTo() {
    return UserEntity;
  }

  /**
   * Called before user insertion.
   */
  async afterLoad(user: UserEntity) {
    let fullName: string;
    if (user.archived_by) {
      const queryBuilder = this.userRepository.createQueryBuilder("user");
      const archivedByUser = await queryBuilder
        .where("user.id = :id", { id: user.archived_by })
        .getOne();
      user.archivedByUser = archivedByUser;
    }
    if (user && user.firstName) {
      fullName = user.lastName
        ? user.firstName.concat(" ").concat(user.lastName)
        : user.firstName;
      Object.assign(user, { fullName });
    } else {
      // do nothing
    }
  }
}
