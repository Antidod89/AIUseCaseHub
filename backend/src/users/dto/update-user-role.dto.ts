import { IsEnum } from 'class-validator';
import { AppRole } from '../../common/constants/role.enum';

// DTO для смены роли пользователя
export class UpdateUserRoleDto {
  @IsEnum(AppRole)
  role: AppRole;
}

