// Validates the request body for token refresh.
// Validates the request body for token refresh and logout.
// userId is intentionally absent — the backend extracts it from the refresh token payload.
import { IsString } from 'class-validator';

export class RefreshDto {
  @IsString()
  refreshToken: string;
}
