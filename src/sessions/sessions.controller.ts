// Exposes protected session endpoints.
//
// GET    /api/sessions     → list all active sessions for current user
// DELETE /api/sessions/:id → revoke a specific session by ID
import { Controller, Delete, Get, Param, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../common/guards/jwt.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SessionsService } from './sessions.service';

@UseGuards(JwtGuard)
@Controller('sessions')
export class SessionsController {
  constructor(private sessionsService: SessionsService) {}

  @Get()
  getSessions(@CurrentUser() user: { userId: string }) {
    return this.sessionsService.findByUserId(user.userId);
  }

  @Delete(':id')
  revokeSession(@Param('id') id: string) {
    return this.sessionsService.delete(id);
  }
}
