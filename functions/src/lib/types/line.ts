// LINE API response types
export interface LineVerifyResponse {
  sub: string;
  nonce?: string;
  [key: string]: unknown;
}

export interface LineAccessTokenResponse {
  access_token: string;
  id_token?: string;
  [key: string]: unknown;
}

export interface LineProfileResponse {
  userId: string;
  displayName?: string;
  [key: string]: unknown;
}
