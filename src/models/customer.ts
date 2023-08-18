export interface CustomerInfo {
  zip?: string;
  address?: string;
  prefecture?: string;
  prefectureId?: number;
  email?: string;
  name?: string;
  location?: { lat: number; lng: number };
}
