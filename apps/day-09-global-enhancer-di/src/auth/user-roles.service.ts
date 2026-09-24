import { Injectable } from '@nestjs/common';
import { Role } from './role.enum';

// 代表實務上會去查 user_roles 資料表的服務，這裡用記憶體資料取代資料庫。
// 角色不放進 token，改成授權當下才查，撤銷權限才不必等舊 token 過期。
@Injectable()
export class UserRolesService {
  private readonly roles = new Map<number, Role[]>([
    [1, [Role.User]],
    [2, [Role.User, Role.Admin]],
  ]);

  getRoles(userId: number): Role[] {
    return this.roles.get(userId) ?? [];
  }
}
