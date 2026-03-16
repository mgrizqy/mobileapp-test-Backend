// Validates the request body for token refresh.
import { IsString } from 'class-validator';

export class RefreshDto {
  @IsString()
  userId: string;

  @IsString()
  refreshToken: string;
}
