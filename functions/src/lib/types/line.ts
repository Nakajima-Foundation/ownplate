// LINE Login - ID Token verification response
// https://developers.line.biz/ja/reference/line-login/#verify-id-token
export interface LineVerifyResponse {
  iss: string;                    // Issuer (https://access.line.me)
  sub: string;                    // User ID
  aud: string;                    // Channel ID
  exp: number;                    // Expiration time (Unix timestamp)
  iat: number;                    // Issued at time (Unix timestamp)
  nonce?: string;                 // Nonce value
  amr?: string[];                 // Authentication Methods References
  name?: string;                  // User display name
  picture?: string;               // User profile image URL
  email?: string;                 // User email address
}

// LINE Login - Access token response
// https://developers.line.biz/ja/reference/line-login/#issue-access-token
export interface LineAccessTokenResponse {
  access_token: string;           // Access token
  expires_in: number;             // Access token expiration time (seconds)
  id_token?: string;              // ID token (JWT)
  refresh_token?: string;         // Refresh token
  scope: string;                  // Granted permissions (space-separated)
  token_type: string;             // Token type (typically "Bearer")
}

// LINE Messaging API - User profile response
// https://developers.line.biz/ja/reference/messaging-api/#get-profile
export interface LineProfileResponse {
  userId: string;                 // User ID
  displayName: string;            // Display name
  pictureUrl?: string;            // Profile image URL
  statusMessage?: string;         // Status message
  language?: string;              // Language (ISO 639-1)
}
