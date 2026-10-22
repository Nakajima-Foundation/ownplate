export interface OwnerData {
  name?: string;
  description?: string;
  images?: {
    cover?: { path?: string; resizedImages?: { [key: string]: string } };
    profile?: { path?: string; resizedImages?: { [key: string]: string } };
  };
  restCoverPhoto?: string;
}
