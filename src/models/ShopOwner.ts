import type { Timestamp } from "./firebaseUtils";

// admins/:uid。管理アカウントの登録（SignUpPage.vue）が name・created・partners を書き、
// super 画面が custom claim の写し（admin / operator。functions の super.ts）と opt_out を書き足す。
// hidePrivacy はこのリポジトリに書き手が無い。無い文書は false として読む（getShopOwner）。
export interface ShopOwnerData {
  name?: string;
  created?: Timestamp;
  partners?: string[];
  admin?: boolean;
  operator?: boolean;
  opt_out?: boolean;
  hidePrivacy?: boolean;
}

// admins/:uid/private/profile。管理アカウントの登録（SignUpPage.vue）が書く。
export interface AdminPrivateProfileData {
  email: string;
  updated: Timestamp;
}

export interface PartnerData {
  id: string;
  name: string;
  logo: string;
  ask: boolean;
}

export class ShopOwner {}
