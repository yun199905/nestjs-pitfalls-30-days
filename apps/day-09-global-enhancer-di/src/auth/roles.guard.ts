import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { AuthenticatedRequest } from './authenticated-request';
import { Role } from './role.enum';
import { ROLES_KEY } from './roles.decorator';
import { UserRolesService } from './user-roles.service';

// 兩個依賴都是 RolesGuard 真正需要的：
// Reflector 回答「這條路由要求什麼角色」，UserRolesService 回答「這個人現在有什麼角色」。
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly userRolesService: UserRolesService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 沒有標 @Roles() 的路由一律放行，這是每次都要做的選擇，不是預設就安全。
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userId = request.user?.id;

    if (userId === undefined) {
      return false;
    }

    const userRoles = this.userRolesService.getRoles(userId);

    return requiredRoles.some((role) => userRoles.includes(role));
  }
}
