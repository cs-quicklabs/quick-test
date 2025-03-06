import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Permission } from "./permission.entity";

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) { }

  // Get all permissions
  async findAllPermissions(type = "web"): Promise<Permission[]> {
    return this.permissionRepository
      .createQueryBuilder("permissions")
      .select("permissions.permissionName")
      .where("permissions.type = :type", { type })
      .getMany();
  }

  // Get all permission for a specific role Id
  async findAllPermissionsByRoleId(roleId: number): Promise<Permission[]> {
    return this.permissionRepository.find({
      where: { roleId },
      select: ["permissionName"], // Fetch only necessary fields
    });
  }
}
