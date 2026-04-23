export interface OwnerData {
  images?: {
    cover?: { path?: string; resizedImages?: { [key: string]: string } };
    profile?: { path?: string; resizedImages?: { [key: string]: string } };
  };
  restCoverPhoto?: string;
}
