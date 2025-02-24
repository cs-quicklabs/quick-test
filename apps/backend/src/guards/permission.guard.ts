import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const routePermissions = this.reflector.get<string[]>(
      "permissions",
      context.getHandler(),
    );
    const { permissions } = context.switchToHttp().getRequest().user;
    const hasPermission = () =>
      routePermissions.every((routePermission) =>
        permissions.includes(routePermission),
      );
    return hasPermission();
  }
}
