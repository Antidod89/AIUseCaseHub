import { SetMetadata } from '@nestjs/common';
import { AppRole } from '../constants/role.enum';

// Ключ для хранения метаданных ролей
export const ROLES_KEY = 'roles';

// Декоратор для указания требуемых ролей на хендлере/контроллере
export const Roles = (...roles: AppRole[]) => SetMetadata(ROLES_KEY, roles);

