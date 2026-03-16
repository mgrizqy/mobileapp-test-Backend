// Handles all authentication logic.
//
// - register: validate → create user
// - login: validate credentials → create session → return tokens
// - refresh: validate refresh token → rotate session → return new tokens
// - logout: delete session for current device
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { SessionsService } from '../sessions/sessions.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private sessionsService: SessionsService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(name: string, email: string, password: string) {
    const user = await this.usersService.create(name, email, password);
    return { message: 'Registration successful', userId: user._id };
  }

  async login(email: string, password: string, deviceName: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.generateTokens(user._id.toString(), user.role);
    await this.sessionsService.create(user._id.toString(), tokens.refreshToken, deviceName);

    return tokens;
  }

  async refresh(refreshToken: string) {
    // Extract userId from the refresh token itself — no need for client to send it separately
    const userId = await this.extractUserIdFromRefreshToken(refreshToken);

    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException();

    const session = await this.sessionsService.findMatchingSession(userId, refreshToken);

    // Rotate: delete old session, create new one with new refresh token
    await this.sessionsService.delete(session._id.toString());
    const tokens = await this.generateTokens(userId, user.role);
    await this.sessionsService.create(userId, tokens.refreshToken, session.deviceName);

    return tokens;
  }

  async logout(refreshToken: string) {
    // Extract userId from the refresh token itself — no need for client to send it separately
    const userId = await this.extractUserIdFromRefreshToken(refreshToken);

    const session = await this.sessionsService.findMatchingSession(userId, refreshToken);
    await this.sessionsService.delete(session._id.toString());
    return { message: 'Logged out successfully' };
  }

  private async extractUserIdFromRefreshToken(refreshToken: string): Promise<string> {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });

      // Guard against hand-crafted tokens that pass verification but omit sub
      if (!payload?.sub) throw new UnauthorizedException();

      return payload.sub as string;
    } catch {
      throw new UnauthorizedException();
    }
  }

  private async generateTokens(userId: string, role: string) {
    const payload = { sub: userId, role };

    const accessOptions: JwtSignOptions = {
      secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.getOrThrow<string>('JWT_ACCESS_EXPIRES_IN') as JwtSignOptions['expiresIn'],
    };

    const refreshOptions: JwtSignOptions = {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRES_IN') as JwtSignOptions['expiresIn'],
    };

    const accessToken = await this.jwtService.signAsync(payload, accessOptions);
    const refreshToken = await this.jwtService.signAsync(payload, refreshOptions);

    return { accessToken, refreshToken };
  }
}
