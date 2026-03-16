// Auth feature module.
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { SessionsModule } from '../sessions/sessions.module';

@Module({
  imports: [
    JwtModule.register({}),
    UsersModule,
    SessionsModule,
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
