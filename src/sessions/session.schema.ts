// Mongoose schema for the Session collection.
//
// - Each login creates one session document
// - One user can have many sessions (multiple devices)
// - Refresh token is hashed before storing
// - Deleting a session = revoking access for that device
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../users/user.schema';

export type SessionDocument = Session & Document;

@Schema({ timestamps: true })
export class Session {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  refreshTokenHash: string;

  @Prop({ required: true, trim: true })
  deviceName: string;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
