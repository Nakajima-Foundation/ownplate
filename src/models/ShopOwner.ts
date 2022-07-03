export interface ShopOwnerData {
  partners?: string[];
  admin?: boolean;
  hidePrivacy: boolean;
}

export interface PartnerData {
  id: string;
  name: string;
  logo: string;
  ask: boolean;
}

export class ShopOwner {}
