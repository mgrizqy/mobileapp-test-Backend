// Decorator to specify which roles are allowed on a route.
// Usage: @Roles(Role.ADMIN)
import { SetMetadata } from '@nestjs/common';
import { Role } from '../../users/user.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
