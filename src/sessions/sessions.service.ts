// Handles all database operations related to sessions.
//
// - create: hash refresh token → save new session
// - findByUserId: get all sessions for a user (device list screen)
// - findMatchingSession: find session where refresh token matches (for token refresh)
// - delete: revoke a single session by ID
// - deleteAllForUser: revoke all sessions (logout everywhere)
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Session, SessionDocument } from './session.schema';

@Injectable()
export class SessionsService {
  constructor(
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
  ) {}

  async create(userId: string, refreshToken: string, deviceName: string): Promise<SessionDocument> {
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    const session = new this.sessionModel({
      userId: new Types.ObjectId(userId),
      refreshTokenHash,
      deviceName,
    });
    return session.save();
  }

  async findByUserId(userId: string): Promise<SessionDocument[]> {
    return this.sessionModel.find({ userId: new Types.ObjectId(userId) }).select('-refreshTokenHash -__v');
  }

  async findMatchingSession(userId: string, refreshToken: string): Promise<SessionDocument> {
    // Must NOT use findByUserId here — that method strips refreshTokenHash for public responses.
    // We need the hash to verify the token, so we query directly with no field exclusions.
    const sessions = await this.sessionModel.find({ userId: new Types.ObjectId(userId) });

    for (const session of sessions) {
      const matches = await bcrypt.compare(refreshToken, session.refreshTokenHash);
      if (matches) return session;
    }

    throw new UnauthorizedException('Invalid refresh token');
  }

  async delete(sessionId: string): Promise<void> {
    await this.sessionModel.findByIdAndDelete(sessionId);
  }

  async deleteAllForUser(userId: string): Promise<void> {
    await this.sessionModel.deleteMany({ userId: new Types.ObjectId(userId) });
  }
}
